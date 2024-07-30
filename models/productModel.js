const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter product Description"],
  },
  price: {
    type: Number,
    required: [true, "Please enter product Price"],
    min: [0, "Price should not be negative"],
    max: [99999999, "Price should not exceed 99,999,999"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter product category"],
  },
  subCategory: {
    type: String,
    required: [true, "Please enter product sub category"],
  },
  foodType: {
    type: String,
    required: [true, "Please enter food type"],
  },
  stock: {
    type: Boolean,
    required: [true, "Please specify if the product is in stock"],
    default: true, // or false, depending on your preference
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: [true, "Review name is required"],
      },
      avatar: {
        public_id: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: false,
        },
      },
      rating: {
        type: Number,
        required: [true, "Review rating is required"],
        min: [1, "Rating should be between 1 and 5"],
        max: [5, "Rating should be between 1 and 5"],
      },
      comment: {
        type: String,
        required: true,
      },
      reviewDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
