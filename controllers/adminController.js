const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Admin = require("../models/adminModel");
const cloudinary = require("cloudinary").v2;

// Add Outlet Info
exports.addOutletInfo = catchAsyncErrors(async (req, res, next) => {
  const {
    outletName,
    altPhone,
    address,
    latitude,
    longitude,
    gst,
    taxPercent,
    termsAndConditions,
    cancellationPolicy,
    outletStatus,
    openTime,
    closeTime,
    closeReason,
  } = req.body;

  console.log("Received body:", req.body);
  console.log("Received files:", req.files);

  let outletLogo = { public_id: "", url: "" };

  if (req.files && req.files.outletLogo) {
    try {
      console.log("Uploading to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.files.outletLogo.tempFilePath, {
        folder: "outletLogos",
      });
      console.log("Upload result:", result);
      outletLogo = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return next(new ErrorHandler("Failed to upload logo to Cloudinary", 500));
    }
  }

  try {
    const admin = new Admin({
      outletName,
      altPhone,
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      gst,
      taxPercent,
      termsAndConditions,
      cancellationPolicy,
      outletLogo,
      outletStatus,
      openTime,
      closeTime,
      closeReason,
    });

    console.log("Saving admin...");
    await admin.save();

    res.status(201).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Save admin error:", error);
    return next(new ErrorHandler("Failed to save outlet information", 500));
  }
});

// Update Outlet Info
exports.updateOutletInfo = catchAsyncErrors(async (req, res, next) => {
  const {
    outletName,
    altPhone,
    address,
    latitude,
    longitude,
    gst,
    taxPercent,
    termsAndConditions,
    cancellationPolicy,
    outletStatus,
    openTime,
    closeTime,
    closeReason,
  } = req.body;

  console.log("Update request body:", req.body);
  console.log("Received files:", req.files);

  const newOutletData = {
    outletName,
    altPhone,
    address,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    gst,
    taxPercent,
    termsAndConditions,
    cancellationPolicy,
    outletStatus,
    openTime,
    closeTime,
    closeReason,
  };

  if (req.files && req.files.outletLogo) {
    try {
      const admin = await Admin.findById(req.params.id);
      if (admin.outletLogo.public_id) {
        console.log("Deleting old logo...");
        await cloudinary.uploader.destroy(admin.outletLogo.public_id);
      }
      console.log("Uploading new logo to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.files.outletLogo.tempFilePath, {
        folder: "outletLogos",
      });
      console.log("Upload result:", result);
      newOutletData.outletLogo = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    } catch (error) {
      console.error("Cloudinary update error:", error);
      return next(new ErrorHandler("Failed to upload logo to Cloudinary", 500));
    }
  }

  const admin = await Admin.findByIdAndUpdate(req.params.id, newOutletData, {
    new: true,
    runValidators: true,
  });

  if (!admin) {
    return next(new ErrorHandler("Admin not found", 404));
  }

  res.status(200).json({
    success: true,
    outlet: admin,
  });
});




// Get Outlet Info
exports.getOutletInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    const admin = await Admin.findOne(); // Fetch the single outlet info
    if (!admin) {
      return next(new ErrorHandler("Outlet information not found", 404));
    }
    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to fetch outlet information", 500));
  }
});