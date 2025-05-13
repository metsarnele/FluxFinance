<template>
  <div class="home">
    <h2>Welcome to FluxFinance</h2>
    <p>Your comprehensive financial management system</p>
    
    <div class="features">
      <div class="feature-card">
        <h3>Invoice Management</h3>
        <p>Create and manage purchase invoices with ease</p>
        <router-link to="/invoices" class="btn">View Invoices</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.features {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.feature-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 0 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.btn {
  display: inline-block;
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 1rem;
}

.btn:hover {
  background-color: #1a2530;
}
</style>
