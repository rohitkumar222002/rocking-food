const express = require("express");
const router = express.Router();
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");


const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require('./routes/cartRoutes');

const requireAuth = require("./middleware/authMiddleware");
const requireAdmin = require("./middleware/adminMiddleware");



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send("Rocking-Food Backend is Running ✅");
});
router.get("api/admin/dashboard", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "Welcome admin" });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);


app.use("/api/cart", cartRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});