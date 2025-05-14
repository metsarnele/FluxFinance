// Test script to delete an invoice from the database
import fetch from 'node-fetch';

async function testDeleteInvoice() {
  try {
    // First, get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'correctpassword'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Got authentication token');
    
    // Get all invoices
    const allInvoicesResponse = await fetch('http://localhost:3000/api/invoices', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const allInvoices = await allInvoicesResponse.json();
    console.log('Initial invoices count:', allInvoices.length);
    
    if (allInvoices.length > 0) {
      // Delete the first invoice
      const invoiceToDelete = allInvoices[0];
      console.log('Deleting invoice:', invoiceToDelete.id);
      
      const deleteResponse = await fetch(`http://localhost:3000/api/invoices/${invoiceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('Delete response:', deleteData);
      
      // Get all invoices again to verify deletion
      const updatedInvoicesResponse = await fetch('http://localhost:3000/api/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedInvoices = await updatedInvoicesResponse.json();
      console.log('Updated invoices count:', updatedInvoices.length);
    } else {
      console.log('No invoices to delete');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testDeleteInvoice();
