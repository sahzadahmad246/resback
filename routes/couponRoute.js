const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createCoupon,
  redeemCoupon,
  getAllCoupons,
  deleteCoupon,
  expireCoupon,
} = require("../controllers/couponController");

// Route to create a new coupon (Only for admins )
router
  .route("/create/coupon")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createCoupon);

// Route to redeem a coupon (Only authenticated users)
router.route("/redeem-coupon").post(isAuthenticatedUser, redeemCoupon);

// Route to get all coupons (Only for admins)
router
  .route("/get-all-coupons")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllCoupons);

// Route to delete a coupon by ID (Only admins can delete)
router
  .route("/delete-coupon/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCoupon);

// Route to manually expire a coupon by ID (Only admins can expire)
router
  .route("/expire-coupon/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), expireCoupon);

module.exports = router;
