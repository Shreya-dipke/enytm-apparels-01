import app from "../server/index.js";
import { db } from "../server/mongo-db.js";

let isDbReady = false;

export default async function handler(req, res) {
  if (!isDbReady) {
    try {
      await db.read();
      isDbReady = true;
    } catch (err) {
      console.error("[Vercel API Handler] Database read error:", err);
    }
  }
  return app(req, res);
}
