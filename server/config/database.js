import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', '..', 'data', 'fluxfinance.db');

// Create a database connection
export const getDbConnection = async () => {
  // Ensure sqlite3.verbose() for better debugging
  sqlite3.verbose();
  
  try {
    // Open the database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log(`Connected to SQLite database at ${dbPath}`);
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Initialize the database with required tables
export const initializeDatabase = async () => {
  try {
    const db = await getDbConnection();
    
    // Create invoices table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        paymentMethod TEXT NOT NULL,
        currency TEXT NOT NULL,
        invoiceNumber TEXT NOT NULL,
        vatPercentage REAL NOT NULL,
        price REAL NOT NULL,
        subtotal REAL NOT NULL,
        vatAmount REAL NOT NULL,
        totalAmount REAL NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export default {
  getDbConnection,
  initializeDatabase
};
