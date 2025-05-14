// Simple in-memory store for invoices (in a real app, this would use a database)
class InvoiceStore {
  constructor() {
    this.invoices = [];
    this.nextId = 1;

    // Add some sample invoices
    this.addSampleInvoices();
  }

  // Add sample invoices for demonstration purposes
  addSampleInvoices() {
    const sampleInvoices = [
      {
        date: '2025-05-10',
        description: 'Office Supplies',
        quantity: 3,
        paymentMethod: 'credit',
        currency: 'USD',
        invoiceNumber: 'INV-001',
        vatPercentage: 20,
        price: 75
      },
      {
        date: '2025-05-12',
        description: 'Software License',
        quantity: 1,
        paymentMethod: 'bank',
        currency: 'USD',
        invoiceNumber: 'INV-002',
        vatPercentage: 20,
        price: 299
      },
      {
        date: '2025-05-13',
        description: 'Consulting Services',
        quantity: 5,
        paymentMethod: 'bank',
        currency: 'USD',
        invoiceNumber: 'INV-003',
        vatPercentage: 20,
        price: 150
      }
    ];

    // Create each sample invoice
    sampleInvoices.forEach(invoice => this.create(invoice));

    console.log(`Added ${sampleInvoices.length} sample invoices`);
  }

  create(invoiceData) {
    const {
      date,
      description,
      quantity,
      paymentMethod,
      currency,
      invoiceNumber,
      vatPercentage,
      price
    } = invoiceData;

    // Calculate total amount
    const subtotal = quantity * price;
    const vatAmount = subtotal * (vatPercentage / 100);
    const totalAmount = subtotal + vatAmount;

    const invoice = {
      id: this.nextId++,
      date,
      description,
      quantity,
      paymentMethod,
      currency,
      invoiceNumber,
      vatPercentage,
      price,
      subtotal,
      vatAmount,
      totalAmount,
      createdAt: new Date().toISOString()
    };

    this.invoices.push(invoice);
    return invoice;
  }

  findAll() {
    return this.invoices;
  }

  findById(id) {
    return this.invoices.find(invoice => invoice.id === id);
  }

  deleteById(id) {
    const index = this.invoices.findIndex(invoice => invoice.id === id);
    if (index !== -1) {
      const deletedInvoice = this.invoices[index];
      this.invoices.splice(index, 1);
      return deletedInvoice;
    }
    return null;
  }
}

export default new InvoiceStore();
