# Customer Management System - Backend

Node.js/Express backend API for the Customer Management System with SQLite database.

## Features

- RESTful API for customers and addresses
- SQLite database with foreign key constraints
- CORS enabled for frontend integration
- Input validation and error handling
- Pagination and search functionality

## Tech Stack

- Node.js with Express.js
- SQLite3 database
- CORS middleware
- Environment configuration with dotenv

## API Endpoints

### Customers
- `GET /api/customers` - List customers (with search & pagination)
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer with addresses
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Addresses
- `POST /api/customers/:id/addresses` - Add address to customer
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# Copy and update .env file
cp .env.example .env
# Set PORT and other configurations
```

3. Start server:
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on port 5000 (or PORT from .env)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Database

SQLite database (`database.db`) is automatically created with tables:
- `customers` - Customer information
- `addresses` - Customer addresses with foreign key to customers

## Deploy to Render

1. Connect GitHub repo to Render
2. Choose "Web Service"
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables as needed

## Project Structure

```
server/
├── middleware/
│   └── (middleware files)
├── .env
├── database.db
├── db.js          # Database setup and queries
├── index.js       # Express server and routes
└── package.json
```