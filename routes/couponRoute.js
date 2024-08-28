const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createCoupon,
  redeemCoupon,
} = require("../controllers/couponController");

router
  .route("/create/coupon")
  .post(isAuthenticatedUser, createCoupon);

router.route("/redeem-coupon").post(isAuthenticatedUser, redeemCoupon);

module.exports = router;
