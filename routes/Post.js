const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  content: {
    type: String,

  },
  
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: String
  }],
  shares: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
