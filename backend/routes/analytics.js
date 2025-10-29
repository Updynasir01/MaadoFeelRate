const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { startOfWeek, startOfMonth, subDays, subWeeks } = require('date-fns');

// Helper function to convert emoji to numeric score
const emojiToScore = (emoji) => {
  if (emoji === '😊') return 3;
  if (emoji === '😐') return 2;
  if (emoji === '😞') return 1;
  return 0;
};

// Helper function to get percentage positive
const getPositivePercentage = (feedback) => {
  if (feedback.length === 0) return 0;
  let positiveCount = 0;
  
  feedback.forEach(f => {
    const avgScore = (
      emojiToScore(f.ratings.food) +
      emojiToScore(f.ratings.service) +
      emojiToScore(f.ratings.atmosphere)
    ) / 3;
    if (avgScore >= 2.5) positiveCount++;
  });
  
  return Math.round((positiveCount / feedback.length) * 100);
};

// GET /api/analytics - Get analytics data
router.get('/', async (req, res) => {
  try {
    const { restaurantId, period = 'all' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      dateFilter.createdAt = { $gte: startOfWeek(now, { weekStartsOn: 1 }) };
    } else if (period === 'month') {
      dateFilter.createdAt = { $gte: startOfMonth(now) };
    } else if (period === '7days') {
      dateFilter.createdAt = { $gte: subDays(now, 7) };
    } else if (period === '30days') {
      dateFilter.createdAt = { $gte: subDays(now, 30) };
    }
    
    let query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    query = { ...query, ...dateFilter };

    const allFeedback = await Feedback.find(query).sort({ createdAt: -1 });
    
    if (allFeedback.length === 0) {
      return res.json({
        success: true,
        data: {
          overallSatisfaction: 0,
          totalFeedback: 0,
          foodRatings: { '😊': 0, '😐': 0, '😞': 0 },
          serviceRatings: { '😊': 0, '😐': 0, '😞': 0 },
          atmosphereRatings: { '😊': 0, '😐': 0, '😞': 0 },
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          trends: {
            food: [],
            service: [],
            atmosphere: []
          },
          recentComments: []
        }
      });
    }

    // Calculate overall satisfaction percentage
    const overallSatisfaction = getPositivePercentage(allFeedback);

    // Count ratings
    const foodRatings = { '😊': 0, '😐': 0, '😞': 0 };
    const serviceRatings = { '😊': 0, '😐': 0, '😞': 0 };
    const atmosphereRatings = { '😊': 0, '😐': 0, '😞': 0 };
    
    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };

    allFeedback.forEach(f => {
      foodRatings[f.ratings.food]++;
      serviceRatings[f.ratings.service]++;
      atmosphereRatings[f.ratings.atmosphere]++;
      sentimentBreakdown[f.sentimentLabel]++;
    });

    // Generate trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      return date.toISOString().split('T')[0];
    });

    const trends = {
      food: last7Days.map(date => {
        const dayFeedback = allFeedback.filter(f => 
          f.createdAt.toISOString().split('T')[0] === date
        );
        if (dayFeedback.length === 0) return 0;
        const avg = dayFeedback.reduce((sum, f) => sum + emojiToScore(f.ratings.food), 0) / dayFeedback.length;
        return Math.round(avg * 10) / 10;
      }),
      service: last7Days.map(date => {
        const dayFeedback = allFeedback.filter(f => 
          f.createdAt.toISOString().split('T')[0] === date
        );
        if (dayFeedback.length === 0) return 0;
        const avg = dayFeedback.reduce((sum, f) => sum + emojiToScore(f.ratings.service), 0) / dayFeedback.length;
        return Math.round(avg * 10) / 10;
      }),
      atmosphere: last7Days.map(date => {
        const dayFeedback = allFeedback.filter(f => 
          f.createdAt.toISOString().split('T')[0] === date
        );
        if (dayFeedback.length === 0) return 0;
        const avg = dayFeedback.reduce((sum, f) => sum + emojiToScore(f.ratings.atmosphere), 0) / dayFeedback.length;
        return Math.round(avg * 10) / 10;
      })
    };

    // Get recent comments with sentiment
    const recentComments = allFeedback
      .filter(f => f.comment && f.comment.trim())
      .slice(0, 10)
      .map(f => ({
        id: f._id,
        comment: f.comment,
        sentiment: f.sentimentLabel,
        sentimentScore: f.sentimentScore,
        ratings: f.ratings,
        createdAt: f.createdAt
      }));

    res.json({
      success: true,
      data: {
        overallSatisfaction,
        totalFeedback: allFeedback.length,
        foodRatings,
        serviceRatings,
        atmosphereRatings,
        sentimentBreakdown,
        trends: {
          labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          food: trends.food,
          service: trends.service,
          atmosphere: trends.atmosphere
        },
        recentComments
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

module.exports = router;

