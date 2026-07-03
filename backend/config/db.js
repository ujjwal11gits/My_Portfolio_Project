import mongoose from 'mongoose';
import dns from 'dns';

// Fix: Node.js v17+ prefers IPv6 which breaks Atlas SRV lookups on some networks
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || '';
    // Clean directConnection parameter for cloud production (MongoDB Atlas SRV does not support directConnection)
    uri = uri.replace(/[?&]directConnection=(true|false)/gi, '');

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
