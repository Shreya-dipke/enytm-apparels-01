import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) { }
// Only override DNS on Windows where Node has known querySrv DNS issues
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) { }
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
    this.connectPromise = null;
    this.cacheTimestamps = {};
    this.loadedCollections = new Set();
    this.CACHE_TTL = 3000; // 3 seconds in-memory TTL for rapid parallel queries
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
          serverSelectionTimeoutMS: 15000,
          connectTimeoutMS: 15000,
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
        this.loadedCollections.add(name);
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
            this.loadedCollections.add("settings");
          } catch (e) {
            console.error("[MongoDB] Error reading settings:", e.message);
          }
        })());
      }
    }

    await Promise.all(tasks);
    return this.data;
  }

  async write(target = null, allowEmpty = false) {
    const db = await this.connect();
    
    // Determine collections to write:
    // If target is specified, only write that target.
    // If target is omitted, ONLY write collections that have actually been read into memory to prevent wiping unread collections.
    let cols = [];
    if (target) {
      cols = (Array.isArray(target) ? target : [target]).filter(n => COLLECTIONS.includes(n));
    } else {
      cols = COLLECTIONS.filter(n => this.loadedCollections.has(n));
    }

    const tasks = cols.map(async (name) => {
      delete this.cacheTimestamps[name];
      if (Array.isArray(this.data[name])) {
        try {
          const col = db.collection(name);
          const items = this.data[name];

          // GUARD: If memory array is empty and allowEmpty is false, check if DB has documents.
          // NEVER wipe existing data if the memory array happens to be empty due to cold-start or error.
          if (items.length === 0 && !allowEmpty) {
            const existingCount = await col.countDocuments();
            if (existingCount > 0) {
              console.warn(`[MongoDB SafeGuard] Refusing to wipe ${existingCount} documents in '${name}' because memory array is empty.`);
              return;
            }
          }

          if (items.length > 0) {
            const seenIds = new Set();
            const cleanDocs = [];
            for (const item of items) {
              const { _id, ...rest } = item;
              const idKey = rest.id ? String(rest.id) : null;
              if (idKey && seenIds.has(idKey)) continue;
              if (idKey) seenIds.add(idKey);
              cleanDocs.push(rest);
            }

            // ATOMIC SAFE WRITE:
            // Use bulkWrite replaceOne/upsert so documents are NEVER deleted before being written!
            const docsWithId = cleanDocs.filter(d => d.id !== undefined && d.id !== null);
            if (docsWithId.length > 0) {
              const bulkOps = docsWithId.map(doc => ({
                replaceOne: {
                  filter: { id: doc.id },
                  replacement: doc,
                  upsert: true
                }
              }));
              await col.bulkWrite(bulkOps, { ordered: false });

              // Delete ONLY documents whose IDs are no longer in the array
              const currentIds = docsWithId.map(d => d.id);
              await col.deleteMany({ id: { $nin: currentIds } });
            } else {
              // Fallback for documents without an id field
              await col.deleteMany({});
              await col.insertMany(cleanDocs);
            }
          } else if (allowEmpty) {
            await col.deleteMany({});
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
            const { _id, ...cleanSettings } = this.data.settings;
            await col.updateOne(
              { _id: "store_settings" },
              { $set: cleanSettings },
              { upsert: true }
            );
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
