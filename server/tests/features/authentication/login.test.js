import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';
import app from '../../../index.js';

/**
 * User Story: Kasutajana soovin süsteemi sisse logida, et pääseda ligi oma andmetele
 * 
 * Acceptance Criteria:
 * 1. Kasutaja saab sisse logida õige e-posti ja parooliga
 * 2. Kasutaja ei saa sisse logida vale e-posti või parooliga
 * 3. Sisselogimisel saab kasutaja JWT tokeni, mida kasutatakse autentimiseks
 */
describe('User Story: Süsteemi sisselogimine', () => {
  let server;
  const PORT = 3001;
  const BASE_URL = `http://localhost:${PORT}`;
  
  beforeAll(() => {
    // Start the server on a different port for testing
    server = app.listen(PORT);
  });

  afterAll(() => {
    // Close the server after tests
    server.close();
  });

  // Acceptance Criterion 1: Kasutaja saab sisse logida õige e-posti ja parooliga
  describe('AC1: Sisselogimine õigete andmetega', () => {
    test('peaks autentima kasutaja õigete andmetega', async () => {
      // Given: Kasutaja sisestab õiged andmed
      const credentials = {
        email: 'user@example.com',
        password: 'correctpassword',
      };
      
      // When: Kasutaja proovib sisse logida
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      // Then: Kasutaja autentitakse edukalt
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('email', 'user@example.com');
    });
  });
  
  // Acceptance Criterion 2: Kasutaja ei saa sisse logida vale e-posti või parooliga
  describe('AC2: Sisselogimine valede andmetega', () => {
    test('peaks tagasi lükkama sisselogimise vale parooliga', async () => {
      // Given: Kasutaja sisestab vale parooli
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };
      
      // When: Kasutaja proovib sisse logida
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      // Then: Sisselogimine ebaõnnestub
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Email or password is incorrect');
    });
  });
  
  // Acceptance Criterion 3: Sisselogimisel saab kasutaja JWT tokeni, mida kasutatakse autentimiseks
  describe('AC3: JWT tokeni kasutamine autentimiseks', () => {
    let authToken;
    
    beforeAll(async () => {
      // Get authentication token
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
    
    test('peaks võimaldama ligipääsu kaitstud ressurssidele kehtiva tokeniga', async () => {
      // Given: Kasutaja on autenditud ja omab kehtivat tokenit
      
      // When: Kasutaja proovib pääseda ligi kaitstud ressursile
      const response = await fetch(`${BASE_URL}/api/protected/invoices/3`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      // Then: Ligipääs võimaldatakse
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', '3');
    });
    
    test('peaks keelama ligipääsu kaitstud ressurssidele ilma tokenita', async () => {
      // Given: Kasutaja ei ole autenditud
      
      // When: Kasutaja proovib pääseda ligi kaitstud ressursile ilma tokenita
      const response = await fetch(`${BASE_URL}/api/protected/invoices/3`, {
        method: 'GET',
      });
      
      const data = await response.json();
      
      // Then: Ligipääs keelatakse
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Authentication required');
    });
    
    test('peaks keelama ligipääsu kaitstud ressurssidele kehtetu tokeniga', async () => {
      // Given: Kasutajal on kehtetu token
      
      // When: Kasutaja proovib pääseda ligi kaitstud ressursile kehtetu tokeniga
      const response = await fetch(`${BASE_URL}/api/protected/invoices/3`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });
      
      const data = await response.json();
      
      // Then: Ligipääs keelatakse
      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Invalid or expired token');
    });
  });
});
