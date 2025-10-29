const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    default: 'default',
    required: true
  },
  ratings: {
    food: {
      type: String,
      enum: ['😊', '😐', '😞'],
      required: true
    },
    service: {
      type: String,
      enum: ['😊', '😐', '😞'],
      required: true
    },
    atmosphere: {
      type: String,
      enum: ['😊', '😐', '😞'],
      required: true
    }
  },
  comment: {
    type: String,
    default: ''
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  sentimentLabel: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);

