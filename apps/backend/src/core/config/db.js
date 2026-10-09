import mongoose from 'mongoose';
import { env } from './env.js';

const connectDB = async () => {
  try {
    if (!env.mongoUri) {
      console.warn('⚠️ MONGO_URI is not defined in environment variables.');
      return;
    }

    const conn = await mongoose.connect(env.mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
