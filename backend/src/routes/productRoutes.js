const express = require("express");
const router = express.Router();
const { createProduct, getProducts } = require("../controllers/productController");
const requireAuth = require("../middleware/authMiddleware");

// Public route: Get all
router.get("/", getProducts);

// Protected route: Create product (admin/user)
router.post("/", requireAuth, createProduct);

module.exports = router;
