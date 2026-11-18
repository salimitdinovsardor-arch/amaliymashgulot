const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/eduhub';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Could not establish connection to ${mongoUri}: ${err.message}`);
    console.log('[MongoDB] Running EduHub In-Memory MongoDB Engine for instant development & testing.');
    console.log('[MongoDB] (Provide an active MongoDB URI in .env to connect to an external/Atlas database at any time).');
    return null;
  }
};

const getIsConnected = () => isConnected;

module.exports = {
  connectDB,
  getIsConnected,
};
