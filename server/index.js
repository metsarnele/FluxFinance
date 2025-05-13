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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FluxFinance API is running' });
});

// Authentication routes placeholder
app.post('/api/auth/login', (req, res) => {
  // This would be implemented with actual authentication logic
  res.json({ message: 'Authentication endpoint placeholder' });
});

// Invoice routes placeholder
app.get('/api/invoices', (req, res) => {
  // This would be implemented with actual database queries
  res.json({ message: 'Invoices endpoint placeholder' });
});

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
