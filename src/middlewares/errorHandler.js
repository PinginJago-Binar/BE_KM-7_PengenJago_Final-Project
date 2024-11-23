const errorHandler = (err, req, res, _next) => {
  return res.status(500).json({
    message: err.message,
    errorId: res.sentry || "Unknown Error ID",
  });
};

export default errorHandler;
