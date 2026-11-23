import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const dbJsonPath = path.join(ROOT, "data", "db.json");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vedantdarokar7_db_user:e8lHSwrq3Y6ORGTa@cluster0.qvwjgqe.mongodb.net/enytm?retryWrites=true&w=majority";

async function migrate() {
  console.log("=== ENYTM MONGODB ATLAS MIGRATION ===");
  if (!fs.existsSync(dbJsonPath)) {
    console.error("data/db.json not found!");
    process.exit(1);
  }

  const raw = fs.readFileSync(dbJsonPath, "utf-8");
  const localDb = JSON.parse(raw);
  console.log("Read local db.json successfully.");

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db("enytm");

    const collections = [
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

    for (const name of collections) {
      const items = Array.isArray(localDb[name]) ? localDb[name] : [];
      const col = db.collection(name);
      await col.deleteMany({});
      if (items.length > 0) {
        // Strip any existing Mongo _id to avoid collision, or insert cleanly
        const cleanItems = items.map(item => {
          const { _id, ...rest } = item;
          return rest;
        });
        await col.insertMany(cleanItems);
      }
      console.log(`Migrated ${items.length} records into collection '${name}'`);
    }

    // Settings collection (single document)
    const settingsCol = db.collection("settings");
    await settingsCol.deleteMany({});
    const settingsData = localDb.settings || {};
    const { _id, ...cleanSettings } = settingsData;
    await settingsCol.insertOne({ _id: "store_settings", ...cleanSettings });
    console.log("Migrated store settings successfully.");

    console.log("=== MIGRATION COMPLETE! ALL DATA IS NOW ON MONGODB ATLAS ===");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
