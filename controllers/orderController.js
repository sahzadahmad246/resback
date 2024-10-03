const Order = require("../models/orderModels");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const razorpayInstance = require("../Razorpay/razorpayInstance");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

// creating new order




exports.newOrder = [verifyToken, catchAsyncErrors(async (req, res, next) => {
  const {
    deliveryInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    deliveryPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  // Ensure paymentInfo contains the paymentId from the token
  if (req.decoded.paymentId !== paymentInfo.id) {
    return next(new ErrorHandler("Invalid payment ID", 400));
  }

  const order = await Order.create({
    deliveryInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    deliveryPrice,
    taxPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order,
  });
})];

// New function to handle COD orders
exports.newCODOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    deliveryInfo,
    orderItems,
    itemPrice,
    deliveryPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  console.log("Received COD order data:", req.body);
  

  try {
   
    const order = await Order.create({
      deliveryInfo,
      orderItems,
      paymentInfo: {
        id: null,
        status: "Cash on delivery",
      },
      itemPrice,
      deliveryPrice,
      taxPrice,
      totalPrice,
      paidAt: null,
      user: req.user._id,
    });

    console.log("COD Order created successfully:", order);

    res.status(201).json({
      success: true,
      message: "COD Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating COD order:", error);
    return next(new ErrorHandler("COD order creation failed", 500));
  }
});


// get Single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email phone"
  );

  if (!order) {
    return next(new ErrorHandler("No order found with this id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all orders - admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status --admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("This order has already been delivered", 400));
  }

  for (const item of order.orderItems) {
    await updateStock(item.product, item.quantity);
  }

  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});



// delete order --admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  await order.deleteOne();
  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

// Update order status and track history
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("This order has already been delivered", 400));
  }

  // Update status history
  order.statusHistory.push({ status, timestamp: Date.now() });
  order.orderStatus = status;

  if (status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
  });
});



//process payment
exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const amount = req.body.total;

  if (!amount) {
    return res
      .status(400)
      .json({ error: "Missing required parameter: amount" });
  }

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  try {
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ error: "Order creation failed", details: error.message });
  }
});

// payment verification
exports.paymentVerification = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const token = jwt.sign(
      { paymentId: razorpay_payment_id },
      process.env.JWT_SECRET,
      { expiresIn: "12m" }
    );
    return res.redirect(
      `https://resfront.onrender.com/success?reference=${razorpay_payment_id}&status=success&token=${token}`
    );
  } else {
    return res.redirect(`https://resfront.onrender.com/paymentfailure?status=failure`);
  }
});
