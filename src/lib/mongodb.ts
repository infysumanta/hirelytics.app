import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
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

let cached: CachedMongoose = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('[MongoDB] Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[MongoDB] Creating new database connection');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('[MongoDB] Connection established successfully');
      return mongoose;
    });
  }

  try {
    console.log('[MongoDB] Waiting for database connection...');
    cached.conn = await cached.promise;
    console.log('[MongoDB] Connection ready');
  } catch (e) {
    console.error('[MongoDB] Connection failed:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
