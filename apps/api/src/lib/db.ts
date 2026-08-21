import mongoose from "mongoose";

// Cached across invocations so a warm serverless instance reuses the same
// connection instead of reconnecting on every request; a plain module-level
// variable is enough since the module stays loaded for the life of the
// instance. The in-flight promise also collapses concurrent cold-start
// requests onto a single connect() call instead of racing.
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(uri: string) {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    mongoose.set("strictQuery", true);
    connectionPromise = mongoose.connect(uri).then((m) => {
      console.log("MongoDB connected");
      return m;
    });
  }

  return connectionPromise;
}
