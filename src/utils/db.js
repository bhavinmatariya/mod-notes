const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    console.log(`Attempting to connect to MongoDB at: ${uri.substring(0, uri.indexOf('@') > 0 ? uri.indexOf('@') : 20)}...`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Please check your MongoDB connection string and ensure the MongoDB server is running.');
    throw error; // Throw instead of exiting to allow proper error handling
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
}; 