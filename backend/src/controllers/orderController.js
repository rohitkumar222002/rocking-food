const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
exports.createOrder = async (req, res) => {
    try {
      const { products, total } = req.body;
      const userId = req.user.id;
  
      // Enhanced validation with detailed errors
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Products array with at least one item is required" 
        });
      }
  
      // Check each product for required fields
      const invalidProducts = products.map((p, index) => {
        const errors = [];
        if (!p.productId) errors.push("productId is required");
        if (!p.name) errors.push("name is required");
        if (!p.quantity) errors.push("quantity is required");
        if (!p.price) errors.push("price is required");
        return errors.length ? { productIndex: index, errors } : null;
      }).filter(Boolean);
  
      if (invalidProducts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Product validation failed",
          invalidProducts
        });
      }
  
      // Rest of your order creation logic...
      const order = await prisma.order.create({
        data: {
          userId,
          products,
          total,
          status: "Pending"
        }
      });
  
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order
      });
  
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: err.message
      });
    }
  };
  exports.getUserOrders = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
  
      // Orders fetch karo
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });
  
      // User ka data attach karo (ek hi user hai to baar baar DB hit nahi karna)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
  
      // Orders me user attach karo
      const ordersWithUser = orders.map(order => ({
        ...order,
        user,
      }));
  
      // Total count
      const totalOrders = await prisma.order.count({ where: { userId } });
  
      // Response
      res.json({
        success: true,
        data: ordersWithUser,
        meta: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / limit),
        },
      });
    } catch (err) {
      console.error("Fetch user orders error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: process.env.NODE_ENV === 'development' ? err.message : null,
      });
    }
  };
  
  exports.getAllOrders = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const whereClause = status ? { status } : {};
  
      // ऑर्डर्स फेच करो
      const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });
  
      // यूजर डिटेल्स जोड़ो
      const ordersWithUser = await Promise.all(
        orders.map(async (order) => {
          const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { id: true, name: true, email: true },
          });
          return { ...order, user };
        })
      );
  
      // टोटल काउंट
      const totalOrders = await prisma.order.count({ where: whereClause });
  
      // रेस्पॉन्स
      res.json({
        success: true,
        data: ordersWithUser,
        meta: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / limit),
          filter: status ? { status } : null,
        },
      });
    } catch (err) {
      console.error("Fetch all orders error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch all orders",
        error: process.env.NODE_ENV === 'development' ? err.message : null,
      });
    }
  };
  
  exports.updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Validate status input
      const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Valid values are: " + validStatuses.join(", ")
        });
      }
  
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id: parseInt(id) }
      });
  
      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
  
      // Prevent invalid status transitions
      if (existingOrder.status === "Cancelled" && status !== "Cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cannot change status of a cancelled order"
        });
      }
  
      if (existingOrder.status === "Delivered") {
        return res.status(400).json({
          success: false,
          message: "Cannot change status of a delivered order"
        });
      }
  
      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status }
      });
  
      // Optionally, fetch user info (if you want to attach user info separately)
      const user = await prisma.user.findUnique({
        where: { id: existingOrder.userId },
        select: {
          id: true,
          name: true,
          email: true
        }
      });
  
      res.json({
        success: true,
        message: "Order status updated successfully",
        order: {
          ...updatedOrder,
          user
        }
      });
  
    } catch (err) {
      console.error("Update order status error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update order",
        error: err.message
      });
    }
  };
  exports.getSingleOrder = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) }
      });
  
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
  
      // Fetch user info (optional)
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: {
          id: true,
          name: true,
          email: true
        }
      });
  
      res.json({
        success: true,
        data: {
          ...order,
          user
        }
      });
  
    } catch (err) {
      console.error("Fetch single order error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
        error: err.message
      });
    }
  };
  
