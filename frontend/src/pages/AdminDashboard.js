import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getFeedback } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [recentComments, setRecentComments] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = () => {
    setLoading(true);
    Promise.all([
      getAnalytics({ period }),
      getFeedback({ restaurantId: 'default' })
    ])
      .then(([analyticsRes, feedbackRes]) => {
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data);
        }
        // Handle feedback data separately in case analytics fails
        if (feedbackRes && feedbackRes.success) {
          const feedbackData = feedbackRes.data || [];
          setAllFeedback(feedbackData);
          setRecentComments(feedbackData.slice(0, 10));
        } else {
          // Still try to get feedback even if structure is different
          const feedbackData = Array.isArray(feedbackRes?.data) ? feedbackRes.data : (feedbackRes?.data?.data || []);
          setAllFeedback(feedbackData);
          setRecentComments(feedbackData.slice(0, 10));
        }
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-300';
      case 'negative': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const exportToCSV = async () => {
    let feedbackToExport = allFeedback;
    
    // If no feedback in state, fetch it first
    if (!feedbackToExport || feedbackToExport.length === 0) {
      try {
        const feedbackRes = await getFeedback({ restaurantId: 'default' });
        // Handle different response structures
        feedbackToExport = feedbackRes?.success ? (feedbackRes.data || []) : (Array.isArray(feedbackRes?.data) ? feedbackRes.data : []);
        
        if (!feedbackToExport || feedbackToExport.length === 0) {
          alert('No feedback data available to export. Please make sure you have feedback submissions first.');
          return;
        }
        
        // Update state for future use
        setAllFeedback(feedbackToExport);
      } catch (error) {
        console.error('Error fetching feedback for export:', error);
        alert('Error loading feedback data. Please try again.');
        return;
      }
    }

    // Filter feedback based on selected period
    let filteredFeedback = feedbackToExport;
    const now = new Date();
    
    if (period === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredFeedback = feedbackToExport.filter(f => new Date(f.createdAt) >= sevenDaysAgo);
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredFeedback = feedbackToExport.filter(f => new Date(f.createdAt) >= thirtyDaysAgo);
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      filteredFeedback = feedbackToExport.filter(f => new Date(f.createdAt) >= startOfWeek);
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredFeedback = feedbackToExport.filter(f => new Date(f.createdAt) >= startOfMonth);
    }

    if (filteredFeedback.length === 0) {
      alert('No feedback data available for the selected period.');
      return;
    }

    // CSV Headers
    const headers = ['Date', 'Time', 'Food Rating', 'Service Rating', 'Atmosphere Rating', 'Comment', 'Sentiment', 'Sentiment Score'];
    
    // Convert feedback to CSV rows
    const rows = filteredFeedback.map(feedback => {
      const date = new Date(feedback.createdAt);
      // Ensure proper encoding for emojis and special characters
      const foodRating = feedback.ratings?.food || '';
      const serviceRating = feedback.ratings?.service || '';
      const atmosphereRating = feedback.ratings?.atmosphere || '';
      const comment = (feedback.comment || '').replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
      
      return [
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm:ss'),
        foodRating,
        serviceRating,
        atmosphereRating,
        `"${comment}"`,
        feedback.sentimentLabel || 'neutral',
        feedback.sentimentScore || 0
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add UTF-8 BOM for proper emoji/unicode display in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create and download the file with UTF-8 BOM encoding
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maadofeelrate-feedback-${period}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-primary text-lg">No data available</p>
      </div>
    );
  }

  const lineChartData = {
    labels: analytics.trends.labels,
    datasets: [
      {
        label: 'Food',
        data: analytics.trends.food,
        borderColor: '#877451',
        backgroundColor: 'rgba(135, 116, 81, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Service',
        data: analytics.trends.service,
        borderColor: '#1F3564',
        backgroundColor: 'rgba(31, 53, 100, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Atmosphere',
        data: analytics.trends.atmosphere,
        borderColor: '#877451',
        backgroundColor: 'rgba(135, 116, 81, 0.05)',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Food', 'Service', 'Atmosphere'],
    datasets: [
      {
        label: 'Positive 😊',
        data: [
          analytics.foodRatings['😊'],
          analytics.serviceRatings['😊'],
          analytics.atmosphereRatings['😊'],
        ],
        backgroundColor: '#877451',
      },
      {
        label: 'Neutral 😐',
        data: [
          analytics.foodRatings['😐'],
          analytics.serviceRatings['😐'],
          analytics.atmosphereRatings['😐'],
        ],
        backgroundColor: '#94a3b8',
      },
      {
        label: 'Negative 😞',
        data: [
          analytics.foodRatings['😞'],
          analytics.serviceRatings['😞'],
          analytics.atmosphereRatings['😞'],
        ],
        backgroundColor: '#ef4444',
      },
    ],
  };

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          analytics.sentimentBreakdown.positive,
          analytics.sentimentBreakdown.neutral,
          analytics.sentimentBreakdown.negative,
        ],
        backgroundColor: ['#10b981', '#94a3b8', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1F3564',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        color: '#1F3564',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#f3f4f6',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#f3f4f6',
        },
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 bg-luxury-pattern opacity-30"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="w-16 h-1 gradient-gold mb-3 rounded-full"></div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 font-light">
                Real-time feedback insights and trends
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-primary focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-10 focus:outline-none transition-smooth bg-white shadow-sm"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                onClick={exportToCSV}
                className="bg-accent text-white px-6 py-2 rounded-xl font-semibold btn-primary shadow-sm hover:shadow-md transition-smooth"
              >
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-primary px-6 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-smooth"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Luxury Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card-luxury rounded-2xl p-8 slide-up transition-smooth">
            <div className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide">Overall Satisfaction</div>
            <div className="text-5xl font-display font-bold text-primary mb-2">{analytics.overallSatisfaction}%</div>
            <div className="text-sm text-gray-400 font-light">Positive ratings</div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full gradient-gold rounded-full" style={{ width: `${analytics.overallSatisfaction}%` }}></div>
            </div>
          </div>
          <div className="card-luxury rounded-2xl p-8 slide-up transition-smooth">
            <div className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide">Total Feedback</div>
            <div className="text-5xl font-display font-bold text-accent mb-2">{analytics.totalFeedback}</div>
            <div className="text-sm text-gray-400 font-light">All time submissions</div>
          </div>
          <div className="card-luxury rounded-2xl p-8 slide-up transition-smooth">
            <div className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wide">Recent Comments</div>
            <div className="text-5xl font-display font-bold text-primary mb-2">{analytics.recentComments.length}</div>
            <div className="text-sm text-gray-400 font-light">With text feedback</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trends Line Chart */}
          <div className="card-luxury rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-display font-bold text-primary mb-6">7-Day Trends</h2>
            <div className="h-64">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Ratings Bar Chart */}
          <div className="card-luxury rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-display font-bold text-primary mb-6">Rating Breakdown</h2>
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Sentiment Chart and Recent Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sentiment Doughnut */}
          <div className="card-luxury rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-display font-bold text-primary mb-6">Sentiment Analysis</h2>
            <div className="h-48">
              <Doughnut data={sentimentData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Comments */}
          <div className="lg:col-span-2 card-luxury rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-display font-bold text-primary mb-6">Recent Comments</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analytics.recentComments.length > 0 ? (
                analytics.recentComments.map((comment, index) => (
                  <div
                    key={comment.id || index}
                    className="border-l-4 border-gray-200 pl-4 py-2 hover:border-accent transition-smooth"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <span className="text-2xl">{comment.ratings.food}</span>
                        <span className="text-2xl">{comment.ratings.service}</span>
                        <span className="text-2xl">{comment.ratings.atmosphere}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSentimentColor(
                          comment.sentiment
                        )}`}
                      >
                        {comment.sentiment || 'neutral'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{comment.comment}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No comments yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

