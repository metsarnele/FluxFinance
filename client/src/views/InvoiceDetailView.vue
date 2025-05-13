<template>
  <div class="invoice-detail">
    <h2>Invoice #{{ $route.params.id }}</h2>
    
    <div v-if="loading" class="loading">Loading invoice data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="invoice" class="invoice-data">
      <div class="invoice-header">
        <div class="invoice-info">
          <p><strong>Date:</strong> {{ formatDate(invoice.date) }}</p>
          <p><strong>Invoice Number:</strong> {{ invoice.invoiceNumber }}</p>
        </div>
        <div class="invoice-amount">
          <h3>Total: ${{ invoice.totalAmount.toFixed(2) }}</h3>
        </div>
      </div>
      
      <div class="invoice-details">
        <h4>Details</h4>
        <div class="detail-row">
          <p><strong>Description:</strong> {{ invoice.description }}</p>
        </div>
        <div class="detail-row">
          <p><strong>Quantity:</strong> {{ invoice.quantity }}</p>
          <p><strong>Price:</strong> ${{ invoice.price.toFixed(2) }}</p>
        </div>
        <div class="detail-row">
          <p><strong>Payment Method:</strong> {{ invoice.paymentMethod }}</p>
          <p><strong>Currency:</strong> {{ invoice.currency }}</p>
        </div>
        <div class="detail-row">
          <p><strong>Subtotal:</strong> ${{ invoice.subtotal.toFixed(2) }}</p>
          <p><strong>VAT ({{ invoice.vatPercentage }}%):</strong> ${{ invoice.vatAmount.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoiceDetailView',
  data() {
    return {
      invoice: null,
      loading: true,
      error: null
    }
  },
  mounted() {
    this.fetchInvoice()
  },
  methods: {
    async fetchInvoice() {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          this.error = 'Authentication required'
          this.loading = false
          return
        }
        
        const response = await fetch(`http://localhost:3000/api/invoices/${this.$route.params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invoice')
        }
        
        this.invoice = data
      } catch (err) {
        this.error = err.message || 'An error occurred while loading the invoice'
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.invoice-detail {
  max-width: 800px;
  margin: 0 auto;
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

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.invoice-amount h3 {
  color: #2c3e50;
  font-size: 1.5rem;
}

.invoice-details {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.invoice-details h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-row p {
  margin: 0;
}
</style>
