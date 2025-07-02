const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/profile", requireAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json({
    message: "Welcome to your profile",
    user: safeUser,
  });
});

module.exports = router;
