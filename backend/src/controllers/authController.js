const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined");
  process.exit(1);
}

// Helper function to sanitize user object
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Register
exports.register = async (req, res) => {
  try {
    // Input validation
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });


    // Respond with token and sanitized user data
    res.status(201).json({ 
      token, 
      user: sanitizeUser(user) 
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // Input validation
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });


    // Respond with token and sanitized user data
    res.json({ 
      token, 
      user: sanitizeUser(user) 
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};