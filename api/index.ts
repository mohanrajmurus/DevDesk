import "dotenv/config";
import { app } from "../apps/api/src/app.js";
import { connectDB } from "../apps/api/src/lib/db.js";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/devdesk";

export default async function handler(req: any, res: any) {
  await connectDB(MONGODB_URI);
  return app(req, res);
}
