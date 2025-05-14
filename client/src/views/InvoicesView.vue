<template>
  <div class="invoices">
    <div class="invoices-header">
      <h2>Purchase Invoices</h2>
      <button @click="openNewInvoiceModal" class="btn">New Invoice</button>
    </div>

    <div v-if="loading" class="loading">Loading invoices...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="invoices.length === 0" class="empty-state">
      <p>No invoices found. Create your first invoice by clicking the "New Invoice" button.</p>
    </div>
    <div v-else class="invoices-list">
      <div v-for="invoice in invoices" :key="invoice.id" class="invoice-item">
        <div class="invoice-details">
          <h3>
            <router-link :to="`/invoices/${invoice.id}`">
              Invoice #{{ invoice.id }}
            </router-link>
          </h3>
          <p class="invoice-date">{{ formatDate(invoice.date) }}</p>
          <p class="invoice-description">{{ invoice.description }}</p>
        </div>
        <div class="invoice-actions">
          <div class="invoice-amount">
            ${{ invoice.amount.toFixed(2) }}
          </div>
          <button
            @click="confirmDeleteInvoice(invoice)"
            class="delete-btn"
            title="Delete invoice"
            aria-label="Delete invoice"
          >
            &times;
          </button>
        </div>
      </div>
    </div>

    <!-- New Invoice Modal (placeholder) -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>New Purchase Invoice</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveInvoice">
            <div class="form-group">
              <label for="date">Date</label>
              <input type="date" id="date" v-model="newInvoice.date" required>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <input type="text" id="description" v-model="newInvoice.description" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="quantity">Quantity</label>
                <input type="number" id="quantity" v-model.number="newInvoice.quantity" min="1" required>
              </div>

              <div class="form-group">
                <label for="price">Price</label>
                <input type="number" id="price" v-model.number="newInvoice.price" min="0" step="0.01" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="payment-method">Payment Method</label>
                <select id="payment-method" v-model="newInvoice.paymentMethod" required>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div class="form-group">
                <label for="currency">Currency</label>
                <select id="currency" v-model="newInvoice.currency" required>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="invoice-number">Invoice Number</label>
                <input type="text" id="invoice-number" v-model="newInvoice.invoiceNumber" required>
              </div>

              <div class="form-group">
                <label for="vat">VAT Percentage</label>
                <input type="number" id="vat" v-model.number="newInvoice.vatPercentage" min="0" max="100" required>
              </div>
            </div>

            <div class="form-group total-amount">
              <label>Total Amount:</label>
              <div class="calculated-total">${{ calculateTotal().toFixed(2) }}</div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="closeDeleteModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this invoice?</p>
          <p class="invoice-to-delete">
            <strong>Invoice #{{ invoiceToDelete?.id }}</strong>: {{ invoiceToDelete?.description }}
          </p>
          <div class="form-actions">
            <button type="button" @click="closeDeleteModal" class="btn-secondary">Cancel</button>
            <button type="button" @click="deleteInvoice" class="btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoicesView',
  data() {
    return {
      invoices: [],
      loading: true,
      error: null,
      showModal: false,
      showDeleteModal: false,
      invoiceToDelete: null,
      isDeleting: false,
      newInvoice: {
        date: new Date().toISOString().split('T')[0],
        description: '',
        quantity: 1,
        price: 0,
        paymentMethod: 'bank',
        currency: 'USD',
        invoiceNumber: '',
        vatPercentage: 20
      }
    }
  },

  mounted() {
    this.fetchInvoices();
  },
  methods: {
    async fetchInvoices() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Fetching invoices...');
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('No authentication token found');
          this.error = 'Authentication required';
          this.loading = false;
          return;
        }

        console.log('Using token:', token.substring(0, 10) + '...');

        try {
          const response = await fetch('http://localhost:3000/api/invoices', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Response received:', { status: response.status, ok: response.ok });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response data:', errorData);
            throw new Error(errorData.error || 'Failed to fetch invoices');
          }

          const data = await response.json();
          console.log('Invoices data received:', data);

          this.invoices = data.map(invoice => ({
            ...invoice,
            amount: invoice.totalAmount // Map totalAmount to amount for display
          }));

          console.log('Processed invoices:', this.invoices);
        } catch (fetchError) {
          console.error('Fetch error details:', fetchError);
          throw fetchError;
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
        this.error = err.message || 'Failed to load invoices';
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    openNewInvoiceModal() {
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    calculateTotal() {
      const subtotal = this.newInvoice.quantity * this.newInvoice.price;
      const vat = subtotal * (this.newInvoice.vatPercentage / 100);
      return subtotal + vat;
    },

    async saveInvoice() {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          this.error = 'Authentication required';
          return;
        }

        const response = await fetch('http://localhost:3000/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.newInvoice)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create invoice');
        }

        const savedInvoice = await response.json();

        // Add the new invoice to the list with amount mapped from totalAmount
        this.invoices.push({
          ...savedInvoice,
          amount: savedInvoice.totalAmount
        });

        this.closeModal();

        // Reset form
        this.newInvoice = {
          date: new Date().toISOString().split('T')[0],
          description: '',
          quantity: 1,
          price: 0,
          paymentMethod: 'bank',
          currency: 'USD',
          invoiceNumber: '',
          vatPercentage: 20
        };
      } catch (err) {
        console.error('Error saving invoice:', err);
        this.error = err.message || 'Failed to save invoice';
      }
    },

    confirmDeleteInvoice(invoice) {
      this.invoiceToDelete = invoice;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.invoiceToDelete = null;
    },

    async deleteInvoice() {
      if (!this.invoiceToDelete) return;

      this.isDeleting = true;

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          this.error = 'Authentication required';
          this.isDeleting = false;
          return;
        }

        const response = await fetch(`http://localhost:3000/api/invoices/${this.invoiceToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete invoice');
        }

        // Remove the invoice from the list
        this.invoices = this.invoices.filter(invoice => invoice.id !== this.invoiceToDelete.id);

        // Close the modal
        this.closeDeleteModal();
      } catch (err) {
        console.error('Error deleting invoice:', err);
        this.error = err.message || 'Failed to delete invoice';
      } finally {
        this.isDeleting = false;
      }
    }
  }
}
</script>

<style scoped>
.invoices {
  max-width: 1000px;
  margin: 0 auto;
}

.invoices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.invoice-details h3 {
  margin: 0 0 0.5rem 0;
}

.invoice-date {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.invoice-description {
  margin: 0;
}

.invoice-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invoice-amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.delete-modal .modal-content {
  max-width: 400px;
}

.invoice-to-delete {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.loading, .error {
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.loading {
  background-color: #e9f7fe;
  color: #3498db;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.total-amount {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calculated-total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
