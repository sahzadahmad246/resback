const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resourse not found: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose duplicate error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // invalid JWT error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid Json web token, Try again";
    err = new ErrorHandler(message, 400);
  }

  // expired jwt token error 
  if (err.name === "TokenExpiredError") {
    const message = "Expired Json web token, Try again";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
