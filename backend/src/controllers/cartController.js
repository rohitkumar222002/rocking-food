const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ Get All Cart Items
exports.getCart = async (req, res) => {
    try {
        const carts = await prisma.cart.findMany({
            orderBy: { id: "desc" },
            include: {
                user: true,
                product: true,
            },
        });
        res.json({ success: true, data: carts });
    } catch (err) {
        console.error("Get carts error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch carts",
            error: err.message,
        });
    }
};

// ✅ Add Item to Cart
exports.addCart = async (req, res) => {
    try {
        let { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "userId and productId are required",
            });
        }

        // Convert to integers if needed
        userId = parseInt(userId, 10);
        productId = parseInt(productId, 10);
        quantity = parseInt(quantity, 10);

        // Check if cart item already exists
        const existingCartItem = await prisma.cart.findFirst({
            where: {
                userId: userId,
                productId: productId,
            },
        });

        let cartItem;

        if (existingCartItem) {
            // Update quantity (increase existing)
            cartItem = await prisma.cart.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: existingCartItem.quantity + quantity,
                },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cart.create({
                data: {
                    userId,
                    productId,
                    quantity,
                },
            });
        }

        res.status(201).json({
            success: true,
            message: existingCartItem
                ? "Cart item quantity updated"
                : "Cart item added successfully",
            data: cartItem,
        });
    } catch (err) {
        console.error("Create Cart error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart",
            error: err.message,
        });
    }
};


exports.qtyCart = async (req, res) => {
    try {
        let { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "userId and productId are required",
            });
        }

        // Convert to integers
        userId = parseInt(userId, 10);
        productId = parseInt(productId, 10);
        quantity = parseInt(quantity, 10);

        const existingCartItem = await prisma.cart.findFirst({
            where: {
                userId,
                productId,
            },
        });

        let cartItem;

        if (existingCartItem) {
            const newQuantity = Math.max(existingCartItem.quantity - quantity, 1);

            // Update but never go below 1
            cartItem = await prisma.cart.update({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity },
            });

            return res.status(200).json({
                success: true,
                message: "Cart item quantity decreased (min 1)",
                data: cartItem,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

    } catch (err) {
        console.error("Update Cart error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update cart item quantity",
            error: err.message,
        });
    }
};


exports.deleteCartItem = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Cart item id is required",
            });
        }

        // Check if the item exists first
        const existingItem = await prisma.cart.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        const deletedItem = await prisma.cart.delete({
            where: {
                id: parseInt(id, 10),
            },
        });

        res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
            data: deletedItem,
        });
    } catch (err) {
        console.error("Delete Cart Item error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete cart item",
            error: err.message,
        });
    }
};



