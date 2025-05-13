// Simple in-memory store for invoices (in a real app, this would use a database)
class InvoiceStore {
  constructor() {
    this.invoices = [];
    this.nextId = 1;
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
}

export default new InvoiceStore();
