// Simple in-memory store for customers (in a real app, this would use a database)
class CustomerStore {
  constructor() {
    this.customers = [];
    this.nextId = 1;
  }

  create(customerData) {
    const { name, address, email } = customerData;

    // Validate required fields
    if (!name || !email) {
      throw new Error('Name and email are required fields');
    }

    const customer = {
      id: this.nextId++,
      name,
      address,
      email,
      createdAt: new Date().toISOString()
    };

    this.customers.push(customer);
    return customer;
  }

  findAll() {
    return this.customers;
  }

  findById(id) {
    return this.customers.find(customer => customer.id === parseInt(id));
  }
}

export default new CustomerStore();
