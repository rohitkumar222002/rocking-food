const express = require("express");
const router = express.Router();
const {
    getCart,
    addCart,
    qtyCart,
    deleteCartItem,
} = require("../controllers/cartController");

// Routes
router.get("/", getCart);
router.post("/", addCart);
router.post("/sub", qtyCart);
router.delete("/empty", deleteCartItem);




module.exports = router;
