const dotenv = require("dotenv");
const http = require("http"); // Import http
const app = require("./app"); // Import app, no io needed here
const cloudinary = require("cloudinary");
const { Server } = require("socket.io"); // Import socket.io

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

// Connect to the database
connectDB()
  .then(() => {
    // Create an HTTP server and attach Socket.IO
    const server = http.createServer(app); // Create the server here
    const io = new Server(server, {
      cors: {
        origin: ["http://localhost:5173", "https://resfront.onrender.com"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

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
