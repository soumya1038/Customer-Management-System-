# Customer Management System - Frontend

React frontend for the Customer Management System with modern UI and responsive design.

## Features

- Customer listing with search and pagination
- Add/Edit/Delete customers
- Manage customer addresses
- Modern responsive UI with CSS modules
- Real-time search with debouncing

## Tech Stack

- React 19.1.1
- React Router DOM 7.8.2
- Axios for API calls
- Modern CSS with responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# Copy and update .env file
cp .env.example .env
# Set REACT_APP_API_URL to your backend URL
```

3. Start development server:
```bash
npm start
```

App runs on [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## Build & Deploy

```bash
# Production build
npm run build

# Deploy to Render
# 1. Connect GitHub repo to Render
# 2. Choose "Static Site" service
# 3. Set build command: npm install && npm run build
# 4. Set publish directory: build
# 5. Add environment variable: REACT_APP_API_URL
```

## Project Structure

```
src/
├── components/
│   ├── Home.js & Home.css
│   ├── AddCustomer.js & AddCustomer.css
│   ├── CustomerDetails.js & CustomerDetails.css
│   ├── AddressForm.js & AddressForm.css
│   └── EditCustomerForm.js & EditCustomerForm.css
├── App.js
└── index.js
```
