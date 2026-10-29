import mongoose from 'mongoose';
import { env } from './env.js';

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Preserve connection across serverless function invocations
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: CachedMongoose | undefined;
}

const cached: CachedMongoose = global.__mongooseCache || { conn: null, promise: null };
if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isServerless = !!process.env.VERCEL || env.NODE_ENV === 'production';
    
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        maxPoolSize: isServerless ? 10 : 50,
        minPoolSize: 1, // Rapid cold start connection (avoids opening 10 sockets on boot)
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB connected successfully: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
};

export const disconnectDatabase = async (): Promise<void> => {
  cached.conn = null;
  cached.promise = null;
  await mongoose.disconnect();
};

