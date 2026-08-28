import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/devdesk";

// Start the connection but don't gate the server on it: Mongoose buffers
// queries until it's ready, and the platform needs the process to bind its
// port promptly. Crashing the process on a transient DB error would take the
// whole function down (FUNCTION_INVOCATION_FAILED) instead of failing one
// request.
connectDB(MONGODB_URI).catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
