 
const errorHandler = (err, req, res, next) => {

  // Log the full error internally (you'd use a logger like winston in prod)
  console.error(`[ERROR] ${err.message}`);

  // Use the error's status code if set, otherwise default to 500
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;