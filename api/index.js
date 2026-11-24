import app from "../server/index.js";
import { db } from "../server/mongo-db.js";

export default async function handler(req, res) {
  // Ensure request URL matches Express /api routes correctly regardless of Vercel proxy headers
  const incoming = req.headers["x-forwarded-uri"] || req.headers["x-matched-path"] || req.originalUrl || req.url;
  if (incoming && incoming.startsWith("/api")) {
    req.url = incoming;
  } else if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
  }

  return app(req, res);
}
