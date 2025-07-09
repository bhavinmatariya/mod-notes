const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  }
}, {
  timestamps: true
});

// Add text index for search functionality
noteSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Note', noteSchema); 