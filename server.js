const dotenv = require("dotenv");
const http = require("http"); // Import http
const app = require("./app"); // Import app, no io needed here
const cloudinary = require("cloudinary");
const { Server } = require("socket.io"); // Import socket.io
const Order = require("../models/orderModels");
// Load environment variables
dotenv.config({ path: "backend/config/config.env" });
const connectDB = require("./mongoDB/database");

console.log("PORT:", process.env.PORT);

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception");
  process.exit(1);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://resfront.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible throughout the application
app.set('io', io);

// Socket.IO connection handling
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  try {
    // Send initial orders on connection
    const orders = await Order.find({}).sort({ createdAt: -1 });
    socket.emit("initial_orders", orders);

    // Listen for order status updates
    socket.on("order_status_update", async (data) => {
      try {
        const updatedOrder = await Order.findByIdAndUpdate(
          data.orderId,
          { $set: { orderStatus: data.status } },
          { new: true }
        );
        io.emit("order_updated", updatedOrder);
      } catch (error) {
        console.error("Error updating order:", error);
      }
    });

    // Handle new orders
    socket.on("new_order", async (orderData) => {
      io.emit("order_received", orderData);
    });

  } catch (error) {
    console.error("Error fetching initial orders:", error);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Connect to database and start server
connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});
