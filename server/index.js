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
// Load .env from the project root explicitly. This avoids login failures when
// the server is started from a different working directory.
dotenv.config({ path: path.join(ROOT, ".env") });
const PORT = Number(process.env.PORT || 5173);
const isProd = process.env.NODE_ENV === "production";

const uploadsDir = path.join(__dirname, "uploads");
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
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
    cb(null, true);
  },
});
const uploadVideoFile = multer({
  storage: uploadStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.mimetype)) {
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
    shippingCharge: 99
  }
});

await db.read();
if (!db.data) db.data = { users: [], products: [], orders: [], carts: [], wishlists: [], coupons: [], settings: {} };
if (!Array.isArray(db.data.pendingOtps)) db.data.pendingOtps = [];
if (!Array.isArray(db.data.passwordResetOtps)) db.data.passwordResetOtps = [];\nif (!Array.isArray(db.data.coupons)) db.data.coupons = [];

const seedProducts = [
  { id: 1, name: "Essential Oversized Tee", category: "Oversized", price: 999, oldPrice: 1199, stock: 50, badge: "NEW", fabric: "240 GSM Premium Cotton", description: "A structured oversized silhouette made for everyday movement.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85", sizes: ["S","M","L","XL","XXL"] },
  { id: 2, name: "Heavyweight Oversized Tee", category: "Oversized", price: 1099, oldPrice: 1299, stock: 50, badge: "BESTSELLER", fabric: "260 GSM Premium Cotton", description: "A heavier everyday essential with a premium drape.", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85", sizes: ["S","M","L","XL","XXL"] },
  { id: 3, name: "Organic Signature Polo", category: "Polos", price: 899, oldPrice: 1099, stock: 40, badge: "SIGNATURE", fabric: "280 GSM Organic Cotton", description: "Minimal branding. Elevated texture. Designed beyond one occasion.", image: "https://images.unsplash.com/photo-1625910513413-5fc45c2f9c3f?auto=format&fit=crop&w=1200&q=85", sizes: ["S","M","L","XL","XXL"] },
  { id: 4, name: "Core French Terry Sweatshirt", category: "Sweatshirts", price: 1499, oldPrice: 1699, stock: 30, badge: "CORE", fabric: "360 GSM French Terry", description: "Clean proportions and substantial weight for a premium layer.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85", sizes: ["S","M","L","XL","XXL"] },
  { id: 5, name: "Everyday Pullover Hoodie", category: "Hoodies", price: 1699, oldPrice: 1899, stock: 30, badge: "NEW", fabric: "380 GSM Cotton Blend", description: "A premium relaxed hoodie with a deep hood and heavyweight hand feel.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85", sizes: ["S","M","L","XL","XXL"] },
  { id: 6, name: "Minimal Logo Tee", category: "Oversized", price: 949, oldPrice: 1099, stock: 50, badge: "", fabric: "240 GSM Cotton", description: "A refined oversized tee with subtle ENYTM identity.", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=85", sizes: ["S","M","L","XL","XXL"] }
];

if (!db.data.products.length) db.data.products = seedProducts;
if (!db.data.settings.shippingFreeAbove) db.data.settings = { ...db.data.settings, shippingFreeAbove: 1999, shippingCharge: 99 };
await db.write();

const app = express();
app.use("/uploads", express.static(uploadsDir));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role || "customer" }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch {
    return res.status(401).json({ message: "Please login to continue." });
  }
}

function adminAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    if (payload.role !== "admin") throw new Error();
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Admin authentication required." });
  }
}

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use("/api/", apiLimiter);

function totals(items) {
  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const shipping = subtotal === 0 || subtotal >= Number(db.data.settings.shippingFreeAbove || 1999) ? 0 : Number(db.data.settings.shippingCharge || 99);
  return { subtotal, shipping, total: subtotal + shipping };
}

async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !to) {
    if (String(process.env.OTP_DEV_MODE) === "true") {
      console.log(`[ENYTM DEV EMAIL] To: ${to} | Subject: ${subject} | ${html.replace(/<[^>]*>/g, " ")}`);
      return { dev: true };
    }
    return { skipped: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html });
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim().toLowerCase());
}

function otpHash(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function startTwilioSmsVerification(phone) {
  // Development mode: skip Twilio completely.
  // This prevents invalid or outdated Twilio credentials from
  // breaking local registration tests.
  if (String(process.env.OTP_DEV_MODE) === "true") {
    return { dev: true };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!sid || !token || !serviceSid) {
    throw new Error(
      "Mobile OTP is not configured. Add Twilio Verify credentials to .env."
    );
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const body = new URLSearchParams({
    To: phone,
    Channel: "sms",
  });

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Could not send mobile OTP."
    );
  }

  return data;
}

async function checkTwilioSmsVerification(phone, code) {
  // Development mode: accept only the configured local test code.
  // This does not verify ownership of the phone number.
  if (String(process.env.OTP_DEV_MODE) === "true") {
    return (
      String(code) ===
      String(process.env.DEV_PHONE_OTP || "123456")
    );
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!sid || !token || !serviceSid) {
    throw new Error("Mobile OTP is not configured.");
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const body = new URLSearchParams({
    To: phone,
    Code: code,
  });

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Could not verify mobile OTP."
    );
  }

  return data.status === "approved";
}

async function sendWhatsApp(phone, body) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID || !phone) return { skipped: true };
  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone.replace(/\D/g, ""),
      type: "text",
      text: { preview_url: false, body }
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "WhatsApp API error");
  return data;
}

async function sendWhatsAppTemplate(phone, templateName, languageCode, parameters=[]) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID || !phone || !templateName) return { skipped: true };
  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const components = parameters.length ? [{ type: "body", parameters: parameters.map(text => ({ type: "text", text: String(text) })) }] : [];
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: phone.replace(/\D/g, ""), type: "template", template: { name: templateName, language: { code: languageCode || process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" }, ...(components.length ? {components} : {}) } })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "WhatsApp template API error");
  return data;
}

async function notifyOrder(order, type) {
  const user = db.data.users.find(u => u.id === order.userId);
  if (!user) return;
  order.notifications = order.notifications || {};
  const isPlaced = type === "placed";
  const subject = isPlaced ? `ENYTM Order Confirmed — ${order.receipt}` : `ENYTM Order Delivered — ${order.receipt}`;
  const heading = isPlaced ? "Your ENYTM order is confirmed." : "Your ENYTM order has been delivered.";
  const html = `<div style="font-family:Arial,sans-serif"><h2>${heading}</h2><p>Order: <b>${order.receipt}</b></p><p>Total: <b>₹${Number(order.total).toLocaleString("en-IN")}</b></p><p>Thank you for choosing ENYTM APPARELS.</p></div>`;
  if (user.emailOptIn !== false && user.email && !order.notifications[`${type}EmailAt`]) {
    try { await sendEmail(user.email, subject, html); order.notifications[`${type}EmailAt`] = Date.now(); } catch (e) { console.error(`[ENYTM EMAIL ${type}]`, e.message); }
  }
  if (user.whatsappOptIn && user.phone && !order.notifications[`${type}WhatsAppAt`]) {
    const templateName = isPlaced ? process.env.WHATSAPP_ORDER_PLACED_TEMPLATE : process.env.WHATSAPP_ORDER_DELIVERED_TEMPLATE;
    const params = isPlaced ? [user.name || "Customer", order.receipt, `₹${Number(order.total).toLocaleString("en-IN")}`] : [user.name || "Customer", order.receipt];
    try {
      if (templateName) {
        await sendWhatsAppTemplate(user.phone, templateName, process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US", params);
        order.notifications[`${type}WhatsAppAt`] = Date.now();
      } else if (String(process.env.WHATSAPP_TEXT_FALLBACK) === "true") {
        const text = isPlaced ? `Hi ${user.name || "Customer"}, your ENYTM order ${order.receipt} has been placed successfully. Total: ₹${Number(order.total).toLocaleString("en-IN")}.` : `Hi ${user.name || "Customer"}, your ENYTM order ${order.receipt} has been delivered. Thank you for shopping with ENYTM APPARELS.`;
        await sendWhatsApp(user.phone, text);
        order.notifications[`${type}WhatsAppAt`] = Date.now();
      }
    } catch (e) { console.error(`[ENYTM WHATSAPP ${type}]`, e.message); }
  }
  order.updatedAt = Date.now();
  await db.write();
}

// Razorpay webhook must receive the raw body.
app.post("/api/webhooks/razorpay", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "").update(req.body).digest("hex");
    if (!signature || signature !== expected) return res.status(400).send("Invalid signature");
    const event = JSON.parse(req.body.toString("utf8"));
    const payment = event.payload?.payment?.entity;
    if (payment && event.event === "payment.captured") {
      const order = db.data.orders.find(o => o.razorpayOrderId === payment.order_id || o.razorpayOrderIds?.advance === payment.order_id || o.razorpayOrderIds?.balance === payment.order_id);
      if (order) {
        order.paymentIds ||= [];
        if (!order.paymentIds.some(p => p.id === payment.id)) {
          const stage = order.razorpayOrderIds?.balance === payment.order_id ? "balance" : "advance";
          const amount = Number(payment.amount || 0) / 100;
          if (stage === "balance") {
            order.balancePaid = amount;
            order.paymentStatus = "paid";
          } else {
            order.advancePaid = amount;
            order.paymentStatus = "partially_paid";
            if (!order.stockDeducted) {
              for (const item of order.items || []) {
                const product = db.data.products.find(p => p.id === item.productId);
                if (product) product.stock = Math.max(0, Number(product.stock || 0) - Number(item.qty));
              }
              order.stockDeducted = true;
            }
          }
          order.paymentIds.push({ id: payment.id, stage, amount, capturedAt: Date.now() });
          order.paymentId = payment.id;
          order.paymentMethod = payment.method || "online";
          order.status = "confirmed";
          order.updatedAt = Date.now();
          await db.write();
          if (stage === "advance") await notifyOrder(order, "placed");
        }
      }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).send("Webhook error");
  }
});

app.use(express.json());

app.get("/api/products", (req, res) => res.json(db.data.products));
app.get("/api/settings", (req, res) => res.json(db.data.settings));

app.post("/api/auth/register/send-otp", async (req, res) => {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = normalizeIndianPhone(phone);

  if (!name || !normalizedEmail || !password) return res.status(400).json({ message: "Name, email and password are required." });
  if (!validEmail(normalizedEmail)) return res.status(400).json({ message: "Please enter a valid email address." });
  if (!normalizedPhone) return res.status(400).json({ message: "Please enter a valid 10-digit Indian mobile number." });
  if (String(password).length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

  if (db.data.users.some(u => String(u.email).toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: "This email is already registered. Please login instead." });
  }
  if (db.data.users.some(u => normalizeIndianPhone(u.phone) === normalizedPhone)) {
    return res.status(409).json({ message: "This mobile number is already registered. Please login instead." });
  }

  const now = Date.now();
  const recent = db.data.pendingOtps.find(x => x.email === normalizedEmail && now - x.createdAt < 60000);
  if (recent) return res.status(429).json({ message: "OTP was just sent. Please wait 60 seconds before requesting another." });

  const emailOtp = generateOtp();
  const challengeId = crypto.randomUUID();
  const challenge = {
    id: challengeId,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password,
    emailOtpHash: otpHash(emailOtp),
    emailVerified: false,
    phoneVerified: false,
    attempts: 0,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000
  };

  try {
    const emailResult = await sendEmail(
      normalizedEmail,
      "Your ENYTM verification code",
      `<div style="font-family:Arial,sans-serif"><h2>ENYTM APPARELS</h2><p>Your email verification code is:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px">${emailOtp}</p><p>This code expires in 10 minutes.</p><p>If you did not request an ENYTM account, you can ignore this email.</p></div>`
    );

    const smsResult = await startTwilioSmsVerification(normalizedPhone);
    if (String(process.env.OTP_DEV_MODE) === "true") {
      console.log(`[ENYTM DEV OTP] Email ${normalizedEmail}: ${emailOtp} | Phone ${normalizedPhone}: use ${process.env.DEV_PHONE_OTP || "the code shown by your local test provider"}`);
    }

    if (emailResult.skipped && String(process.env.OTP_DEV_MODE) !== "true") throw new Error("Email OTP is not configured. Add SMTP credentials to .env.");
    if (smsResult.skipped && String(process.env.OTP_DEV_MODE) !== "true") throw new Error("Mobile OTP is not configured. Add Twilio Verify credentials to .env.");

    db.data.pendingOtps = db.data.pendingOtps.filter(x => x.email !== normalizedEmail && x.phone !== normalizedPhone);
    db.data.pendingOtps.push(challenge);
    await db.write();

    res.json({
      challengeId,
      message: `Verification OTPs sent to ${normalizedEmail} and ${normalizedPhone.slice(0,3)}******${normalizedPhone.slice(-2)}.`
    });
  } catch (e) {
    return res.status(503).json({ message: e.message || "Could not send verification OTPs." });
  }
});

app.post("/api/auth/register/verify-otp", async (req, res) => {
  const { challengeId, emailOtp, phoneOtp, whatsappOptIn = false, emailOptIn = true } = req.body;
  const challenge = db.data.pendingOtps.find(x => x.id === challengeId);
  if (!challenge) return res.status(400).json({ message: "Verification session expired. Please request new OTPs." });
  if (Date.now() > challenge.expiresAt) return res.status(400).json({ message: "OTP expired. Please request new OTPs." });
  if (challenge.attempts >= 5) return res.status(429).json({ message: "Too many incorrect attempts. Please request new OTPs." });

  const emailOk = otpHash(String(emailOtp || "")) === challenge.emailOtpHash;
  let phoneOk = false;
  try {
    phoneOk = await checkTwilioSmsVerification(challenge.phone, String(phoneOtp || ""));
  } catch (e) {
    return res.status(503).json({ message: e.message || "Could not verify mobile OTP." });
  }

  if (!emailOk || !phoneOk) {
    challenge.attempts += 1;
    await db.write();
    return res.status(400).json({ message: "Incorrect email or mobile OTP. Please check both codes." });
  }

  if (db.data.users.some(u => String(u.email).toLowerCase() === challenge.email)) {
    db.data.pendingOtps = db.data.pendingOtps.filter(x => x.id !== challengeId);
    await db.write();
    return res.status(409).json({ message: "This email is already registered. Please login instead." });
  }
  if (db.data.users.some(u => normalizeIndianPhone(u.phone) === challenge.phone)) {
    db.data.pendingOtps = db.data.pendingOtps.filter(x => x.id !== challengeId);
    await db.write();
    return res.status(409).json({ message: "This mobile number is already registered. Please login instead." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: challenge.name,
    email: challenge.email,
    phone: challenge.phone,
    passwordHash: await bcrypt.hash(challenge.password, 12),
    whatsappOptIn: Boolean(whatsappOptIn),
    emailOptIn: Boolean(emailOptIn),
    emailVerified: true,
    phoneVerified: true,
    role: "customer",
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };
  db.data.users.push(user);
  db.data.pendingOtps = db.data.pendingOtps.filter(x => x.id !== challengeId);
  await db.write();
  res.json({ token: signUser(user), user: publicUser(user), message: "Account created and both email and mobile numbers verified." });
});


app.post("/api/auth/password-reset/send-otp", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ message: "Please enter a valid email address." });
  const user = db.data.users.find(u => String(u.email).toLowerCase() === email);
  // Avoid revealing whether an account exists. In development mode, the OTP is logged locally.
  if (!user) return res.json({ message: "If that email is registered, a reset code has been sent." });
  db.data.passwordResetOtps ||= [];
  const now = Date.now();
  const recent = db.data.passwordResetOtps.find(x => x.email === email && now - x.createdAt < 60000);
  if (recent) return res.status(429).json({ message: "A reset code was just requested. Please wait 60 seconds." });
  const code = generateOtp();
  const challengeId = crypto.randomUUID();
  try {
    const result = await sendEmail(email, "Reset your ENYTM password", `<div style="font-family:Arial,sans-serif"><h2>ENYTM APPARELS</h2><p>Your password reset code is:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`);
    if (result.skipped && String(process.env.OTP_DEV_MODE) !== "true") throw new Error("Password reset email is not configured.");
    db.data.passwordResetOtps = db.data.passwordResetOtps.filter(x => x.email !== email);
    db.data.passwordResetOtps.push({ id: challengeId, email, codeHash: otpHash(code), attempts: 0, createdAt: now, expiresAt: now + 10 * 60 * 1000 });
    await db.write();
    if (String(process.env.OTP_DEV_MODE) === "true") console.log(`[ENYTM DEV PASSWORD RESET] ${email}: ${code}`);
    return res.json({ challengeId, message: "If that email is registered, a reset code has been sent." });
  } catch (e) {
    return res.status(503).json({ message: e.message || "Could not send reset code." });
  }
});

app.post("/api/auth/password-reset/confirm", async (req, res) => {
  const { challengeId, otp, password } = req.body;
  if (String(password || "").length < 8) return res.status(400).json({ message: "Your new password must be at least 8 characters." });
  db.data.passwordResetOtps ||= [];
  const challenge = db.data.passwordResetOtps.find(x => x.id === challengeId);
  if (!challenge || Date.now() > challenge.expiresAt) return res.status(400).json({ message: "Reset code expired. Please request another code." });
  if (challenge.attempts >= 5) return res.status(429).json({ message: "Too many attempts. Request a new reset code." });
  if (otpHash(String(otp || "")) !== challenge.codeHash) {
    challenge.attempts += 1; await db.write();
    return res.status(400).json({ message: "Incorrect reset code." });
  }
  const user = db.data.users.find(u => String(u.email).toLowerCase() === challenge.email);
  if (!user) return res.status(400).json({ message: "Could not reset password. Please request a new code." });
  user.passwordHash = await bcrypt.hash(String(password), 12);
  db.data.passwordResetOtps = db.data.passwordResetOtps.filter(x => x.id !== challengeId);
  await db.write();
  return res.json({ message: "Password updated successfully." });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.data.users.find(u => u.email === String(email || "").toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
  user.lastLoginAt = Date.now();
  await db.write();
  res.json({ token: signUser(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  res.json(publicUser(user));
});

app.put("/api/auth/profile", auth, async (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  const { name, phone, whatsappOptIn, emailOptIn, address } = req.body;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (whatsappOptIn !== undefined) user.whatsappOptIn = Boolean(whatsappOptIn);
  if (emailOptIn !== undefined) user.emailOptIn = Boolean(emailOptIn);
  if (address !== undefined) user.address = address;
  await db.write();
  res.json(publicUser(user));
});

app.post("/api/cart/sync", auth, async (req, res) => {
  const existing = db.data.carts.find(c => c.userId === req.user.id);
  const record = { userId: req.user.id, items: req.body.items || [], updatedAt: Date.now(), remindedAt: existing?.remindedAt || null };
  if (existing) Object.assign(existing, record); else db.data.carts.push(record);
  await db.write();
  res.json({ ok: true });
});

app.post("/api/wishlist/sync", auth, async (req, res) => {
  const existing = db.data.wishlists.find(c => c.userId === req.user.id);
  const record = { userId: req.user.id, items: req.body.items || [], updatedAt: Date.now(), remindedAt: existing?.remindedAt || null };
  if (existing) Object.assign(existing, record); else db.data.wishlists.push(record);
  await db.write();
  res.json({ ok: true });
});

app.post("/api/checkout/order", auth, async (req, res) => {
  const items = req.body.items || [];
  const shippingAddress = req.body.shippingAddress;
  if (!items.length) return res.status(400).json({ message: "Your cart is empty." });
  if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.pincode) {
    return res.status(400).json({ message: "Complete your delivery details." });
  }

  const safeItems = [];
  for (const i of items) {
    const product = db.data.products.find(p => p.id === Number(i.id));
    const qty = Number(i.qty);
    if (!product) continue;
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: `Invalid quantity for ${product.name}.` });
    const stock = Number(product.stock || 0);
    if (stock <= 0) return res.status(409).json({ message: `${product.name} is out of stock.` });
    if (qty > stock) return res.status(409).json({ message: `${product.name} has only ${stock} item${stock === 1 ? "" : "s"} left.` });
    safeItems.push({ productId: product.id, name: product.name, price: product.price, qty, size: i.size, image: product.image });
  }

  const amount = totals(safeItems);
  if (!amount.total) return res.status(400).json({ message: "Invalid order amount." });
  let appliedCoupon = null;
  let discount = 0;
  const couponCode = String(req.body?.couponCode || "").trim().toUpperCase();
  if (couponCode) {
    appliedCoupon = (db.data.coupons || []).find(c => String(c.code).toUpperCase() === couponCode);
    const couponItems = safeItems.map(i => {
      const product = db.data.products.find(p => p.id === i.productId);
      return { ...i, category: product?.category || "" };
    });
    const couponError = getCouponError(appliedCoupon, amount.subtotal, couponItems, req.user.id);
    if (couponError) return res.status(400).json({ message: couponError });
    discount = couponDiscount(appliedCoupon, amount.subtotal, couponItems);
    if (!discount) return res.status(400).json({ message: "This coupon does not apply to the current order." });
  }
  const orderTotal = Math.max(0, amount.total - discount);
  if (orderTotal <= 0) return res.status(400).json({ message: "This coupon makes the order total zero. Please contact ENYTM for this promotion." });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: "Razorpay is not configured. Add Razorpay test/live keys to .env." });
  }

  const advanceAmount = Math.ceil(orderTotal * 0.30);
  const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const receipt = `ENYTM-${Date.now()}`;
  const rpOrder = await razorpay.orders.create({
    amount: Math.round(advanceAmount * 100),
    currency: "INR",
    receipt,
    notes: { customerId: req.user.id, brand: "ENYTM APPARELS", paymentStage: "advance" }
  });

  const order = {
    id: crypto.randomUUID(), receipt, userId: req.user.id, items: safeItems,
    customer: { ...shippingAddress, email: db.data.users.find(u => u.id === req.user.id)?.email },
    subtotal: amount.subtotal, shipping: amount.shipping, discount, couponCode: appliedCoupon?.code || null, couponId: appliedCoupon?.id || null,
    total: orderTotal, advanceAmount, advancePaid: 0, balanceAmount: orderTotal - advanceAmount, balancePaid: 0,
    paymentStage: "advance", paymentStatus: "created", paymentMethod: null, paymentId: null,
    razorpayOrderId: rpOrder.id, razorpayOrderIds: { advance: rpOrder.id }, paymentIds: [],
    status: "payment_pending", stockDeducted: false, createdAt: Date.now(), updatedAt: Date.now()
  };
  db.data.orders.push(order);
  await db.write();
  res.json({ orderId: order.id, razorpayOrderId: rpOrder.id, amount: advanceAmount * 100, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID, advanceAmount, balanceAmount: order.balanceAmount, total: order.total, discount: order.discount, couponCode: order.couponCode });
});

app.post("/api/checkout/verify", auth, async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = db.data.orders.find(o => o.id === orderId && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  const stage = order.razorpayOrderIds?.balance === razorpay_order_id ? "balance" : "advance";
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  const expectedOrderId = order.razorpayOrderIds?.[stage] || order.razorpayOrderId;
  if (expected !== razorpay_signature || expectedOrderId !== razorpay_order_id) return res.status(400).json({ message: "Payment verification failed." });
  if ((order.paymentIds || []).some(p => p.id === razorpay_payment_id)) return res.json({ ok: true, order });
  const amountPaid = stage === "balance" ? Number(order.balanceAmount || 0) : Number(order.advanceAmount || order.total);
  if (stage === "advance") {
    order.advancePaid = amountPaid;
    order.paymentStatus = "partially_paid";
    order.status = "confirmed";
    if (order.couponId && !order.couponUsageCounted) {
      const coupon = (db.data.coupons || []).find(c => c.id === order.couponId);
      if (coupon) {
        coupon.usageCount = Number(coupon.usageCount || 0) + 1;
        coupon.userUsage ||= {};
        coupon.userUsage[req.user.id] = Number(coupon.userUsage[req.user.id] || 0) + 1;
      }
      order.couponUsageCounted = true;
    }
    if (!order.stockDeducted) {
      for (const item of order.items || []) {
        const product = db.data.products.find(p => p.id === item.productId);
        if (product) product.stock = Math.max(0, Number(product.stock || 0) - Number(item.qty));
      }
      order.stockDeducted = true;
      const cart = db.data.carts.find(c => c.userId === req.user.id);
      if (cart) { cart.items = []; cart.updatedAt = Date.now(); }
    }
  } else {
    order.balancePaid = amountPaid;
    order.paymentStatus = "paid";
    order.status = "confirmed";
  }
  order.paymentId = razorpay_payment_id;
  order.paymentIds ||= [];
  order.paymentIds.push({ id: razorpay_payment_id, stage, amount: amountPaid, capturedAt: Date.now() });
  order.paymentMethod = "online";
  order.updatedAt = Date.now();
  await db.write();
  if (stage === "advance") await notifyOrder(order, "placed");
  res.json({ ok: true, order });
});

app.post("/api/orders/:id/balance/order", auth, async (req, res) => {
  const order = db.data.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status === "cancelled") return res.status(409).json({ message: "This order is cancelled." });
  if (order.paymentStatus === "paid") return res.status(409).json({ message: "The balance is already paid." });
  if (Number(order.advancePaid || 0) <= 0) return res.status(409).json({ message: "Pay the advance first." });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: "Razorpay is not configured." });
  const balanceAmount = Number(order.total) - Number(order.advancePaid);
  const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const rpOrder = await razorpay.orders.create({ amount: Math.round(balanceAmount * 100), currency: "INR", receipt: `${order.receipt}-BAL-${Date.now()}`, notes: { customerId: req.user.id, orderId: order.id, paymentStage: "balance", brand: "ENYTM APPARELS" } });
  order.razorpayOrderIds ||= {};
  order.razorpayOrderIds.balance = rpOrder.id;
  order.balanceAmount = balanceAmount;
  order.paymentStage = "balance";
  order.updatedAt = Date.now();
  await db.write();
  res.json({ orderId: order.id, razorpayOrderId: rpOrder.id, amount: Math.round(balanceAmount * 100), currency: "INR", keyId: process.env.RAZORPAY_KEY_ID, balanceAmount });
});

app.get("/api/orders/my", auth, (req, res) => res.json(db.data.orders.filter(o => o.userId === req.user.id).sort((a,b) => b.createdAt-a.createdAt)));
// GET SINGLE CUSTOMER ORDER
app.get("/api/orders/:id", auth, (req, res) => {
  const order = db.data.orders.find(
    o => String(o.id) === String(req.params.id) &&
         String(o.userId) === String(req.user.id)
  );

  if (!order) {
    return res.status(404).json({
      message: "Order not found."
    });
  }

  res.json(order);
});
// CUSTOMER ORDER DETAILS
app.get("/api/orders/:id", auth, (req, res) => {
  const order = db.data.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json(order);
});

// CUSTOMER ORDER CANCELLATION
app.post("/api/orders/:id/cancel", auth, async (req, res) => {
  const order = db.data.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  const blocked = ["shipped", "out_for_delivery", "delivered", "cancelled"];
  if (blocked.includes(String(order.status))) {
    return res.status(409).json({ message: "This order can no longer be cancelled." });
  }

  order.status = "cancelled";
  order.cancelledAt = Date.now();
  order.updatedAt = Date.now();

  // Restore stock only once.
  if (order.stockDeducted && !order.stockRestored) {
    for (const item of (order.items || [])) {
      const product = db.data.products.find(p => p.id === Number(item.productId));
      if (product) product.stock = Number(product.stock || 0) + Number(item.qty || 0);
    }
    order.stockRestored = true;
  }

  // If Razorpay payment was already captured, attempt a refund.
  const capturedPayments = (order.paymentIds || []).filter(p => p.id && Number(p.amount) > 0);
  if (capturedPayments.length && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const refundIds = [];
      for (const payment of capturedPayments) {
        const refund = await razorpay.payments.refund(payment.id, { amount: Math.round(Number(payment.amount) * 100) });
        refundIds.push(refund.id);
      }
      order.refundStatus = "initiated";
      order.refundIds = refundIds;
    } catch (e) {
      order.refundStatus = "pending_manual_refund";
      order.refundError = e.message;
    }
  } else if (!capturedPayments.length) {
    order.refundStatus = "not_required";
  }

  await db.write();
  res.json(order);
});

// CUSTOMER SIZE CHANGE — available only before shipment.
app.post("/api/orders/:id/change-size", auth, async (req, res) => {
  const order = db.data.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (["shipped", "out_for_delivery", "delivered", "cancelled"].includes(String(order.status))) {
    return res.status(409).json({ message: "Size can no longer be changed after shipment." });
  }

  const productId = Number(req.body?.productId);
  const newSize = String(req.body?.size || "").trim().toUpperCase();
  const item = (order.items || []).find(i => Number(i.productId) === productId);
  if (!item) return res.status(404).json({ message: "Product not found in this order." });

  const product = db.data.products.find(p => p.id === productId);
  const availableSizes = Array.isArray(product?.sizes) && product.sizes.length
    ? product.sizes.map(String).map(x => x.toUpperCase())
    : ["S", "M", "L", "XL", "XXL"];
  if (!availableSizes.includes(newSize)) {
    return res.status(400).json({ message: `Size ${newSize} is not available for this product.` });
  }

  item.size = newSize;
  order.updatedAt = Date.now();
  await db.write();
  res.json(order);
});

app.post("/api/admin/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const configuredEmail = String(process.env.ADMIN_EMAIL || "admin@enytm.co.in").trim().toLowerCase();
  const configuredPassword = String(process.env.ADMIN_PASSWORD || "change-me");
  if (!email || !password) return res.status(400).json({ message: "Enter both admin email and password." });
  if (email !== configuredEmail || password !== configuredPassword) {
    return res.status(401).json({ message: "Invalid admin credentials. Check ADMIN_EMAIL and ADMIN_PASSWORD in the project .env, then restart the server." });
  }
  const token = jwt.sign({ email: configuredEmail, role: "admin" }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "12h" });
  res.json({ token });
});

app.get("/api/admin/dashboard", adminAuth, (req, res) => {
  const revenue = db.data.orders.filter(o => o.paymentStatus === "paid").reduce((s,o)=>s+o.total,0);
  const customers = db.data.users.filter(u => u.role !== "admin").length;
  res.json({
    revenue, orders: db.data.orders.length, paidOrders: db.data.orders.filter(o=>o.paymentStatus==="paid").length,
    customers, products: db.data.products.length,
    pendingPayments: db.data.orders.filter(o=>o.paymentStatus!=="paid").length
  });
});
app.get("/api/admin/orders", adminAuth, (req,res) => res.json(db.data.orders.sort((a,b)=>b.createdAt-a.createdAt)));
app.get("/api/admin/customers", adminAuth, (req,res) => res.json(db.data.users.filter(u=>u.role!=="admin").map(publicUser).sort((a,b)=>b.createdAt-a.createdAt)));
app.get("/api/admin/products", adminAuth, (req,res) => res.json(db.data.products));

app.post("/api/admin/upload-image", adminAuth, (req, res) => {
  uploadImageFile.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "Image upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image selected.",
      });
    }

    res.json({
      success: true,
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  });
});
app.post("/api/admin/upload-video", adminAuth, (req, res) => {
  uploadVideoFile.single("video")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Video upload failed." });
    if (!req.file) return res.status(400).json({ message: "No video selected." });
    res.json({ success: true, url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
});
app.post("/api/admin/products", adminAuth, async (req,res) => {
  const p = { ...req.body, id: Date.now(), price: Number(req.body.price), oldPrice: Number(req.body.oldPrice || 0), stock: Number(req.body.stock || 0), sizes: req.body.sizes || ["S","M","L","XL","XXL"] };
  db.data.products.push(p); await db.write(); res.json(p);
});
app.put("/api/admin/products/:id", adminAuth, async (req,res) => {
  const p = db.data.products.find(x=>x.id===Number(req.params.id)); if(!p) return res.status(404).json({message:"Product not found"});
  Object.assign(p, req.body); await db.write(); res.json(p);
});
app.delete("/api/admin/products/:id", adminAuth, async (req,res) => {
  db.data.products = db.data.products.filter(x=>x.id!==Number(req.params.id)); await db.write(); res.json({ok:true});
});
function couponDiscount(coupon, subtotal, items) {
  const eligible = !coupon.productIds?.length && !coupon.categories?.length
    ? subtotal
    : items.filter(i => (!coupon.productIds?.length || coupon.productIds.includes(Number(i.productId))) &&
        (!coupon.categories?.length || coupon.categories.includes(String(i.category || ""))))
      .reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
  if (eligible <= 0) return 0;
  let discount = coupon.discountType === "fixed"
    ? Number(coupon.discountValue || 0)
    : eligible * Number(coupon.discountValue || 0) / 100;
  if (coupon.discountType !== "fixed" && Number(coupon.maxDiscount || 0) > 0) discount = Math.min(discount, Number(coupon.maxDiscount));
  return Math.max(0, Math.min(Math.round(discount), eligible));
}
function getCouponError(coupon, subtotal, items, userId) {
  if (!coupon || coupon.active === false) return "This coupon is not active.";
  const now = Date.now();
  if (coupon.startsAt && now < new Date(coupon.startsAt).getTime()) return "This coupon is not available yet.";
  if (coupon.expiresAt && now > new Date(coupon.expiresAt).getTime()) return "This coupon has expired.";
  if (subtotal < Number(coupon.minOrderValue || 0)) return `Minimum order value for this coupon is ₹${Number(coupon.minOrderValue || 0).toLocaleString("en-IN")}.`;
  if (Number(coupon.usageLimit || 0) > 0 && Number(coupon.usageCount || 0) >= Number(coupon.usageLimit)) return "This coupon has reached its usage limit.";
  const userUses = Number(coupon.userUsage?.[userId] || 0);
  if (Number(coupon.perCustomerLimit || 0) > 0 && userUses >= Number(coupon.perCustomerLimit)) return "You have reached the usage limit for this coupon.";
  if (coupon.productIds?.length && !items.some(i => coupon.productIds.includes(Number(i.productId)))) return "This coupon does not apply to these products.";
  if (coupon.categories?.length && !items.some(i => coupon.categories.includes(String(i.category || "")))) return "This coupon does not apply to these categories.";
  return "";
}
app.post("/api/coupons/validate", auth, (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
  const coupon = db.data.coupons.find(c => String(c.code).toUpperCase() === code);
  const error = getCouponError(coupon, subtotal, items.map(i => {
    const product = db.data.products.find(p => p.id === Number(i.id || i.productId));
    return { ...i, productId: Number(i.id || i.productId), category: product?.category || i.category };
  }), req.user.id);
  if (error) return res.status(400).json({ message: error });
  const normalizedItems = items.map(i => {
    const product = db.data.products.find(p => p.id === Number(i.id || i.productId));
    return { ...i, productId: Number(i.id || i.productId), category: product?.category || i.category };
  });
  const discount = couponDiscount(coupon, subtotal, normalizedItems);
  if (!discount) return res.status(400).json({ message: "This coupon does not apply to the current order." });
  res.json({ code: coupon.code, discount, discountType: coupon.discountType, discountValue: coupon.discountValue, message: "Coupon applied successfully." });
});
app.get("/api/admin/coupons", adminAuth, (req, res) => res.json(db.data.coupons || []));
app.post("/api/admin/coupons", adminAuth, async (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase().replace(/\s+/g, "");
  const discountType = req.body?.discountType === "fixed" ? "fixed" : "percentage";
  const discountValue = Number(req.body?.discountValue);
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return res.status(400).json({ message: "Coupon code must be 3–30 letters, numbers, hyphens or underscores." });
  if ((db.data.coupons || []).some(c => String(c.code).toUpperCase() === code && c.id !== req.body.id)) return res.status(409).json({ message: "That coupon code already exists." });
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === "percentage" && discountValue > 100)) return res.status(400).json({ message: "Enter a valid discount value." });
  const coupon = {
    id: req.body.id || crypto.randomUUID(), code, title: String(req.body.title || "").trim(),
    discountType, discountValue, maxDiscount: Number(req.body.maxDiscount || 0),
    minOrderValue: Number(req.body.minOrderValue || 0), usageLimit: Number(req.body.usageLimit || 0),
    perCustomerLimit: Number(req.body.perCustomerLimit || 1),
    startsAt: req.body.startsAt || "", expiresAt: req.body.expiresAt || "",
    categories: Array.isArray(req.body.categories) ? req.body.categories : [],
    productIds: Array.isArray(req.body.productIds) ? req.body.productIds.map(Number) : [],
    active: req.body.active !== false, usageCount: Number(req.body.usageCount || 0), userUsage: req.body.userUsage || {},
    createdAt: req.body.createdAt || Date.now()
  };
  if (!Array.isArray(db.data.coupons)) db.data.coupons = [];
  const index = db.data.coupons.findIndex(c => c.id === coupon.id);
  if (index >= 0) db.data.coupons[index] = { ...db.data.coupons[index], ...coupon };
  else db.data.coupons.push(coupon);
  await db.write(); res.json(coupon);
});
app.delete("/api/admin/coupons/:id", adminAuth, async (req, res) => {
  db.data.coupons = (db.data.coupons || []).filter(c => c.id !== req.params.id);
  await db.write(); res.json({ ok: true });
});
app.get("/api/admin/settings", adminAuth, (req,res)=>res.json(db.data.settings));
app.put("/api/admin/settings", adminAuth, async (req,res)=>{ db.data.settings={...db.data.settings,...req.body}; await db.write(); res.json(db.data.settings); });
app.get("/api/admin/integrations", adminAuth, (req,res)=>res.json({
  email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  whatsapp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
  whatsappTemplates: Boolean(process.env.WHATSAPP_ORDER_PLACED_TEMPLATE && process.env.WHATSAPP_ORDER_DELIVERED_TEMPLATE)
}));

app.put("/api/admin/orders/:id/status", adminAuth, async (req,res)=>{
  const order = db.data.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({message:"Order not found."});
  const allowed = ["confirmed","packed","shipped","out_for_delivery","delivered"];
  const status = String(req.body?.status || "");
  if (!allowed.includes(status)) return res.status(400).json({message:"Invalid order status."});
  if (order.paymentStatus !== "paid") return res.status(400).json({message:"Only fully paid orders can be moved through delivery status."});
  const launchDate = new Date("2026-11-08T00:00:00+05:30").getTime();
  if (["shipped","out_for_delivery","delivered"].includes(status) && Date.now() < launchDate) {
    return res.status(400).json({message:"ENYTM pre-orders can only be dispatched from 8 November 2026."});
  }
  order.status = status;
  order.updatedAt = Date.now();
  await db.write();
  if (status === "delivered") await notifyOrder(order, "delivered");
  res.json(order);
});

app.post("/api/admin/test-email", adminAuth, async (req,res)=>{
  try { await sendEmail(req.body.to, "ENYTM Test Email", "<h2>ENYTM notification system is working.</h2>"); res.json({ok:true}); }
  catch(e){ res.status(500).json({message:e.message}); }
});
app.post("/api/admin/test-whatsapp", adminAuth, async (req,res)=>{
  try { await sendWhatsApp(req.body.phone, "ENYTM APPARELS: WhatsApp notification integration is connected."); res.json({ok:true}); }
  catch(e){ res.status(500).json({message:e.message}); }
});

async function runReminderJob() {
  if (String(process.env.ENABLE_REMINDER_JOB) !== "true") return;
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  for (const cart of db.data.carts) {
    if (!cart.items?.length || cart.updatedAt > cutoff || cart.remindedAt > cart.updatedAt) continue;
    const user = db.data.users.find(u=>u.id===cart.userId);
    if (!user) continue;
    const text = `Hey ${user.name}, your ENYTM APPARELS selection is still waiting for you. Complete your order at ${process.env.APP_URL || "https://enytm.co.in"}.`;
    if (user.emailOptIn) await sendEmail(user.email, "Your ENYTM selection is waiting", `<p>${text}</p>`).catch(()=>{});
    if (user.whatsappOptIn) await sendWhatsApp(user.phone, text).catch(()=>{});
    cart.remindedAt = Date.now();
  }
  for (const list of db.data.wishlists) {
    if (!list.items?.length || list.updatedAt > cutoff || list.remindedAt > list.updatedAt) continue;
    const user = db.data.users.find(u=>u.id===list.userId);
    if (!user) continue;
    const text = `You saved something from ENYTM APPARELS. Your wishlist is still waiting at ${process.env.APP_URL || "https://enytm.co.in"}.`;
    if (user.emailOptIn) await sendEmail(user.email, "Your ENYTM wishlist is waiting", `<p>${text}</p>`).catch(()=>{});
    if (user.whatsappOptIn) await sendWhatsApp(user.phone, text).catch(()=>{});
    list.remindedAt = Date.now();
  }
  await db.write();
}
cron.schedule("0 * * * *", runReminderJob);

if (isProd) {
  app.use(express.static(path.join(ROOT, "dist")));
  app.get("*", (req,res)=>res.sendFile(path.join(ROOT,"dist","index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

app.listen(PORT, ()=>console.log(`ENYTM server running on http://localhost:${PORT}`));
