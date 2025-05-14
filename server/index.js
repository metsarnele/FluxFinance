import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the database
(async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
})();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
      { path: '/api/protected/invoices/:id', description: 'Protected invoice endpoint' }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FluxFinance API is running' });
});

// Import controllers
import { login, authenticateToken } from './controllers/authController.js';
import { createInvoice, getAllInvoices, getInvoiceById, deleteInvoiceById } from './controllers/invoiceDbController.js';

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
app.delete('/api/invoices/:id', authenticateToken, deleteInvoiceById);

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
