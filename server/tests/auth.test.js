import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';
import app from '../index.js';

let server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

describe('Authentication API', () => {
  // Store token for authenticated requests
  let authToken;
  
  beforeAll(() => {
    // Start the server on a different port for testing
    server = app.listen(PORT);
  });

  afterAll(() => {
    // Close the server after tests
    server.close();
  });

  // Test 1: Successful authentication with valid credentials
  test('should authenticate user with valid credentials', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'correctpassword',
      }),
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('email', 'user@example.com');
    
    // Store token for later tests
    authToken = data.token;
  });
  
  // Test 2: Failed authentication with invalid credentials
  test('should reject login with invalid credentials', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'wrongpassword',
      }),
    });

    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Email or password is incorrect');
  });
  
  // Test 3: Accessing protected route without authentication
  test('should deny access to protected routes without authentication', async () => {
    const response = await fetch(`${BASE_URL}/api/protected/invoices/3`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Authentication required');
  });
  
  // Test 4: Accessing protected route with valid authentication
  test('should allow access to protected routes with valid authentication', async () => {
    // Skip this test if we don't have a token from the login test
    if (!authToken) {
      console.warn('Skipping protected route test because no auth token is available');
      return;
    }
    
    const response = await fetch(`${BASE_URL}/api/protected/invoices/3`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id', '3');
  });
  
  // Test 5: Using an invalid/expired token
  test('should reject access with invalid token', async () => {
    const response = await fetch(`${BASE_URL}/api/protected/invoices/3`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid or expired token');
  });
});
