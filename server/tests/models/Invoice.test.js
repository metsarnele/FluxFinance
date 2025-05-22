import { describe, test, expect } from 'bun:test';
import InvoiceStore from '../../models/Invoice.js';

describe('Invoice Model', () => {
  test('should calculate total amount correctly', () => {
    const invoiceData = {
      date: '2025-05-15',
      description: 'Test invoice',
      quantity: 2,
      price: 100,
      paymentMethod: 'bank',
      currency: 'USD',
      invoiceNumber: 'TEST-001',
      vatPercentage: 20
    };
    
    const invoice = InvoiceStore.create(invoiceData);
    
    // 2 * 100 = 200, then add 20% VAT = 240
    expect(invoice.totalAmount).toBe(240);
  });
  
  test('should store and retrieve invoices', () => {
    // Clear any existing invoices for this test
    InvoiceStore.invoices = [];
    InvoiceStore.nextId = 1;
    
    const invoiceData = {
      date: '2025-05-16',
      description: 'Test invoice retrieval',
      quantity: 3,
      price: 50,
      paymentMethod: 'card',
      currency: 'EUR',
      invoiceNumber: 'TEST-002',
      vatPercentage: 10
    };
    
    const createdInvoice = InvoiceStore.create(invoiceData);
    const retrievedInvoice = InvoiceStore.findById(createdInvoice.id);
    
    expect(retrievedInvoice).toEqual(createdInvoice);
    expect(retrievedInvoice.totalAmount).toBe(165); // 3 * 50 = 150, then add 10% VAT = 165
  });
});
