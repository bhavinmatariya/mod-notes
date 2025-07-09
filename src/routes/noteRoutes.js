const noteService = require('../services/noteService');
const vectorService = require('../services/vectorService');

const noteSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string', maxLength: 200 },
    body: { type: 'string', maxLength: 5000 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    _similarity: { type: 'number' }
  }
};

const createNoteSchema = {
  body: {
    type: 'object',
    required: ['title', 'body'],
    properties: {
      title: { type: 'string', maxLength: 200 },
      body: { type: 'string', maxLength: 5000 }
    }
  },
  response: {
    201: noteSchema
  }
};

const getAllNotesSchema = {
  querystring: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: noteSchema
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    }
  }
};

const getNoteByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
    }
  },
  response: {
    200: noteSchema,
    404: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
};

const searchNotesSchema = {
  querystring: {
    q: { type: 'string', minLength: 1 }
  },
  response: {
    200: {
      type: 'array',
      items: noteSchema
    }
  }
};

const vectorSearchSchema = {
  querystring: {
    q: { type: 'string', minLength: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
  },
  response: {
    200: {
      type: 'array',
      items: noteSchema
    }
  }
};

async function routes(fastify, options) {
  // Create a new note
  fastify.post('/', { schema: createNoteSchema }, async (request, reply) => {
    try {
      const note = await noteService.create(request.body);
      return reply.code(201).send(note);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({ error: 'Failed to create note' });
    }
  });

  // Get all notes with pagination
  fastify.get('/', { schema: getAllNotesSchema }, async (request, reply) => {
    try {
      const { page, limit } = request.query;
      const result = await noteService.findAll({ page, limit });
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to retrieve notes' });
    }
  });

  // Search notes - Must be defined BEFORE the /:id endpoint to avoid conflicts
  fastify.get('/search', { schema: searchNotesSchema }, async (request, reply) => {
    try {
      const notes = await noteService.search(request.query.q);
      return reply.send(notes);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to search notes' });
    }
  });

  // Vector search notes - Must be defined BEFORE the /:id endpoint to avoid conflicts
  fastify.get('/vector-search', { schema: vectorSearchSchema }, async (request, reply) => {
    try {
      const { q, limit } = request.query;
      const notes = await vectorService.vectorSearch(q, limit);
      return reply.send(notes);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to perform vector search' });
    }
  });

  // Get note by ID - Must be defined AFTER all other GET routes with specific paths
  fastify.get('/:id', { schema: getNoteByIdSchema }, async (request, reply) => {
    try {
      const note = await noteService.findById(request.params.id);
      return reply.send(note);
    } catch (error) {
      if (error.statusCode === 404) {
        return reply.code(404).send({ 
          statusCode: 404,
          error: 'Not Found',
          message: 'Note not found'
        });
      }
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to retrieve note' });
    }
  });
}

module.exports = routes; 