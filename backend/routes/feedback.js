const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// POST /api/feedback - Save feedback
router.post('/', async (req, res) => {
  try {
    const { restaurantId, ratings, comment } = req.body;

    // Perform sentiment analysis on comment
    let sentimentScore = 0;
    let sentimentLabel = 'neutral';
    
    if (comment && comment.trim()) {
      const result = sentiment.analyze(comment);
      sentimentScore = result.score;
      
      if (result.score > 2) {
        sentimentLabel = 'positive';
      } else if (result.score < -2) {
        sentimentLabel = 'negative';
      } else {
        sentimentLabel = 'neutral';
      }
    }

    const feedback = new Feedback({
      restaurantId: restaurantId || 'default',
      ratings,
      comment: comment || '',
      sentimentScore,
      sentimentLabel
    });

    await feedback.save();
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving feedback',
      error: error.message
    });
  }
});

// GET /api/feedback - Get all feedback
router.get('/', async (req, res) => {
  try {
    const { restaurantId, startDate, endDate } = req.query;
    
    let query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json({
      success: true,
      data: feedback,
      count: feedback.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

module.exports = router;
