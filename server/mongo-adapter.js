import dns from "dns";
// Ensure SRV DNS lookups work reliably on all systems (Windows, Linux, Docker, etc.)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

import fs from "fs";
import { MongoClient } from "mongodb";
import { JSONFile } from "lowdb/node";

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

export class MongoLowdbAdapter {
  constructor(mongoUri, localDbPath) {
    this.mongoUri = mongoUri;
    this.localDbPath = localDbPath;
    this.jsonAdapter = new JSONFile(localDbPath);
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && this.db) return this.db;
    if (!this.mongoUri) return null;

    try {
      this.client = new MongoClient(this.mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
      await this.client.connect();
      this.db = this.client.db("enytm");
      this.isConnected = true;
      console.log("[MongoDB] Connected successfully to MongoDB Atlas database 'enytm'!");
      return this.db;
    } catch (err) {
      console.error("[MongoDB] Connection error (using local JSON file fallback):", err.message);
      this.isConnected = false;
      this.db = null;
      return null;
    }
  }

  async read() {
    const mongo = await this.connect();
    if (mongo) {
      try {
        const result = {};
        for (const colName of COLLECTIONS) {
          const docs = await mongo.collection(colName).find({}).toArray();
          result[colName] = docs.map(({ _id, ...rest }) => rest);
        }

        const settingsDoc = await mongo.collection("settings").findOne({ _id: "store_settings" });
        result.settings = settingsDoc ? (({ _id, ...rest }) => rest)(settingsDoc) : {};

        if ((result.products && result.products.length > 0) || (result.users && result.users.length > 0)) {
          console.log(`[MongoDB] Loaded from Atlas: ${result.products?.length || 0} products, ${result.orders?.length || 0} orders, ${result.users?.length || 0} users.`);
          try {
            fs.writeFileSync(this.localDbPath, JSON.stringify(result, null, 2));
          } catch (e) {}
          return result;
        }
      } catch (err) {
        console.error("[MongoDB] Read error, falling back to local file:", err.message);
      }
    }

    console.log("[MongoDB] Reading from local db.json");
    return this.jsonAdapter.read();
  }

  async write(data) {
    if (!data) return;

    try {
      await this.jsonAdapter.write(data);
    } catch (e) {
      console.error("[MongoDB] Local backup write failed:", e.message);
    }

    const mongo = await this.connect();
    if (!mongo) return;

    try {
      for (const colName of COLLECTIONS) {
        if (Array.isArray(data[colName])) {
          const col = mongo.collection(colName);
          await col.deleteMany({});
          if (data[colName].length > 0) {
            const cleanDocs = data[colName].map(item => {
              const { _id, ...rest } = item;
              return rest;
            });
            await col.insertMany(cleanDocs);
          }
        }
      }

      if (data.settings) {
        const settingsCol = mongo.collection("settings");
        await settingsCol.deleteMany({});
        const { _id, ...cleanSettings } = data.settings;
        await settingsCol.insertOne({ _id: "store_settings", ...cleanSettings });
      }
    } catch (err) {
      console.error("[MongoDB] Write sync error:", err.message);
    }
  }
}
