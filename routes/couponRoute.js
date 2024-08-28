const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createCoupon,
  redeemCoupon,
  getAllCoupons,
} = require("../controllers/couponController");

router.route("/create/coupon").post(isAuthenticatedUser, createCoupon);

router.route("/redeem-coupon").post(isAuthenticatedUser, redeemCoupon);
router.route("/get-all-coupons").get(isAuthenticatedUser, getAllCoupons);

module.exports = router;
