const mongoose = require("mongoose");
const validator = require("validator");

const adminSchema = new mongoose.Schema(
  {
    outletName: {
      type: String,
      required: [true, "Please enter the outlet name"],
    },
    outletLogo: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    altPhone: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v, "any", { strictMode: false });
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      required: [true, "Please enter the outlet address"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    gst: {
      type: String,
      required: [true, "Please enter the GST number"],
    },
    taxPercent: {
      type: Number,
      required: [true, "Please enter the tax percent"],
    },
    termsAndConditions: {
      type: String,
      required: [true, "Please enter the terms and conditions"],
    },
    cancellationPolicy: {
      type: String,
      required: [true, "Please enter the cancellation policy"],
    },
    outletStatus: {
      type: String,
      enum: ["Open", "Closed"],
      required: true,
    },
    openTime: {
      type: String,
      required: [true, "Please enter the opening time"],
    },
    closeTime: {
      type: String,
      required: [true, "Please enter the closing time"],
    },
    closeReason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
