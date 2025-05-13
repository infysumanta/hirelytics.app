import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the type for the cached mongoose instance
interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined;
}

const cached: CachedMongoose = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log("[MongoDB] Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[MongoDB] Creating new database connection to:", MONGODB_URI);
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("[MongoDB] Connection established successfully");
      return mongoose;
    });
  }

  try {
    console.log("[MongoDB] Waiting for database connection...");
    cached.conn = await cached.promise;
    console.log("[MongoDB] Connection ready");
  } catch (e) {
    console.error("[MongoDB] Connection failed:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Helper function to check MongoDB connection status
export function getMongoConnectionStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    status:
      ["disconnected", "connected", "connecting", "disconnecting"][
        mongoose.connection.readyState
      ] || "unknown",
  };
}
