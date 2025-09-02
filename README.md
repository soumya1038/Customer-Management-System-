# Customer Management System

Full-stack web application for managing customers and their addresses with modern UI and RESTful API.

## Features

- **Customer Management**: Add, edit, delete, and search customers
- **Address Management**: Manage multiple addresses per customer
- **Modern UI**: Responsive design with CSS modules
- **Real-time Search**: Debounced search with pagination
- **RESTful API**: Clean API design with proper HTTP methods

## Tech Stack

### Frontend
- React 19.1.1
- React Router DOM 7.8.2
- Axios for API calls
- Modern CSS with responsive design

### Backend
- Node.js with Express.js
- SQLite3 database
- CORS middleware
- Environment configuration

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
npm run dev
```
Server runs on http://localhost:5000

### Frontend Setup
```bash
cd client
npm install
npm start
```
Client runs on http://localhost:3000

## Project Structure

```
customer-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components with CSS
│   │   ├── App.js
│   │   └── index.js
│   ├── .env              # Environment variables
│   └── package.json
├── server/                # Node.js backend
│   ├── middleware/       # Express middleware
│   ├── db.js            # Database setup
│   ├── index.js         # Express server
│   ├── .env             # Environment variables
│   └── package.json
└── README.md
```

## API Documentation

### Customers
- `GET /api/customers` - List customers with search & pagination
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer with addresses
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Addresses
- `POST /api/customers/:id/addresses` - Add address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## Deployment

### Render Deployment

1. **Backend**: Deploy as Web Service
   - Build: `npm install`
   - Start: `npm start`

2. **Frontend**: Deploy as Static Site
   - Build: `npm install && npm run build`
   - Publish: `build`
   - Environment: `REACT_APP_API_URL=<backend-url>`

### Environment Variables

**Client:**
- `REACT_APP_API_URL` - Backend API URL

**Server:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License