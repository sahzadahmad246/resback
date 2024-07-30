const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/productModel");
const cloudinary = require("cloudinary").v2;

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, category, subCategory, description, foodType, price } =
    req.body;
  const images = req.files ? req.files.images : [];

  if (!images || images.length === 0) {
    return next(new ErrorHandler("No images uploaded", 400));
  }

  try {
    // Assign the user ID to the product being created (assuming req.user.id exists)
    req.body.user = req.user.id;

    // Initialize an array to store the uploaded image URLs and IDs
    const imagesArray = [];

    // Upload images to Cloudinary
    if (Array.isArray(images)) {
      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "products",
        });
        imagesArray.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    } else {
      // Single image upload
      const result = await cloudinary.uploader.upload(images.tempFilePath, {
        folder: "products",
      });
      imagesArray.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    // Add the uploaded images to the product body
    req.body.images = imagesArray;

    // Create the product in the database
    const product = await Product.create(req.body);

    // Send success response with created product details
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    // Handle any errors that occur during image uploading or product creation
    console.error("Error creating product:", error);
    return next(new ErrorHandler("Failed to create product", 500));
  }
});

// get all products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.find();
    const productsCount = products.length;
    res.status(200).json({ success: true, products, productsCount });
  } catch (error) {
    console.error("Error getting all products:", error);
    return next(error);
  }
});

// get single product by ID
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error getting product details:", error);
    return next(error);
  }
});



// Update product -- admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const { name, category, subCategory, description, foodType, price } = req.body;
  const images = req.files ? req.files.images : [];


  let imagesArray = product.images; // Preserve existing images if no new images are provided

  // If new images are provided, clear the existing images from Cloudinary and the array
  if (images.length > 0) {
    for (const image of imagesArray) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    imagesArray = [];

    // Upload new images to Cloudinary
    if (Array.isArray(images)) {
      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "products",
        });
        imagesArray.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    } else if (images) {
      // Single image upload
      const result = await cloudinary.uploader.upload(images.tempFilePath, {
        folder: "products",
      });
      imagesArray.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  // Update the product details
  product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      category,
      subCategory,
      description,
      foodType,
      price,
      images: imagesArray, // Update images array
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});


// Delete product -- admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await Product.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
});

// Get reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({ success: true, reviews: product.reviews });
});

// Delete product review

exports.deleteProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Filter out the review to be deleted
  product.reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  // Recalculate ratings and numOfReviews
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;
  product.numOfReviews = product.reviews.length;

  // Save the updated product
  await product.save();

  res
    .status(200)
    .json({ success: true, message: "Review deleted successfully" });
});

// Get all products by category
exports.getProductsByCategory = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find({ category: req.params.category });
  res.status(200).json({ success: true, products });
});

// Get all products by subcategory
exports.getProductsBySubcategory = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find({ subCategory: req.params.subcategory });
  res.status(200).json({ success: true, products });
});

// Get all products by foodType
exports.getProductsByFoodType = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find({ foodType: req.params.foodType });
  res.status(200).json({ success: true, products });
});

// Update product stock -- admin
exports.updateProductStock = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product.stock = req.body.stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product stock updated successfully",
    product,
  });
});
