import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';
import app from '../../index.js';

let server;
const PORT = 3004; // Different port than other tests
const BASE_URL = `http://localhost:${PORT}`;
let authToken; // Store auth token for protected routes

describe('Customer API', () => {
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

  // Test 1: Create a new customer
  test('should create a new customer', async () => {
    const newCustomer = {
      name: 'Acme Corporation',
      address: '123 Business Ave, Suite 100, Business City, 10001',
      email: 'contact@acmecorp.com'
    };

    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newCustomer)
    });

    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.name).toBe('Acme Corporation');
    expect(data.address).toBe('123 Business Ave, Suite 100, Business City, 10001');
    expect(data.email).toBe('contact@acmecorp.com');
  });

  // Test 2: Get all customers
  test('should get all customers', async () => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  // Test 3: Get a specific customer by ID
  test('should get a specific customer by ID', async () => {
    // First create a customer to ensure we have one
    const newCustomer = {
      name: 'Test Company',
      address: '456 Test Street, Test City, 20002',
      email: 'info@testcompany.com'
    };

    const createResponse = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newCustomer)
    });

    const createdCustomer = await createResponse.json();
    const customerId = createdCustomer.id;

    // Now get the customer by ID
    const getResponse = await fetch(`${BASE_URL}/api/customers/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const retrievedCustomer = await getResponse.json();
    
    expect(getResponse.status).toBe(200);
    expect(retrievedCustomer.id).toBe(customerId);
    expect(retrievedCustomer.name).toBe('Test Company');
    expect(retrievedCustomer.email).toBe('info@testcompany.com');
  });
});
