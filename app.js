const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/error");
const { authorizeRoles, isAuthenticatedUser } = require("./middleware/auth");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://sonipaintingworks.onrender.com",
    "https://sonipainting.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "FETCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// Route to get Razorpay key
app.get("/api/v1/getkey", (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// importing routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const adminRoutes = require("./routes/adminRoute")

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", adminRoutes);

// middleware to handle error
app.use(errorMiddleware);
app.use(isAuthenticatedUser);
app.use(authorizeRoles);



module.exports = app;
