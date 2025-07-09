const Note = require('../models/Note');

class NoteService {
  async create(noteData) {
    try {
      const note = new Note(noteData);
      return await note.save();
    } catch (error) {
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      
      const notes = await Note.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Note.countDocuments();
      
      return {
        data: notes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const note = await Note.findById(id);
      if (!note) {
        const error = new Error('Note not found');
        error.statusCode = 404;
        throw error;
      }
      return note;
    } catch (error) {
      throw error;
    }
  }

  async search(query) {
    try {
      if (!query) {
        return [];
      }
      
      // Try text search first (requires text index)
      try {
        const textSearchResults = await Note.find(
          { $text: { $search: query } },
          { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });
        
        if (textSearchResults.length > 0) {
          return textSearchResults;
        }
      } catch (err) {
        // Text search failed, fallback to regex
        console.log('Text search failed, using regex search');
      }
      
      // Fallback to regex search if text search returns no results or fails
      return await Note.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { body: { $regex: query, $options: 'i' } }
        ]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NoteService(); 