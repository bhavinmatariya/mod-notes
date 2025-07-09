const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Fastify = require('fastify');
const notesPlugin = require('../../index');
const Note = require('../../src/models/Note');

describe('Notes API Integration', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to MongoDB directly first
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    // Create Fastify instance
    app = Fastify({
      logger: false // Disable logging for tests
    });
    
    // Register the notes plugin with the in-memory MongoDB URI
    await app.register(notesPlugin, {
      mongoUri: uri
    });

    // Wait for app to be ready
    await app.ready();
  });

  afterAll(async () => {
    // Close app and database connections
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Note.deleteMany({});
  });

  describe('POST /notes -> GET /notes flow', () => {
    it('should create a note and then retrieve it', async () => {
      // Create a new note
      const noteData = {
        title: 'Integration Test Note',
        body: 'This is a test note created during integration testing'
      };

      // Step 1: Create the note
      const createResponse = await app.inject({
        method: 'POST',
        url: '/notes',
        payload: noteData
      });

      // Verify creation was successful
      expect(createResponse.statusCode).toBe(201);
      const createdNote = JSON.parse(createResponse.body);
      expect(createdNote._id).toBeDefined();
      expect(createdNote.title).toBe(noteData.title);
      expect(createdNote.body).toBe(noteData.body);

      // Step 2: Retrieve all notes
      const getAllResponse = await app.inject({
        method: 'GET',
        url: '/notes'
      });

      // Verify retrieval was successful
      expect(getAllResponse.statusCode).toBe(200);
      const { data: notes } = JSON.parse(getAllResponse.body);
      expect(Array.isArray(notes)).toBe(true);
      expect(notes.length).toBe(1);
      expect(notes[0]._id).toBe(createdNote._id);
      expect(notes[0].title).toBe(noteData.title);

      // Step 3: Retrieve the specific note by ID
      const getByIdResponse = await app.inject({
        method: 'GET',
        url: `/notes/${createdNote._id}`
      });

      // Verify specific note retrieval was successful
      expect(getByIdResponse.statusCode).toBe(200);
      const retrievedNote = JSON.parse(getByIdResponse.body);
      expect(retrievedNote._id).toBe(createdNote._id);
      expect(retrievedNote.title).toBe(noteData.title);
      expect(retrievedNote.body).toBe(noteData.body);
    });
  });
}); 