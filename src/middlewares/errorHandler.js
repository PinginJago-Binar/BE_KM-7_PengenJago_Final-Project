const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    status: statusCode,
    message: err.message,
  });
}

export default errorHandler;