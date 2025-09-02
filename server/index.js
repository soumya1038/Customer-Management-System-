// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { run, get, all, init } = require('./db');
const validateCustomer = require('./middleware/validateCustomer');
const validateAddress = require('./middleware/validateAddress');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// initialize DB and tables
init().catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

/**
 * Utility: build WHERE clause and params for customer listing filters
 * Supports:
 *  - q: search across first_name, last_name, phone_number
 *  - city: filter customers who have at least one address in city
 *  - sortBy: first_name | last_name | phone_number (default first_name)
 *  - order: ASC | DESC
 *  - page, limit
 */
function buildCustomerListQuery({ q, city }) {
  const where = [];
  const params = [];

  if (q) {
    where.push(`(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)`);
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (city) {
    // filter customers who have addresses in specified city
    where.push(`EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.city = ?)`);
    params.push(city);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  return { whereClause, params };
}

/* -------------------------
   CUSTOMER ROUTES
   ------------------------- */

/**
 * POST /api/customers
 * Create a new customer
 */
app.post('/api/customers', validateCustomer, async (req, res, next) => {
  try {
    const { first_name, last_name, phone_number } = req.body;
    const sql = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`;
    const result = await run(sql, [first_name.trim(), last_name.trim(), phone_number.trim()]);
    const created = await get(`SELECT * FROM customers WHERE id = ?`, [result.lastID]);
    res.status(201).json({ message: 'Customer created', data: created });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/customers
 * Query params:
 *  - q (search)
 *  - city
 *  - sortBy (first_name|last_name|phone_number)
 *  - order (asc|desc)
 *  - page (1-based)
 *  - limit
 */
app.get('/api/customers', async (req, res, next) => {
  try {
    const {
      q,
      city,
      sortBy = 'first_name',
      order = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * perPage;

    // Validate sortBy & order to avoid SQL injection (only allow specific columns)
    const allowedSort = ['first_name', 'last_name', 'phone_number', 'id'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'first_name';
    const orderDir = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const { whereClause, params } = buildCustomerListQuery({ q, city });

    // total count
    const countSql = `SELECT COUNT(*) as total FROM customers c ${whereClause};`;
    const countRow = await get(countSql, params);
    const total = countRow ? countRow.total : 0;

    // fetch data
    const sql = `
      SELECT c.*,
             (SELECT COUNT(*) FROM addresses a WHERE a.customer_id = c.id) AS addresses_count
      FROM customers c
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDir}
      LIMIT ? OFFSET ?;
    `;
    const rows = await all(sql, [...params, perPage, offset]);

    res.json({
      message: 'success',
      meta: {
        page: pageNum,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/customers/:id
 * Return customer details + addresses
 */
app.get('/api/customers/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'Invalid customer id' });

    const customer = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const addresses = await all(`SELECT * FROM addresses WHERE customer_id = ? ORDER BY id DESC`, [id]);
    res.json({ message: 'success', data: { ...customer, addresses } });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/customers/:id
 * Update a customer's info
 */
app.put('/api/customers/:id', validateCustomer, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'Invalid customer id' });

    const existing = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    const { first_name, last_name, phone_number } = req.body;

    // ensure unique phone_number excluding this customer
    const phoneOwner = await get(`SELECT id FROM customers WHERE phone_number = ? AND id != ?`, [phone_number.trim(), id]);
    if (phoneOwner) {
      return res.status(400).json({ message: 'phone_number already in use by another customer' });
    }

    await run(
      `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`,
      [first_name.trim(), last_name.trim(), phone_number.trim(), id]
    );

    const updated = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    res.json({ message: 'Customer updated', data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/customers/:id
 * Delete a customer (addresses cascade via FK).
 */
app.delete('/api/customers/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'Invalid customer id' });

    const existing = await get(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    await run(`DELETE FROM customers WHERE id = ?`, [id]);

    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
});

/* -------------------------
   ADDRESS ROUTES
   ------------------------- */

/**
 * POST /api/customers/:id/addresses
 * Add a new address for customer
 */
app.post('/api/customers/:id/addresses', validateAddress, async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    if (!customerId) return res.status(400).json({ message: 'Invalid customer id' });

    const customer = await get(`SELECT id FROM customers WHERE id = ?`, [customerId]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const { address_details, city, state, pin_code } = req.body;
    const result = await run(
      `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`,
      [customerId, address_details.trim(), city.trim(), state.trim(), pin_code.trim()]
    );

    const created = await get(`SELECT * FROM addresses WHERE id = ?`, [result.lastID]);
    res.status(201).json({ message: 'Address created', data: created });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/customers/:id/addresses
 * Get all addresses for a customer
 */
app.get('/api/customers/:id/addresses', async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    if (!customerId) return res.status(400).json({ message: 'Invalid customer id' });

    const customer = await get(`SELECT id FROM customers WHERE id = ?`, [customerId]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const addresses = await all(`SELECT * FROM addresses WHERE customer_id = ? ORDER BY id DESC`, [customerId]);
    res.json({ message: 'success', data: addresses });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/addresses/:addressId
 * Update an address
 */
app.put('/api/addresses/:addressId', validateAddress, async (req, res, next) => {
  try {
    const addressId = parseInt(req.params.addressId, 10);
    if (!addressId) return res.status(400).json({ message: 'Invalid address id' });

    const existing = await get(`SELECT * FROM addresses WHERE id = ?`, [addressId]);
    if (!existing) return res.status(404).json({ message: 'Address not found' });

    const { address_details, city, state, pin_code } = req.body;
    await run(
      `UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`,
      [address_details.trim(), city.trim(), state.trim(), pin_code.trim(), addressId]
    );

    const updated = await get(`SELECT * FROM addresses WHERE id = ?`, [addressId]);
    res.json({ message: 'Address updated', data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/addresses/:addressId
 * Delete an address
 */
app.delete('/api/addresses/:addressId', async (req, res, next) => {
  try {
    const addressId = parseInt(req.params.addressId, 10);
    if (!addressId) return res.status(400).json({ message: 'Invalid address id' });

    const existing = await get(`SELECT * FROM addresses WHERE id = ?`, [addressId]);
    if (!existing) return res.status(404).json({ message: 'Address not found' });

    await run(`DELETE FROM addresses WHERE id = ?`, [addressId]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
});

/* -------------------------
   Generic handlers
   ------------------------- */
app.get('/', (req, res) => res.send('Customer Management API'));

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

/* -------------------------
   Start server
   ------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
