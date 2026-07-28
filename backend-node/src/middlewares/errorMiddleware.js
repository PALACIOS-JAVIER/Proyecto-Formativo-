const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(status).json({
    success: false,
    message,
    data: null
  });
};

module.exports = errorHandler;
