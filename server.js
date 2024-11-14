const dotenv = require("dotenv");
const http = require("http"); // Import http
const app = require("./app"); // Import app
const cloudinary = require("cloudinary");

const connectDB = require("./mongoDB/database");

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

console.log("PORT:", process.env.PORT);

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception");
  process.exit(1);
});

// Custom headers for all responses (optional, if needed for more control)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://resfront.onrender.com");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
const server = http.createServer(app);

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
