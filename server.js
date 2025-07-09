require('dotenv').config();
const Fastify = require('fastify');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const notesPlugin = require('./index');
const { connectDB } = require('./src/utils/db');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mod-notes';
let mongoServer;

const start = async () => {
  try {
    // Use MongoDB Atlas connection from environment variables
    console.log('Using MongoDB Atlas connection...');
    MONGODB_URI = process.env.MONGODB_URI;
    console.log('MongoDB connection string loaded from environment variables');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB(MONGODB_URI);
    
    const fastify = Fastify({
      logger: {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        }
      },
      pluginTimeout: 30000 // Increase plugin timeout to 30 seconds
    });

    // Register the notes plugin
    console.log('Registering notes plugin...');
    await fastify.register(notesPlugin, {
      port: PORT,
      host: HOST,
      mongoUri: MONGODB_URI
    });

    // Start the server
    console.log('Starting server...');
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening on ${HOST}:${PORT}`);
    console.log(`API Documentation available at http://${HOST}:${PORT}/documentation`);
  } catch (err) {
    console.error('Error starting server:', err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
  process.exit(0);
});

start(); 