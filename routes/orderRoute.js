const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  processPayment,
  paymentVerification,
  updateOrderStatus,
  newCODOrder
} = require("../controllers/orderController");

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/cod/order").post(isAuthenticatedUser, newCODOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/orders/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

router.put(
  "/admin/order/status/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateOrderStatus
);
router.route("/process/payment").post(isAuthenticatedUser, processPayment);
router.route("/paymentVerification").post(paymentVerification);
module.exports = router;
