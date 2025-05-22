import { fetch } from 'bun';

async function testLogin() {
  try {
    // Login to get a token
    console.log('Attempting to login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
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
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    console.log('Login successful, token received');
    const token = loginData.token;
    
    // Test creating a customer
    console.log('\nTesting customer creation...');
    const customerResponse = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'test@example.com',
        address: 'Test Address'
      })
    });
    
    const customerData = await customerResponse.json();
    
    if (!customerResponse.ok) {
      console.error('Customer creation failed:', customerData);
      return;
    }
    
    console.log('Customer created successfully:', customerData);
    
    // Test getting all customers
    console.log('\nTesting get all customers...');
    const getAllResponse = await fetch('http://localhost:3000/api/customers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const allCustomers = await getAllResponse.json();
    
    if (!getAllResponse.ok) {
      console.error('Get all customers failed:', allCustomers);
      return;
    }
    
    console.log('All customers retrieved successfully:');
    console.log(allCustomers);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
