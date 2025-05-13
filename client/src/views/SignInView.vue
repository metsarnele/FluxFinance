<template>
  <div class="sign-in-overlay" aria-labelledby="sign-in-title" role="dialog" aria-modal="true">
    <div class="sign-in-form" role="form">
      <h2 id="sign-in-title">Sign In</h2>
      
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            aria-required="true"
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            aria-required="true"
            autocomplete="current-password"
          />
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            :disabled="isLoading"
            aria-busy="isLoading"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignInView',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLoading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ''
      this.isLoading = true
      
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Email or password is incorrect')
        }
        
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Refresh the page to show the protected content
        window.location.reload()
      } catch (err) {
        this.error = err.message || 'Email or password is incorrect'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.sign-in-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.sign-in-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #1a2530;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
