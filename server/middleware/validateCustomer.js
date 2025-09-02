// server/middleware/validateCustomer.js
function validateCustomer(req, res, next) {
  const { first_name, last_name, phone_number } = req.body;
  const errors = [];

  if (!first_name || typeof first_name !== 'string' || first_name.trim() === '') {
    errors.push('first_name is required');
  }
  if (!last_name || typeof last_name !== 'string' || last_name.trim() === '') {
    errors.push('last_name is required');
  }
  if (!phone_number || typeof phone_number !== 'string' || phone_number.trim() === '') {
    errors.push('phone_number is required');
  } else {
    // basic phone validation: allow digits, +, -, spaces; change as needed
    const cleaned = phone_number.replace(/[\s\-]/g, '');
    if (!/^\+?\d{6,15}$/.test(cleaned)) {
      errors.push('phone_number looks invalid (expect digits, optional +, length 6-15)');
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

module.exports = validateCustomer;
