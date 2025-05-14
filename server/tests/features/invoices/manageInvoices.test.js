import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { fetch } from 'bun';
import app from '../../../index.js';

/**
 * User Story: Kasutajana soovin hallata arveid, et jälgida oma finantsseisu
 * 
 * Acceptance Criteria:
 * 1. Kasutaja saab luua uusi arveid
 * 2. Kasutaja saab vaadata kõiki arveid
 * 3. Süsteem arvutab automaatselt arve kogusumma vastavalt kogusele ja käibemaksule
 */
describe('User Story: Arvete haldamine', () => {
  let server;
  let authToken;
  const PORT = 3002;
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

  // Acceptance Criterion 1: Kasutaja saab luua uusi arveid
  describe('AC1: Uute arvete loomine', () => {
    test('peaks looma uue arve kehtivate andmetega', async () => {
      // Given: Kasutaja on autenditud ja sisestab kehtivad arve andmed
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

      // When: Kasutaja loob uue arve
      const response = await fetch(`${BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newInvoice)
      });

      const data = await response.json();
      
      // Then: Arve luuakse edukalt
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.description).toBe('Office supplies');
      expect(data.quantity).toBe(2);
      expect(data.price).toBe(100);
    });
  });
  
  // Acceptance Criterion 2: Kasutaja saab vaadata kõiki arveid
  describe('AC2: Arvete vaatamine', () => {
    test('peaks tagastama kõik kasutaja arved', async () => {
      // Given: Kasutaja on autenditud ja tal on arveid
      
      // When: Kasutaja küsib kõiki arveid
      const response = await fetch(`${BASE_URL}/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      
      // Then: Tagastatakse arvete loend
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });
  
  // Acceptance Criterion 3: Süsteem arvutab automaatselt arve kogusumma
  describe('AC3: Automaatne kogusumma arvutamine', () => {
    test('peaks arvutama kogusumma õigesti erinevate koguste ja käibemaksumääradega', async () => {
      // Given: Kasutaja on autenditud ja sisestab arve andmed
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

      // When: Kasutaja loob uue arve
      const response = await fetch(`${BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newInvoice)
      });

      const data = await response.json();
      
      // Then: Kogusumma arvutatakse õigesti
      expect(response.status).toBe(201);
      // 5 * 200 = 1000, then add 10% VAT = 1100
      expect(data.subtotal).toBe(1000);
      expect(data.vatAmount).toBe(100);
      expect(data.totalAmount).toBe(1100);
    });
  });
});
