// Test script to create an invoice and list all invoices
import fetch from 'node-fetch';

async function createTestInvoice() {
  try {
    // First, get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'correctpassword'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Got authentication token');
    
    // Create a test invoice
    const invoiceResponse = await fetch('http://localhost:3000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: '2025-05-13',
        description: 'Test Invoice',
        quantity: 2,
        paymentMethod: 'bank',
        currency: 'USD',
        invoiceNumber: 'TEST-001',
        vatPercentage: 20,
        price: 100
      })
    });
    
    const invoiceData = await invoiceResponse.json();
    console.log('Created invoice:', invoiceData);
    
    // Get all invoices
    const allInvoicesResponse = await fetch('http://localhost:3000/api/invoices', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const allInvoices = await allInvoicesResponse.json();
    console.log('All invoices:', allInvoices);
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestInvoice();
