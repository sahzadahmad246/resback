const Coupon = require("../models/couponModel");

// Create Coupon
exports.createCoupon = async (req, res) => {
  const { code, discountType, discountValue, expiryDate } = req.body;

  console.log("Received request to create coupon with data:", {
    code,
    discountType,
    discountValue,
    expiryDate,
  });

  try {
    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      expiryDate,
    });

    console.log("Saving new coupon to the database:", newCoupon);
    await newCoupon.save();

    console.log("Coupon created successfully:", newCoupon);
    res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ error: error.message });
  }
};

// Redeem Coupon
exports.redeemCoupon = async (req, res) => {
  const { couponCode, subtotal } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    // Deactivate coupon if expired
    if (new Date() > coupon.expiryDate) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is not active" });
    }

    if (coupon.used) {
      return res.status(400).json({ message: "Coupon has already been used" });
    }

    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === "amount") {
      discount = coupon.discountValue;
    }

    const total = subtotal - discount;

    // Update coupon to mark it as used
    coupon.used = true;
    coupon.usedAt = new Date(); 
    await coupon.save();

    res.status(200).json({ message: "Coupon applied successfully", discount, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
