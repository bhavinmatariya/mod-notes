const Note = require('../models/Note');

class VectorService {
  /**
   * Stub for embedding text using an AI service
   * In a real implementation, this would call OpenAI or similar API
   * @param {string} text - Text to embed
   * @returns {Array<number>} - Vector embedding
   */
  async embedText(text) {
    // This is a stub implementation that returns a random vector
    // In production, you would call an embedding API like OpenAI
    const dimension = 128; // Common embedding dimension
    return Array.from({ length: dimension }, () => Math.random() * 2 - 1);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} vecA - First vector
   * @param {Array<number>} vecB - Second vector
   * @returns {number} - Similarity score (1 is identical, -1 is opposite)
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Perform vector search on notes
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - Matching notes with similarity scores
   */
  async vectorSearch(query, limit = 10) {
    try {
      if (!query) {
        return [];
      }

      // Get all notes (in production, this should be optimized)
      const notes = await Note.find();
      
      // Embed the search query
      const queryEmbedding = await this.embedText(query);
      
      // Calculate similarity for each note
      const results = await Promise.all(
        notes.map(async (note) => {
          // In production, embeddings would be stored in the database
          // Here we're generating them on the fly for demonstration
          const contentText = `${note.title} ${note.body}`;
          const noteEmbedding = await this.embedText(contentText);
          
          const similarity = this.cosineSimilarity(queryEmbedding, noteEmbedding);
          
          return {
            note,
            similarity
          };
        })
      );
      
      // Sort by similarity (highest first) and take top results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(result => ({
          ...result.note.toObject(),
          _similarity: result.similarity
        }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new VectorService(); 