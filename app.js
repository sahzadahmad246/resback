const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const http = require("http"); // Import http
const { Server } = require("socket.io"); // Import socket.io

const errorMiddleware = require("./middleware/error");
const { authorizeRoles, isAuthenticatedUser } = require("./middleware/auth");

// Create an HTTP server
const server = http.createServer(app); // Create a server instance
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://resfront.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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

// Serve static files from the `dist` folder
app.use(express.static(path.join(__dirname, "dist")));

// Middleware to handle error
app.use(errorMiddleware);
app.use(isAuthenticatedUser);
app.use(authorizeRoles);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Add other socket event handlers here
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, io }; // Export app and io
