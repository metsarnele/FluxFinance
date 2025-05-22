import { describe, test, expect } from 'bun:test';
import CustomerStore from '../../models/Customer.js';

describe('Customer Model', () => {
  test('should create a new customer', () => {
    const customerData = {
      name: 'Acme Corporation',
      address: '123 Business Ave, Suite 100, Business City, 10001',
      email: 'contact@acmecorp.com'
    };
    
    const customer = CustomerStore.create(customerData);
    
    expect(customer).toHaveProperty('id');
    expect(customer.name).toBe('Acme Corporation');
    expect(customer.address).toBe('123 Business Ave, Suite 100, Business City, 10001');
    expect(customer.email).toBe('contact@acmecorp.com');
  });
  
  test('should store and retrieve customers', () => {
    // Clear any existing customers for this test
    CustomerStore.customers = [];
    CustomerStore.nextId = 1;
    
    const customerData = {
      name: 'Test Company',
      address: '456 Test Street, Test City, 20002',
      email: 'info@testcompany.com'
    };
    
    const createdCustomer = CustomerStore.create(customerData);
    const retrievedCustomer = CustomerStore.findById(createdCustomer.id);
    
    expect(retrievedCustomer).toEqual(createdCustomer);
    expect(retrievedCustomer.name).toBe('Test Company');
    expect(retrievedCustomer.email).toBe('info@testcompany.com');
  });
  
  test('should find all customers', () => {
    // Clear any existing customers for this test
    CustomerStore.customers = [];
    CustomerStore.nextId = 1;
    
    // Create multiple customers
    CustomerStore.create({
      name: 'Company A',
      address: 'Address A',
      email: 'a@example.com'
    });
    
    CustomerStore.create({
      name: 'Company B',
      address: 'Address B',
      email: 'b@example.com'
    });
    
    const allCustomers = CustomerStore.findAll();
    
    expect(Array.isArray(allCustomers)).toBe(true);
    expect(allCustomers.length).toBe(2);
    expect(allCustomers[0].name).toBe('Company A');
    expect(allCustomers[1].name).toBe('Company B');
  });
});
