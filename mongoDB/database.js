const mongoose = require("mongoose");

const DB = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

module.exports = connectDB;
