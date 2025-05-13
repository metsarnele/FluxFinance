# FluxFinance

## Account Management API

FluxFinance is a comprehensive financial management system built with modern technologies to provide efficient account management capabilities for businesses.

### Tech Stack

- **Backend**: Express.js with Bun runtime
- **Frontend**: Vue.js
- **Database**: SQLite

## Features

### Authentication System

Secure authentication system with protected routes and AJAX-based login functionality. Features include:
- Protected URL access control
- Secure sign-in process
- WCAG 2.1 AA compliant user interface
- Seamless authentication flow

### Invoice Management

Comprehensive purchase invoice management system that allows accountants to:
- Access invoices through the main menu
- Create new invoices with detailed information
- Track financial data including dates, descriptions, quantities, payment methods
- Manage currencies, invoice numbers, VAT percentages, and pricing
- Automatic calculation of totals based on price, quantity, and VAT

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js (recommended: latest LTS version)

### Project Structure

```
fluxfinance/
├── client/             # Vue.js frontend
│   ├── package.json    # Frontend dependencies
│   └── ...            
├── server/             # Express.js backend
│   ├── index.js        # Main server file
│   └── ...            
├── package.json        # Main project dependencies
└── README.md          
```

### Package.json Files

#### Main package.json

The root `package.json` contains:
- Backend dependencies (Express, SQLite, etc.)
- Scripts to run both frontend and backend
- Test configuration

#### Client package.json

The `client/package.json` contains:
- Vue.js and related frontend dependencies
- Build scripts for the frontend

### Installation

1. Install dependencies for both backend and frontend
   ```bash
   bun install        # Install backend dependencies
   cd client && bun install && cd ..  # Install frontend dependencies
   ```

### Running the Application

1. Start the development server
   ```bash
   bun run dev
   ```
   This will start both the Express backend and Vue frontend in development mode.

2. Access the application
   - Frontend: http://localhost:5173
   - API: http://localhost:3000

### Testing

Run the test suite with:
```bash
bun test
```

Run specific tests:
```bash
bun test --filter "auth"
```

### Building for Production

```bash
bun run build
```

Start the production server:
```bash
bun run start
```

## API Documentation

API endpoints and usage documentation will be provided as the API is developed.