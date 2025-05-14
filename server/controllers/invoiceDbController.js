import InvoiceDb from '../models/InvoiceDb.js';

/**
 * Create a new invoice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'date', 'description', 'quantity', 'paymentMethod', 
      'currency', 'invoiceNumber', 'vatPercentage', 'price'
    ];
    
    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    // Validate numeric fields
    if (isNaN(invoiceData.quantity) || invoiceData.quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    if (isNaN(invoiceData.price) || invoiceData.price < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    
    if (isNaN(invoiceData.vatPercentage) || invoiceData.vatPercentage < 0) {
      return res.status(400).json({ error: 'VAT percentage must be a non-negative number' });
    }
    
    // Create invoice
    const invoice = await InvoiceDb.create(invoiceData);
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all invoices
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceDb.findAll();
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getInvoiceById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }
    
    const invoice = await InvoiceDb.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteInvoiceById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }
    
    const deletedInvoice = await InvoiceDb.deleteById(id);
    
    if (!deletedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.status(200).json({ 
      message: 'Invoice deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
