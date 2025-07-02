const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !image) {
      return res.status(400).json({ success: false, message: "Name and image are required" });
    }

    const category = await prisma.category.create({
      data: { name, image },
    });

    res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ success: false, message: "Failed to create category", error: err.message });
  }
};

// List all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: "desc" } });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories", error: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, image },
    });

    res.json({ success: true, message: "Category updated successfully", data: category });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ success: false, message: "Failed to update category", error: err.message });
  }
};
