import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}
// Only override DNS on Windows where Node has known querySrv DNS issues
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {}
}

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vedantdarokar7_db_user:e8lHSwrq3Y6ORGTa@cluster0.qvwjgqe.mongodb.net/enytm?retryWrites=true&w=majority";

const COLLECTIONS = [
  "users",
  "products",
  "orders",
  "carts",
  "wishlists",
  "coupons",
  "pendingOtps",
  "passwordResetOtps",
  "walletTopups"
];

class MongoDatabase {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnecting = false;
    this.connectPromise = null;
    this.cacheTimestamps = {};
    this.CACHE_TTL = 60000; // 60 seconds in-memory TTL for rapid parallel queries and instant response
    this.data = {
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
        shippingFreeAbove: 0,
        shippingCharge: 0
      },
      pendingOtps: [],
      passwordResetOtps: [],
      walletTopups: []
    };
  }

  async connect() {
    if (this.db) return this.db;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = (async () => {
      try {
        this.client = new MongoClient(MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          maxPoolSize: 20,
          minPoolSize: 2,
          maxIdleTimeMS: 60000
        });
        await this.client.connect();
        this.db = this.client.db("enytm");
        console.log("[MongoDB] Connected strictly to MongoDB Atlas 'enytm' database.");
        return this.db;
      } catch (err) {
        console.error("[MongoDB] Connection error:", err.message);
        throw err;
      } finally {
        this.connectPromise = null;
      }
    })();

    return this.connectPromise;
  }

  async read(target = null, force = false) {
    const now = Date.now();
    const cols = target
      ? (Array.isArray(target) ? target : [target]).filter(n => COLLECTIONS.includes(n))
      : COLLECTIONS;

    const needsRead = force || cols.some(n => !this.cacheTimestamps[n] || (now - this.cacheTimestamps[n] > this.CACHE_TTL));

    if (!needsRead && (target !== "settings" && (!Array.isArray(target) || !target.includes("settings")) || (this.cacheTimestamps["settings"] && now - this.cacheTimestamps["settings"] <= this.CACHE_TTL))) {
      return this.data;
    }

    const db = await this.connect();

    const tasks = cols.map(async (name) => {
      if (!force && this.cacheTimestamps[name] && (now - this.cacheTimestamps[name] <= this.CACHE_TTL)) {
        return;
      }
      try {
        const docs = await db.collection(name).find({}).toArray();
        this.data[name] = docs.map(({ _id, ...rest }) => rest);
        this.cacheTimestamps[name] = now;
      } catch (e) {
        console.error(`[MongoDB] Error reading collection ${name}:`, e.message);
        if (!Array.isArray(this.data[name])) this.data[name] = [];
      }
    });

    if (!target || target === "settings" || (Array.isArray(target) && target.includes("settings"))) {
      if (force || !this.cacheTimestamps["settings"] || (now - this.cacheTimestamps["settings"] > this.CACHE_TTL)) {
        tasks.push((async () => {
          try {
            const settingsDoc = await db.collection("settings").findOne({ _id: "store_settings" });
            if (settingsDoc) {
              const { _id, ...rest } = settingsDoc;
              this.data.settings = rest;
            }
            this.cacheTimestamps["settings"] = now;
          } catch (e) {
            console.error("[MongoDB] Error reading settings:", e.message);
          }
        })());
      }
    }

    await Promise.all(tasks);
    return this.data;
  }

  async write(target = null) {
    const db = await this.connect();
    const cols = target
      ? (Array.isArray(target) ? target : [target]).filter(n => COLLECTIONS.includes(n))
      : COLLECTIONS;

    const tasks = cols.map(async (name) => {
      delete this.cacheTimestamps[name];
      if (Array.isArray(this.data[name])) {
        try {
          const col = db.collection(name);
          await col.deleteMany({});
          if (this.data[name].length > 0) {
            const seenIds = new Set();
            const cleanDocs = [];
            for (const item of this.data[name]) {
              const { _id, ...rest } = item;
              const idKey = rest.id ? String(rest.id) : null;
              if (idKey && seenIds.has(idKey)) continue;
              if (idKey) seenIds.add(idKey);
              cleanDocs.push(rest);
            }
            if (cleanDocs.length > 0) {
              await col.insertMany(cleanDocs);
            }
          }
        } catch (e) {
          console.error(`[MongoDB] Error writing collection ${name}:`, e.message);
        }
      }
    });

    if (!target || target === "settings" || (Array.isArray(target) && target.includes("settings"))) {
      delete this.cacheTimestamps["settings"];
      if (this.data.settings) {
        tasks.push((async () => {
          try {
            const col = db.collection("settings");
            await col.deleteMany({});
            const { _id, ...cleanSettings } = this.data.settings;
            await col.insertOne({ _id: "store_settings", ...cleanSettings });
          } catch (e) {
            console.error("[MongoDB] Error writing settings:", e.message);
          }
        })());
      }
    }

    await Promise.all(tasks);
  }
}

export const db = new MongoDatabase();
