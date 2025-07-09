require('dotenv').config();
const Fastify = require('fastify');
const mongoose = require('mongoose');
const notesPlugin = require('./index');
const { connectDB } = require('./src/utils/db');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mod-notes';

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
    // For cloud deployment, we need to listen on 0.0.0.0
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : HOST;
    const port = process.env.PORT || PORT;
    
    await fastify.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
    console.log(`API Documentation available at /documentation`);
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