import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) { }
// Ensure DNS servers for Windows SRV queries and IPv4 resolution
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
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
    this.CACHE_TTL = 15000; // 15 seconds in-memory TTL for high responsiveness
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

  handleDisconnect(err) {
    if (
      err &&
      (err.message?.includes("ENOTFOUND") ||
        err.message?.includes("ECONNRESET") ||
        err.message?.includes("ETIMEDOUT") ||
        err.message?.includes("topology was destroyed") ||
        err.message?.includes("Topology is closed") ||
        err.message?.includes("MongoServerSelectionError") ||
        err.name === "MongoServerSelectionError")
    ) {
      console.warn("[MongoDB] Transient connection/DNS issue detected. Resetting client for clean reconnect...");
      this.db = null;
      if (this.client) {
        try {
          this.client.close(true).catch(() => {});
        } catch (_) {}
        this.client = null;
      }
    }
  }

  async connect() {
    if (this.db) return this.db;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = (async () => {
      try {
        this.client = new MongoClient(MONGODB_URI, {
          serverSelectionTimeoutMS: 15000,
          connectTimeoutMS: 15000,
          socketTimeoutMS: 45000,
          maxPoolSize: 20,
          minPoolSize: 1,
          maxIdleTimeMS: 60000,
          retryWrites: true,
          retryReads: true,
          family: 4
        });
        await this.client.connect();
        this.db = this.client.db("enytm");
        console.log("[MongoDB] Connected strictly to MongoDB Atlas 'enytm' database.");
        return this.db;
      } catch (err) {
        console.error("[MongoDB] Connection error:", err.message);
        this.handleDisconnect(err);
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

    let db;
    try {
      db = await this.connect();
    } catch (e) {
      console.warn("[MongoDB] Read deferred, serving cached memory data:", e.message);
      return this.data;
    }

    const tasks = cols.map(async (name) => {
      if (!force && this.cacheTimestamps[name] && (now - this.cacheTimestamps[name] <= this.CACHE_TTL)) {
        return;
      }
      let attempts = 0;
      while (attempts < 2) {
        attempts++;
        try {
          const currentDb = await this.connect();
          const docs = await currentDb.collection(name).find({}).toArray();
          this.data[name] = docs.map((doc) => {
            const { _id, ...rest } = doc;
            const id = rest.id !== undefined && rest.id !== null && rest.id !== ""
              ? (typeof rest.id === "number" ? rest.id : (!isNaN(Number(rest.id)) ? Number(rest.id) : String(rest.id)))
              : (_id ? (typeof _id === "object" ? _id.toString() : String(_id)) : Date.now());
            return { ...rest, id, _id: _id ? String(_id) : String(id) };
          });
          this.cacheTimestamps[name] = now;
          this.loadedCollections.add(name);
          break;
        } catch (e) {
          if (attempts === 1) {
            this.handleDisconnect(e);
            await new Promise(r => setTimeout(r, 400));
            continue;
          }
          console.warn(`[MongoDB] Notice: collection ${name} read fallback to memory cache:`, e.message);
          if (!Array.isArray(this.data[name])) this.data[name] = [];
        }
      }
    });

    if (!target || target === "settings" || (Array.isArray(target) && target.includes("settings"))) {
      if (force || !this.cacheTimestamps["settings"] || (now - this.cacheTimestamps["settings"] > this.CACHE_TTL)) {
        tasks.push((async () => {
          let attempts = 0;
          while (attempts < 2) {
            attempts++;
            try {
              const currentDb = await this.connect();
              const settingsDoc = await currentDb.collection("settings").findOne({ _id: "store_settings" });
              if (settingsDoc) {
                const { _id, ...rest } = settingsDoc;
                this.data.settings = rest;
              }
              this.cacheTimestamps["settings"] = now;
              this.loadedCollections.add("settings");
              break;
            } catch (e) {
              if (attempts === 1) {
                this.handleDisconnect(e);
                await new Promise(r => setTimeout(r, 400));
                continue;
              }
              console.warn("[MongoDB] Settings read fallback to memory cache:", e.message);
            }
          }
        })());
      }
    }

    await Promise.all(tasks);
    return this.data;
  }

  async write(target = null) {
    const cols = target
      ? (Array.isArray(target) ? target : [target]).filter(n => COLLECTIONS.includes(n))
      : COLLECTIONS;

    let db;
    try {
      db = await this.connect();
    } catch (e) {
      console.warn("[MongoDB] Write skipped, connection unavailable:", e.message);
      return;
    }

    const tasks = cols.map(async (name) => {
      delete this.cacheTimestamps[name];
      if (Array.isArray(this.data[name])) {
        let attempts = 0;
        while (attempts < 2) {
          attempts++;
          try {
            const currentDb = await this.connect();
            const col = currentDb.collection(name);
            const items = this.data[name];

            if (!items || items.length === 0) {
              return;
            }

            const seenIds = new Set();
            const cleanDocs = [];
            for (const item of items) {
              const { _id, ...rest } = item;
              const idKey = rest.id !== undefined && rest.id !== null ? String(rest.id) : (_id ? String(_id) : null);
              if (idKey && seenIds.has(idKey)) continue;
              if (idKey) seenIds.add(idKey);
              cleanDocs.push({ ...rest, id: rest.id ?? idKey });
            }

            const bulkOps = cleanDocs.map(doc => ({
              replaceOne: {
                filter: {
                  $or: [
                    { id: doc.id },
                    ...(typeof doc.id === "string" && !isNaN(Number(doc.id)) ? [{ id: Number(doc.id) }] : []),
                    ...(typeof doc.id === "number" ? [{ id: String(doc.id) }] : []),
                    ...(doc._id ? [{ _id: doc._id }] : [])
                  ]
                },
                replacement: doc,
                upsert: true
              }
            }));

            if (bulkOps.length > 0) {
              await col.bulkWrite(bulkOps, { ordered: false });
            }
            break;
          } catch (e) {
            if (attempts === 1) {
              this.handleDisconnect(e);
              await new Promise(r => setTimeout(r, 400));
              continue;
            }
            console.warn(`[MongoDB] Error writing collection ${name}:`, e.message);
          }
        }
      }
    });

    const shouldWriteSettings = !target || target === "settings" || (Array.isArray(target) && target.includes("settings"));
    if (shouldWriteSettings) {
      delete this.cacheTimestamps["settings"];
      if (this.data.settings) {
        tasks.push((async () => {
          let attempts = 0;
          while (attempts < 2) {
            attempts++;
            try {
              const currentDb = await this.connect();
              const col = currentDb.collection("settings");
              const { _id, ...cleanSettings } = this.data.settings;
              delete cleanSettings._id;
              try {
                await col.updateOne(
                  { _id: "store_settings" },
                  { $set: cleanSettings },
                  { upsert: true }
                );
              } catch (err) {
                if (err.code === 11000 || (err.message && err.message.includes("E11000"))) {
                  await col.updateOne(
                    { _id: "store_settings" },
                    { $set: cleanSettings }
                  );
                } else {
                  throw err;
                }
              }
              break;
            } catch (e) {
              if (attempts === 1) {
                this.handleDisconnect(e);
                await new Promise(r => setTimeout(r, 400));
                continue;
              }
              console.warn("[MongoDB] Error writing settings:", e.message);
            }
          }
        })());
      }
    }

    await Promise.all(tasks);
  }
}

export const db = new MongoDatabase();
