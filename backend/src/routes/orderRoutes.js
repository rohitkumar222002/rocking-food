const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getSingleOrder 
} = require("../controllers/orderController");
const requireAuth = require("../middleware/authMiddleware");

// User
router.post("/", requireAuth, createOrder);
router.get("/", requireAuth, getUserOrders);

// Admin
router.get("/all", getAllOrders);
router.patch("/status/:id", updateOrderStatus);
router.get("/:id", requireAuth, getSingleOrder);


module.exports = router;
