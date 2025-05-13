import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';
import app from '../index.js';

let server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

describe('Authentication', () => {
  beforeAll(() => {
    // Start the server on a different port for testing
    server = app.listen(PORT);
  });

  afterAll(() => {
    // Close the server after tests
    server.close();
  });

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
    
    // This test will fail initially because our login endpoint doesn't return a token yet
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
  });
});
