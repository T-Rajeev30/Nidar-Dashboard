// Single responsibility: catch errors from any route and return a
// consistent JSON error shape instead of leaking stack traces.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[error]', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'That name is already taken. Try a different one.' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' });
}

module.exports = { errorHandler };
