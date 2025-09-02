// server/middleware/validateAddress.js
function validateAddress(req, res, next) {
  const { address_details, city, state, pin_code } = req.body;
  const errors = [];

  if (!address_details || typeof address_details !== 'string' || address_details.trim() === '') {
    errors.push('address_details is required');
  }
  if (!city || typeof city !== 'string' || city.trim() === '') {
    errors.push('city is required');
  }
  if (!state || typeof state !== 'string' || state.trim() === '') {
    errors.push('state is required');
  }
  if (!pin_code || typeof pin_code !== 'string' || pin_code.trim() === '') {
    errors.push('pin_code is required');
  } else {
    // basic pin validation: allow digits and letters; adjust to your country rules
    if (!/^[A-Za-z0-9\s\-]{3,12}$/.test(pin_code)) {
      errors.push('pin_code looks invalid');
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

module.exports = validateAddress;
