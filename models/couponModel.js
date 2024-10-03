const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percent", "amount"], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  usedAt: { type: Date, default: null }  
});

module.exports = mongoose.model("Coupon", couponSchema);
