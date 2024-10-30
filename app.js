const express = require("express");
const path = require("path");
const app = express(); // No need to change this
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/error");
const { authorizeRoles, isAuthenticatedUser } = require("./middleware/auth");

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(
  cors({
    origin: ["https://resfront.onrender.com", "http://localhost:5173"],
    credentials: true,
  })
);
// API routes
app.get("/api/v1/getkey", (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
});

const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const adminRoutes = require("./routes/adminRoute");
const coupon = require("./routes/couponRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", coupon);
app.use((req, res, next) => {
  req.io = io; // Attach io instance to req
  next();
});

// Serve static files from the `dist` folder
app.use(express.static(path.join(__dirname, "dist")));

// Middleware to handle error
app.use(errorMiddleware);
app.use(isAuthenticatedUser);
app.use(authorizeRoles);

module.exports = app; // Export only the app
