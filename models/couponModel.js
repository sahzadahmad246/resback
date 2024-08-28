const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percent", "amount"], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});


module.exports = mongoose.model("Coupon", couponSchema);