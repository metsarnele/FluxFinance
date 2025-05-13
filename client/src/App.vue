<template>
  <div class="app">
    <header>
      <div class="header-content">
        <h1>FluxFinance</h1>
        <nav v-if="isAuthenticated">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/invoices" class="nav-link">Invoices</router-link>
          <button @click="signOut" class="sign-out-btn">Sign Out</button>
        </nav>
      </div>
    </header>
    <main>
      <router-view />
      <!-- Sign-in overlay for protected routes -->
      <SignInView v-if="showSignInOverlay" />
    </main>
    <footer>
      <p>&copy; 2025 FluxFinance</p>
    </footer>
  </div>
</template>

<script>
import SignInView from './views/SignInView.vue';

export default {
  components: {
    SignInView
  },
  data() {
    return {
      isAuthenticated: false
    }
  },
  computed: {
    showSignInOverlay() {
      return this.$route.meta.requiresAuth && !this.isAuthenticated;
    }
  },
  created() {
    // Check if user is authenticated
    this.isAuthenticated = !!localStorage.getItem('token');
    
    // Listen for authentication changes
    window.addEventListener('storage', this.checkAuthentication);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuthentication);
  },
  methods: {
    checkAuthentication() {
      this.isAuthenticated = !!localStorage.getItem('token');
    },
    signOut() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isAuthenticated = false;
      this.$router.push('/');
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #333;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

nav {
  display: flex;
  align-items: center;
}

.nav-link {
  color: white;
  margin-right: 1.5rem;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  text-decoration: underline;
}

.sign-out-btn {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.sign-out-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

main {
  flex: 1;
  padding: 2rem;
}

footer {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
