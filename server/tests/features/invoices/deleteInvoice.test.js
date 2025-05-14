import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { fetch } from 'bun';
import app from '../../../index.js';

/**
 * User Story: Kasutajana soovin kustutada arveid, et hoida oma arveteloendit korras
 * 
 * Acceptance Criteria:
 * 1. Kasutaja saab kustutada arve arvete loendist
 * 2. Pärast kustutamist eemaldatakse arve loendist
 * 3. Ainult autenditud kasutajad saavad arveid kustutada
 */
describe('User Story: Arvete kustutamine', () => {
  let server;
  let authToken;
  let testInvoiceId;
  const PORT = 3003;
  const BASE_URL = `http://localhost:${PORT}`;
  
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
  
  beforeEach(async () => {
    // Create a test invoice for each test
    const newInvoice = {
      date: '2025-05-14',
      description: 'Test Invoice for Deletion',
      quantity: 2,
      paymentMethod: 'bank',
      currency: 'USD',
      invoiceNumber: 'TEST-DEL-001',
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
    
    const invoice = await response.json();
    testInvoiceId = invoice.id;
  });

  // Acceptance Criterion 1: Kasutaja saab kustutada arve arvete loendist
  describe('AC1: Arve kustutamine loendist', () => {
    test('peaks võimaldama kustutada olemasolevat arvet', async () => {
      // Given: Kasutaja on autenditud ja olemas on arve ID
      
      // When: Kasutaja kustutab arve
      const response = await fetch(`${BASE_URL}/api/invoices/${testInvoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      
      // Then: Arve kustutatakse edukalt
      expect(response.status).toBe(200);
      expect(result).toHaveProperty('message', 'Invoice deleted successfully');
      expect(result).toHaveProperty('id', testInvoiceId);
    });
    
    test('peaks tagastama 404 kui arvet ei leita', async () => {
      // Given: Kasutaja on autenditud, kuid arvet ei eksisteeri
      const nonExistentId = 9999;
      
      // When: Kasutaja proovib kustutada olematut arvet
      const response = await fetch(`${BASE_URL}/api/invoices/${nonExistentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      
      // Then: Tagastatakse viga
      expect(response.status).toBe(404);
      expect(result).toHaveProperty('error', 'Invoice not found');
    });
  });
  
  // Acceptance Criterion 2: Pärast kustutamist eemaldatakse arve loendist
  describe('AC2: Arve eemaldamine loendist pärast kustutamist', () => {
    test('peaks eemaldama kustutatud arve arvete loendist', async () => {
      // Given: Kasutaja on autenditud ja olemas on arve ID
      
      // When: Kasutaja kustutab arve
      await fetch(`${BASE_URL}/api/invoices/${testInvoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // And: Kasutaja küsib kõiki arveid
      const response = await fetch(`${BASE_URL}/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const invoices = await response.json();
      const deletedInvoice = invoices.find(invoice => invoice.id === testInvoiceId);
      
      // Then: Kustutatud arvet ei ole loendis
      expect(deletedInvoice).toBeUndefined();
    });
  });
  
  // Acceptance Criterion 3: Ainult autenditud kasutajad saavad arveid kustutada
  describe('AC3: Autentimise nõue arvete kustutamisel', () => {
    test('peaks keelama kustutamise ilma autentimiseta', async () => {
      // Given: Kasutaja ei ole autenditud
      
      // When: Kasutaja proovib kustutada arvet ilma autentimiseta
      const response = await fetch(`${BASE_URL}/api/invoices/${testInvoiceId}`, {
        method: 'DELETE'
        // Autentimistoken puudub
      });
      
      const result = await response.json();
      
      // Then: Kustutamine keelatakse
      expect(response.status).toBe(401);
      expect(result).toHaveProperty('error', 'Authentication required');
    });
    
    test('peaks keelama kustutamise kehtetud tokeniga', async () => {
      // Given: Kasutajal on kehtetu token
      
      // When: Kasutaja proovib kustutada arvet kehtetu tokeniga
      const response = await fetch(`${BASE_URL}/api/invoices/${testInvoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      const result = await response.json();
      
      // Then: Kustutamine keelatakse
      expect(response.status).toBe(403);
      expect(result).toHaveProperty('error', 'Invalid or expired token');
    });
  });
});
