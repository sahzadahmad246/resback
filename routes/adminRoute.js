const express = require("express");
const router = express.Router();
const { addOutletInfo, updateOutletInfo, getOutletInfo } = require("../controllers/adminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// Route to get outlet information
router.get("/admin/outlet-info", getOutletInfo);

// Route to add outlet information
router.post("/admin/outlet-info", isAuthenticatedUser, authorizeRoles("admin"), addOutletInfo);

// Route to update outlet information
router.put("/admin/outlet-info/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOutletInfo);

module.exports = router;
