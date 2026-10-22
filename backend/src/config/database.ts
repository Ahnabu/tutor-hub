import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 100, // Handle concurrent load without connection starvation
      minPoolSize: 10,  // Maintain warm connections for instant response
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
