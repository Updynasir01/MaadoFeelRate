# MaadoFeelRate - Smart Feedback & Emotional Analytics for Restaurants

A modern, luxury-style feedback system for restaurants with real-time analytics and sentiment analysis.

## Features

- 📱 **Customer Feedback Page**: Emoji-based ratings for Food, Service, and Atmosphere
- 📊 **Admin Dashboard**: Real-time analytics with charts and trend analysis
- 🎨 **Sentiment Analysis**: Automatic sentiment detection on comments
- 📈 **Visual Analytics**: Line charts, bar charts, and doughnut charts
- 📱 **Mobile-Responsive**: Works perfectly on iPhone, tablet, and desktop
- 🎯 **Exportable Reports**: CSV export functionality

## Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Charts**: Chart.js
- **Sentiment Analysis**: npm sentiment package

## Design

- Background: White
- Headings & Labels: `#1F3564` (Primary Blue)
- Buttons & Highlights: `#877451` (Accent Gold)
- Style: Minimal, luxury, professional, tech-savvy, modern

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and set your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/maadofeelrate
   PORT=5000
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```
   This will start both backend (port 5000) and frontend (port 3000) concurrently.

   Or start them separately:
   ```bash
   # Backend
   npm run server

   # Frontend (in another terminal)
   npm run client
   ```

## Usage

### Customer Feedback Page
- Visit `http://localhost:3000` to access the feedback form
- Rate Food, Service, and Atmosphere using emojis
- Add optional comments
- Submit feedback

### Admin Dashboard
- Visit `http://localhost:3000/login` to access the admin login page
- **Default credentials:**
  - Username: `admin`
  - Password: `admin123`
- After logging in, you'll be redirected to the analytics dashboard at `http://localhost:3000/admin`
- View overall satisfaction percentage
- Analyze trends over time
- Read recent comments with sentiment analysis
- Filter by time period (All Time, Last 7 Days, Last 30 Days, etc.)
- Export data to CSV
- Click "Logout" button to sign out

## API Endpoints

- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (with optional query params: restaurantId, startDate, endDate)
- `GET /api/analytics` - Get analytics data (with optional query params: period, restaurantId)

## Project Structure

```
maado-feelrate/
├── backend/
│   ├── models/
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── feedback.js
│   │   └── analytics.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FeedbackPage.js
│   │   │   └── AdminDashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## Future Enhancements

- QR code integration for table access
- Emotion heatmap per table/section
- AI auto-reply to feedback
- Multi-restaurant support
- Subscription/SaaS-ready version
- PDF export functionality

## License

MIT

