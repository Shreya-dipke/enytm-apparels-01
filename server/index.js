
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cron from "node-cron";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

dotenv.config({ path: path.join(ROOT, ".env") });

const PORT = Number(process.env.PORT || 5173);
const isProd = process.env.NODE_ENV === "production";

const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "uploads");

const publicBackendUrl = String(
  process.env.PUBLIC_BACKEND_URL || ""
).trim().replace(/\/+$/, "");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "image";

    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const uploadImageFile = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, JPEG, PNG and WEBP images are allowed.")
      );
    }

    cb(null, true);
  },
});

const uploadVideoFile = multer({
  storage: uploadStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      !["video/mp4", "video/webm", "video/quicktime"].includes(
        file.mimetype
      )
    ) {
      return cb(new Error("Upload an MP4, WEBM or MOV video."));
    }

    cb(null, true);
  },
});

const adapter = new JSONFile(path.join(ROOT, "data", "db.json"));

const db = new Low(adapter, {
  users: [],
  products: [],
  orders: [],
  carts: [],
  wishlists: [],
  coupons: [],
  settings: {
    storeName: "ENYTM APPARELS",
    tagline: "more than a moment",
    whatsapp: "",
    supportEmail: "",
    shippingFreeAbove: 1999,
    shippingCharge: 99,
  },
});

await db.read();

if (!db.data) {
  db.data = {
    users: [],
    products: [],
    orders: [],
    carts: [],
    wishlists: [],
    coupons: [],
    settings: {},
  };
}

if (!Array.isArray(db.data.pendingOtps)) {
  db.data.pendingOtps = [];
}

if (!Array.isArray(db.data.passwordResetOtps)) {
  db.data.passwordResetOtps = [];
}

if (!Array.isArray(db.data.coupons)) {
  db.data.coupons = [];
}

const seedProducts = [
  {
    id: 1,
    name: "Essential Oversized Tee",
    category: "Oversized",
    price: 999,
    oldPrice: 1199,
    stock: 50,
    badge: "NEW",
    fabric: "240 GSM Premium Cotton",
    description: "A structured oversized silhouette made for everyday movement.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "Heavyweight Oversized Tee",
    category: "Oversized",
    price: 1099,
    oldPrice: 1299,
    stock: 50,
    badge: "BESTSELLER",
    fabric: "260 GSM Premium Cotton",
    description: "A heavier everyday essential with a premium drape.",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 3,
    name: "Organic Signature Polo",
    category: "Polos",
    price: 899,
    oldPrice: 1099,
    stock: 40,
    badge: "SIGNATURE",
    fabric: "280 GSM Organic Cotton",
    description: "Minimal branding. Elevated texture. Designed beyond one occasion.",
    image: "https://images.unsplash.com/photo-1625910513413-5fc45c2f9c3f?auto=format&fit=crop&w=1200&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 4,
    name: "Core French Terry Sweatshirt",
    category: "Sweatshirts",
    price: 1499,
    oldPrice: 1699,
    stock: 30,
    badge: "CORE",
    fabric: "360 GSM French Terry",
    description: "Clean proportions and substantial weight for a premium layer.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: "Everyday Pullover Hoodie",
    category: "Hoodies",
    price: 1699,
    oldPrice: 1899,
    stock: 30,
    badge: "NEW",
    fabric: "380 GSM Cotton Blend",
    description: "A premium relaxed hoodie with a deep hood and heavyweight hand feel.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 6,
    name: "Minimal Logo Tee",
    category: "Oversized",
    price: 949,
    oldPrice: 1099,
    stock: 50,
    badge: "",
    fabric: "240 GSM Cotton",
    description: "A refined oversized tee with subtle ENYTM identity.",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
];

if (!db.data.products.length) {
  db.data.products = seedProducts;
}

if (!db.data.settings.shippingFreeAbove) {
  db.data.settings = {
    ...db.data.settings,
    shippingFreeAbove: 1999,
    shippingCharge: 99,
  };
}

await db.write();

const app = express();

// Serve uploaded images from the configured upload directory.
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(cors({ origin: true, credentials: true }));

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}

function signUser(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "customer",
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    );
    next();
  } catch {
    return res.status(401).json({
      message: "Please login to continue.",
    });
  }
}

function adminAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    );

    if (payload.role !== "admin") throw new Error();

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      message: "Admin authentication required.",
    });
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);

function totals(items) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const shipping =
    subtotal === 0 ||
    subtotal >= Number(db.data.settings.shippingFreeAbove || 1999)
      ? 0
      : Number(db.data.settings.shippingCharge || 99);

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

async function sendEmail(to, subject, html) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !to
  ) {
    if (String(process.env.OTP_DEV_MODE) === "true") {
      console.log(
        `[ENYTM DEV EMAIL] To: ${to} | Subject: ${subject} | ${html.replace(/<[^>]*>/g, " ")}`
      );
      return { dev: true };
    }

    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return { sent: true };
}

function normalizeIndianPhone(value) {
  const raw = String(value || "").trim().replace(/[\s()-]/g, "");

  if (/^\d{10}$/.test(raw)) return `+91${raw}`;
  if (/^91\d{10}$/.test(raw)) return `+${raw}`;
  if (/^\+91\d{10}$/.test(raw)) return raw;

  return null;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
    String(value || "").trim().toLowerCase()
  );
}

function otpHash(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}
