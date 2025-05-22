import CustomerStore from '../models/Customer.js';

// Controller for customer-related operations
export const customerController = {
  // Create a new customer
  createCustomer: async (req, res) => {
    try {
      console.log('Creating customer, received request:', { 
        body: req.body,
        headers: req.headers,
        user: req.user
      });
      
      const { name, address, email } = req.body;
      
      // Validate request
      if (!name || !email) {
        console.log('Validation failed: missing name or email');
        return res.status(400).json({ error: 'Name and email are required fields' });
      }
      
      // Create customer
      console.log('Creating customer with data:', { name, address, email });
      const customer = CustomerStore.create({
        name,
        address,
        email
      });
      
      console.log('Customer created successfully:', customer);
      return res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({ error: 'Failed to create customer: ' + error.message });
    }
  },
  
  // Get all customers
  getAllCustomers: async (req, res) => {
    try {
      const customers = CustomerStore.findAll();
      return res.status(200).json(customers);
    } catch (error) {
      console.error('Error getting customers:', error);
      return res.status(500).json({ error: 'Failed to retrieve customers' });
    }
  },
  
  // Get customer by ID
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;
      const customer = CustomerStore.findById(id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      return res.status(200).json(customer);
    } catch (error) {
      console.error('Error getting customer:', error);
      return res.status(500).json({ error: 'Failed to retrieve customer' });
    }
  }
};
