// server/middleware/errorHandler.js
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  if (err && err.code === 'SQLITE_CONSTRAINT') {
    // unique constraint violation or foreign key constraint
    let message = 'Database constraint error';
    if (err.message && err.message.includes('customers.phone_number')) {
      message = 'phone_number must be unique';
    }
    return res.status(400).json({ message, error: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
}

module.exports = errorHandler;
