const fp = require('fastify-plugin');
const mongoose = require('mongoose');
const noteRoutes = require('./src/routes/noteRoutes');
const { connectDB } = require('./src/utils/db');

async function notesPlugin(fastify, options) {
  try {
    // Register Swagger if not already registered
    if (!fastify.hasDecorator('swagger')) {
      await fastify.register(require('@fastify/swagger'), {
        routePrefix: '/documentation',
        swagger: {
          info: {
            title: 'Notes API',
            description: 'API for managing notes',
            version: '1.0.0'
          },
          externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here'
          },
          host: `${options.host || 'localhost'}:${options.port || 3000}`,
          schemes: ['http'],
          consumes: ['application/json'],
          produces: ['application/json'],
          tags: [
            { name: 'notes', description: 'Notes related end-points' }
          ]
        },
        exposeRoute: true
      });

      await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/documentation',
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false
        }
      });
    }

    // Check MongoDB connection
    if (!mongoose.connection.readyState) {
      fastify.log.warn('MongoDB not connected. Please ensure MongoDB is connected before registering the plugin.');
    } else {
      fastify.log.info('Using existing MongoDB connection');
    }

    // Decorate fastify instance with mongoose models
    fastify.decorate('mongoose', mongoose);
    
    // Register routes
    await fastify.register(noteRoutes, { prefix: '/notes' });

    fastify.log.info('Notes plugin registered successfully');
  } catch (error) {
    fastify.log.error(`Error in notes plugin: ${error.message}`);
    throw error;
  }
}

module.exports = fp(notesPlugin, {
  name: 'mod-notes',
  fastify: '4.x',
  dependencies: []
}); 