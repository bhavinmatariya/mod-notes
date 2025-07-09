const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const vectorService = require('../../src/services/vectorService');
const Note = require('../../src/models/Note');

describe('Vector Service', () => {
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

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      // Arrange
      const vecA = [1, 0, 0, 1];
      const vecB = [0, 1, 1, 0];
      const vecC = [1, 1, 0, 1];
      
      // Act
      const similarityAB = vectorService.cosineSimilarity(vecA, vecB);
      const similarityAC = vectorService.cosineSimilarity(vecA, vecC);
      
      // Assert
      expect(similarityAB).toBe(0); // Orthogonal vectors
      expect(similarityAC).toBeGreaterThan(0); // Should be similar
    });

    it('should throw error for vectors with different dimensions', () => {
      // Arrange
      const vecA = [1, 2, 3];
      const vecB = [1, 2];
      
      // Act & Assert
      expect(() => vectorService.cosineSimilarity(vecA, vecB)).toThrow();
    });
  });

  describe('vectorSearch', () => {
    it('should return notes sorted by similarity', async () => {
      // Arrange
      const notes = [
        { title: 'Machine Learning', body: 'Deep learning and neural networks' },
        { title: 'Cooking Recipe', body: 'How to make pasta carbonara' },
        { title: 'AI Applications', body: 'Using AI for natural language processing' }
      ];
      
      // Create test notes
      await Note.create(notes);
      
      // Mock embedText to return predictable vectors for testing
      const originalEmbedText = vectorService.embedText;
      vectorService.embedText = jest.fn().mockImplementation((text) => {
        if (text.toLowerCase().includes('ai') || text.toLowerCase().includes('learning')) {
          return [1, 1, 0, 0]; // AI/ML related vector
        } else if (text.toLowerCase().includes('artificial intelligence')) {
          return [1, 1, 0, 0]; // Query vector - same as AI/ML
        } else {
          return [0, 0, 1, 1]; // Other topics vector
        }
      });
      
      // Act
      const results = await vectorService.vectorSearch('artificial intelligence');
      
      // Restore original implementation
      vectorService.embedText = originalEmbedText;
      
      // Assert
      expect(results.length).toBe(3);
      // AI-related notes should come first
      expect(results[0].title).toMatch(/AI|Machine Learning/);
      expect(results[1].title).toMatch(/AI|Machine Learning/);
      // Cooking should be last as it's least similar
      expect(results[2].title).toBe('Cooking Recipe');
      // All results should have similarity scores
      results.forEach(result => {
        expect(result._similarity).toBeDefined();
      });
    });
  });
}); 