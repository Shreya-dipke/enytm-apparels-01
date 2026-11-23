import dns from "dns";
// Set reliable DNS servers to prevent SRV lookup failures on all operating systems
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

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
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 10
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

  async read() {
    const db = await this.connect();
    for (const name of COLLECTIONS) {
      try {
        const docs = await db.collection(name).find({}).toArray();
        this.data[name] = docs.map(({ _id, ...rest }) => rest);
      } catch (e) {
        console.error(`[MongoDB] Error reading collection ${name}:`, e.message);
        if (!Array.isArray(this.data[name])) this.data[name] = [];
      }
    }

    try {
      const settingsDoc = await db.collection("settings").findOne({ _id: "store_settings" });
      if (settingsDoc) {
        const { _id, ...rest } = settingsDoc;
        this.data.settings = rest;
      }
    } catch (e) {
      console.error("[MongoDB] Error reading settings:", e.message);
    }

    return this.data;
  }

  async write() {
    const db = await this.connect();
    for (const name of COLLECTIONS) {
      if (Array.isArray(this.data[name])) {
        try {
          const col = db.collection(name);
          await col.deleteMany({});
          if (this.data[name].length > 0) {
            const cleanDocs = this.data[name].map(item => {
              const { _id, ...rest } = item;
              return rest;
            });
            await col.insertMany(cleanDocs);
          }
        } catch (e) {
          console.error(`[MongoDB] Error writing collection ${name}:`, e.message);
        }
      }
    }

    if (this.data.settings) {
      try {
        const col = db.collection("settings");
        await col.deleteMany({});
        const { _id, ...cleanSettings } = this.data.settings;
        await col.insertOne({ _id: "store_settings", ...cleanSettings });
      } catch (e) {
        console.error("[MongoDB] Error writing settings:", e.message);
      }
    }
  }
}

export const db = new MongoDatabase();
