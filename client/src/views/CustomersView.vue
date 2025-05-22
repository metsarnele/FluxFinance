<template>
  <div class="customers-view">
    <div class="header">
      <h2>Customers</h2>
      <button @click="openNewCustomerModal" class="new-customer-btn">New Customer</button>
    </div>
    
    <div class="customers-list" v-if="customers.length > 0">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>{{ customer.name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.address }}</td>
            <td>{{ formatDate(customer.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="empty-state" v-else>
      <p>No customers yet. Click "New Customer" to add one.</p>
    </div>
    
    <!-- New Customer Modal -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>New Customer</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCustomer">
            <div class="form-group">
              <label for="name">Customer Name*</label>
              <input 
                type="text" 
                id="name" 
                v-model="newCustomer.name" 
                required
                placeholder="Enter customer name"
              >
            </div>
            
            <div class="form-group">
              <label for="email">Email*</label>
              <input 
                type="email" 
                id="email" 
                v-model="newCustomer.email" 
                required
                placeholder="Enter email address"
              >
            </div>
            
            <div class="form-group">
              <label for="address">Address</label>
              <textarea 
                id="address" 
                v-model="newCustomer.address" 
                placeholder="Enter address"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
              <button type="submit" class="save-btn" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomersView',
  data() {
    return {
      customers: [],
      showModal: false,
      isSaving: false,
      newCustomer: {
        name: '',
        email: '',
        address: ''
      },
      error: null,
      token: null
    }
  },
  created() {
    // Get token and fetch customers
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.fetchCustomers();
    }
  },
  methods: {
    async fetchCustomers() {
      try {
        this.token = localStorage.getItem('token');
        if (!this.token) return;
        
        console.log('Fetching customers...');
        
        const response = await fetch('/api/customers', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        console.log('Customers fetched:', data);
        this.customers = data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        this.error = 'Failed to load customers. Please try again.';
      }
    },
    
    openNewCustomerModal() {
      this.showModal = true;
      // Reset form
      this.newCustomer = {
        name: '',
        email: '',
        address: ''
      };
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    async saveCustomer() {
      if (!this.newCustomer.name || !this.newCustomer.email) {
        alert('Name and email are required fields');
        return;
      }
      
      try {
        this.isSaving = true;
        this.token = localStorage.getItem('token');
        
        if (!this.token) {
          throw new Error('Authentication required');
        }
        
        console.log('Saving customer:', this.newCustomer);
        
        // Get a fresh token
        this.token = localStorage.getItem('token');
        console.log('Using token:', this.token ? 'Token exists (not showing for security)' : 'No token');
        
        // Use relative URL with proxy
        const apiUrl = '/api/customers';
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(this.newCustomer),
          credentials: 'include' // Include cookies if any
        });
        
        console.log('Response status:', response.status);
        
        
        // Check if the response is ok before trying to parse JSON
        if (!response.ok) {
          let errorMessage = 'Failed to create customer';
          try {
            // Only try to parse JSON if there's content
            const text = await response.text();
            if (text) {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        // Get the response text first
        const text = await response.text();
        
        // Only try to parse if there's content
        let newCustomer;
        if (text) {
          try {
            newCustomer = JSON.parse(text);
            console.log('Customer created:', newCustomer);
          } catch (e) {
            console.error('Error parsing success response:', e);
            throw new Error('Invalid response from server');
          }
        } else {
          // If no response body, assume success and refresh the list
          console.log('Customer created (no response body)');
        }
        
        // Close the modal
        this.closeModal();
        
        // Refresh the customer list to ensure we have the latest data
        await this.fetchCustomers();
      } catch (error) {
        console.error('Error creating customer:', error);
        this.error = error.message || 'Failed to create customer. Please try again.';
        alert('Error creating customer: ' + (error.message || 'Unknown error'));
      } finally {
        this.isSaving = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    }
  }
}
</script>

<style scoped>
.customers-view {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.new-customer-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-customer-btn:hover {
  background-color: #45a049;
}

.customers-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.empty-state {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  color: #666;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #333;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
