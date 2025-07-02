const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//Get Cart
exports.getCart = async (req, res) => {
    try {
        const carts = await prisma.cart.findMany({ orderBy: { id: "desc" } });
        res.json({ success: true, data: carts });
    } catch (err) {
        console.error("Get carts error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch carts", error: err.message });
    }
};

