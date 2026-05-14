import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");
const hasBuiltClient = fs.existsSync(clientDistPath);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post("/api/purchase", async (req, res) => {
  const { productId, quantity, customerName } = req.body;

  if (!productId || !quantity || !customerName) {
    return res.status(400).json({ message: "productId, quantity, and customerName are required." });
  }

  if (Number(quantity) < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  if (product.stock < Number(quantity)) {
    return res.status(400).json({ message: "Not enough stock available." });
  }

  product.stock -= Number(quantity);
  await product.save();

  const order = await Order.create({
    customerName: String(customerName).trim(),
    productId: product._id,
    quantity: Number(quantity),
    totalAmount: product.price * Number(quantity),
  });

  return res.status(201).json({
    message: "Purchase simulated successfully.",
    order,
  });
});

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany([
    {
      name: "Notebook",
      price: 199,
      stock: 10,
      description: "Simple ruled notebook",
    },
    {
      name: "Wireless Mouse",
      price: 599,
      stock: 8,
      description: "Compact 2.4GHz mouse",
    },
    {
      name: "Water Bottle",
      price: 299,
      stock: 15,
      description: "750ml reusable bottle",
    },
  ]);
}

if (hasBuiltClient) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    await seedProducts();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
