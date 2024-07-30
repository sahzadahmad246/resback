const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  getProductReviews,
  deleteProductReview,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByFoodType,
  updateProductStock,
} = require("../controllers/productController");
const { CreateOrUpdateReview } = require("../controllers/userController");

router
  .route("/admin/products/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.route("/products").get(getAllProducts);

router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.put(
  "/admin/product/stock/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProductStock
);
router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser, CreateOrUpdateReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteProductReview);

router.route("/products/category/:category").get(getProductsByCategory);
router
  .route("/products/subcategory/:subcategory")
  .get(getProductsBySubcategory);
router.route("/products/foodtype/:foodtype").get(getProductsByFoodType);

module.exports = router;
