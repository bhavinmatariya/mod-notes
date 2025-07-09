const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const noteService = require('../../src/services/noteService');
const Note = require('../../src/models/Note');

describe('Note Service', () => {
  let mongoServer;

  beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    // Disconnect and stop MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Note.deleteMany({});
  });

  describe('create', () => {
    it('should create a new note', async () => {
      // Arrange
      const noteData = {
        title: 'Test Note',
        body: 'This is a test note body'
      };

      // Act
      const result = await noteService.create(noteData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.title).toBe(noteData.title);
      expect(result.body).toBe(noteData.body);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // Verify it was saved to the database
      const savedNote = await Note.findById(result._id);
      expect(savedNote).toBeDefined();
      expect(savedNote.title).toBe(noteData.title);
    });

    it('should throw an error if required fields are missing', async () => {
      // Arrange
      const invalidNoteData = {
        // Missing title
        body: 'This is a test note body'
      };

      // Act & Assert
      await expect(noteService.create(invalidNoteData)).rejects.toThrow();
    });
  });
}); 