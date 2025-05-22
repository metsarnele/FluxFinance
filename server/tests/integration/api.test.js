import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';
import app from '../../index.js';

let server;
const PORT = 3003; // Different port than other tests
const BASE_URL = `http://localhost:${PORT}`;
let authToken;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Start the server for testing
    server = app.listen(PORT);
    
    // Get auth token for protected routes
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'correctpassword',
      }),
    });
    
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  afterAll(() => {
    // Close the server after tests
    server.close();
  });

  test('should complete full invoice workflow', async () => {
    // 1. Create a new invoice
    const newInvoice = {
      date: '2025-05-20',
      description: 'Integration test invoice',
      quantity: 3,
      paymentMethod: 'bank',
      currency: 'EUR',
      invoiceNumber: 'INT-001',
      vatPercentage: 20,
      price: 150
    };

    const createResponse = await fetch(`${BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newInvoice)
    });

    const createdInvoice = await createResponse.json();
    expect(createResponse.status).toBe(201);
    
    // 2. Verify the invoice was created correctly
    const invoiceId = createdInvoice.id;
    const getResponse = await fetch(`${BASE_URL}/api/invoices/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const retrievedInvoice = await getResponse.json();
    expect(getResponse.status).toBe(200);
    expect(retrievedInvoice.description).toBe('Integration test invoice');
    
    // 3. Test the entire flow from creation to retrieval to ensure data consistency
    expect(retrievedInvoice.totalAmount).toBe(540); // 3 * 150 + 20% VAT
  });
});
