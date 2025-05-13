import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';
import app from '../index.js';

let server;
const PORT = 3002; // Different port than auth tests
const BASE_URL = `http://localhost:${PORT}`;
let authToken; // Store auth token for protected routes

describe('Invoice API', () => {
  beforeAll(async () => {
    // Start the server on a different port for testing
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

  // Test 1: Create a new invoice
  test('should create a new invoice', async () => {
    const newInvoice = {
      date: '2025-05-13',
      description: 'Office supplies',
      quantity: 2,
      paymentMethod: 'bank',
      currency: 'USD',
      invoiceNumber: 'INV-001',
      vatPercentage: 20,
      price: 100
    };

    const response = await fetch(`${BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newInvoice)
    });

    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.description).toBe('Office supplies');
    expect(data.quantity).toBe(2);
    expect(data.price).toBe(100);
    expect(data.totalAmount).toBe(240); // 2 * 100 + 20% VAT
  });

  // Test 2: Get all invoices
  test('should get all invoices', async () => {
    const response = await fetch(`${BASE_URL}/api/invoices`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  // Test 3: Calculate total amount correctly
  test('should calculate total amount correctly with different quantities and VAT', async () => {
    const newInvoice = {
      date: '2025-05-15',
      description: 'Consulting services',
      quantity: 5,
      paymentMethod: 'bank',
      currency: 'USD',
      invoiceNumber: 'INV-003',
      vatPercentage: 10,
      price: 200
    };

    const response = await fetch(`${BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newInvoice)
    });

    const data = await response.json();
    
    expect(response.status).toBe(201);
    // 5 * 200 = 1000, then add 10% VAT = 1100
    expect(data.totalAmount).toBe(1100);
  });
});
