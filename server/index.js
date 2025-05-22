import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Vue app build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')));
}

// API Routes

// Root route for API information
app.get('/', (req, res) => {
  res.json({
    name: 'FluxFinance API',
    version: '1.0.0',
    description: 'Financial management system API',
    endpoints: [
      { path: '/api/health', description: 'Health check endpoint' },
      { path: '/api/auth/login', description: 'Authentication endpoint' },
      { path: '/api/protected/invoices/:id', description: 'Protected invoice endpoint' },
      { path: '/api/customers', description: 'Customer management endpoints' }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FluxFinance API is running' });
});

// Import controllers
import { login, authenticateToken } from './controllers/authController.js';
import { createInvoice, getAllInvoices, getInvoiceById } from './controllers/invoiceController.js';
import { customerController } from './controllers/customerController.js';

// Authentication routes
app.post('/api/auth/login', login);

// Protected routes
app.get('/api/protected/invoices/:id', authenticateToken, (req, res) => {
  const invoiceId = req.params.id;
  res.json({
    id: invoiceId,
    description: 'Sample invoice',
    amount: 100.00,
    date: new Date().toISOString(),
    customer: 'Test Customer'
  });
});

// Invoice routes
app.post('/api/invoices', authenticateToken, createInvoice);
app.get('/api/invoices', authenticateToken, getAllInvoices);
app.get('/api/invoices/:id', authenticateToken, getInvoiceById);

// Customer routes
app.post('/api/customers', authenticateToken, customerController.createCustomer);
app.get('/api/customers', authenticateToken, customerController.getAllCustomers);
app.get('/api/customers/:id', authenticateToken, customerController.getCustomerById);

// Catch-all handler for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
