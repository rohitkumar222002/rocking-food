const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      orderBy: { createdAt: "desc" }
    });

    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        if (!product.categoryId) {
          return { ...product, category: null };
        }
        
        const category = await prisma.category.findUnique({
          where: { id: product.categoryId },
          select: { id: true, name: true, image: true }
        });

        return { ...product, category };
      })
    );

    res.json(productsWithCategory);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      message: "Failed to fetch products",
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};
exports.createProduct = async (req, res) => {
  const { name, description, price, image,categoryId } = req.body;
  try {
    const product = await prisma.products.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId:categoryId ? parseInt(categoryId) : null,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({
      message: "Failed to create product",
      error: err.message
    });
  }
};