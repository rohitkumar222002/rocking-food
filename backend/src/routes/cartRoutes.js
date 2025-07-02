const express = require("express");
const router = express.Router();
const {
    getCart,
} = require("../controllers/cartController");

// Routes
router.get("/", getCart);

module.exports = router;
