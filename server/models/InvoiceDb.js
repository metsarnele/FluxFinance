import { getDbConnection } from '../config/database.js';

class InvoiceDb {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Wait a bit to ensure the database is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.db = await getDbConnection();
      this.initialized = true;
      console.log('InvoiceDb initialized');

      // Add sample invoices if the table is empty
      await this.addSampleInvoicesIfEmpty();
    } catch (error) {
      console.error('Error initializing InvoiceDb:', error);
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
    return this.db;
  }

  // Add sample invoices for demonstration purposes if the table is empty
  async addSampleInvoicesIfEmpty() {
    try {
      const db = await this.ensureInitialized();

      // Check if the invoices table is empty
      const count = await db.get('SELECT COUNT(*) as count FROM invoices');

      if (count.count === 0) {
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
        for (const invoice of sampleInvoices) {
          await this.create(invoice);
        }

        console.log(`Added ${sampleInvoices.length} sample invoices to the database`);
      }
    } catch (error) {
      console.error('Error adding sample invoices:', error);
    }
  }

  async create(invoiceData) {
    try {
      const db = await this.ensureInitialized();

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
      const createdAt = new Date().toISOString();

      // Insert the invoice into the database
      const result = await db.run(
        `INSERT INTO invoices (
          date, description, quantity, paymentMethod, currency,
          invoiceNumber, vatPercentage, price, subtotal,
          vatAmount, totalAmount, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          date, description, quantity, paymentMethod, currency,
          invoiceNumber, vatPercentage, price, subtotal,
          vatAmount, totalAmount, createdAt
        ]
      );

      // Get the inserted invoice with its ID
      const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', result.lastID);

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const db = await this.ensureInitialized();
      return await db.all('SELECT * FROM invoices ORDER BY id DESC');
    } catch (error) {
      console.error('Error finding all invoices:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const db = await this.ensureInitialized();
      return await db.get('SELECT * FROM invoices WHERE id = ?', id);
    } catch (error) {
      console.error(`Error finding invoice with id ${id}:`, error);
      throw error;
    }
  }

  async deleteById(id) {
    try {
      const db = await this.ensureInitialized();

      // Get the invoice before deleting it
      const invoice = await this.findById(id);

      if (!invoice) {
        return null;
      }

      // Delete the invoice
      await db.run('DELETE FROM invoices WHERE id = ?', id);

      return invoice;
    } catch (error) {
      console.error(`Error deleting invoice with id ${id}:`, error);
      throw error;
    }
  }
}

export default new InvoiceDb();
