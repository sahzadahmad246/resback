const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true, // Ensure secure is true for cross-site cookies
    // Remove sameSite and partitioned options to test compatibility
    domain: 'https://resback-ql89.onrender.com', // Set explicitly to your backend's domain
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;
