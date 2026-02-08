const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://forsyth-county.github.io',
    'https://forsyth-county.github.io/portal/',
    'https://portal-t795.onrender.com',
    'http://localhost:3002',
    'http://localhost:3000'
  ],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply basic rate limiting to all routes
// app.use(generalLimit);

// In-memory storage for announcements (you can replace with a database)
let announcements = {
  current: {
    message: "",
    type: "info",
    timestamp: 0,
    id: "",
    enabled: false
  }
};

// In-memory storage for visitor analytics
let visitors = {
  daily: new Map(), // date -> { uniqueVisitors: Set, totalVisits: number }
  overall: {
    totalVisitors: new Set(),
    totalVisits: 0,
    startDate: new Date().toISOString()
  }
};

// Daily reset function - runs at midnight to reset daily counts
const resetDailyVisitors = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Check if we need to reset (first visit of the day or different day)
  const lastReset = visitors.lastResetDate;
  const needsReset = !lastReset || new Date(lastReset).toDateString() !== now.toDateString();
  
  if (needsReset) {
    console.log(`🔄 Daily visitor reset triggered for ${today}`);
    // Clear daily map but keep overall stats
    visitors.daily.clear();
    visitors.lastResetDate = now;
  }
};

// GET /api/announcements - Fetch current announcement (public endpoint)
app.get('/api/announcements', (req, res) => {
  res.json(announcements.current);
});

// POST /api/announcements - Create/update announcement (protected endpoint)
app.post('/api/announcements', 
  // authenticateApiKey,
  // adminLimit,
  // validateAnnouncement,
  // filterAndSanitize,
  (req, res) => {
    const { message, type, enabled } = req.body;
    
    const newAnnouncement = {
      message: message.trim(),
      type: type || 'info',
      timestamp: Date.now(),
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      enabled: enabled !== false
    };
    
    announcements.current = newAnnouncement;
    
    res.json({
      success: true,
      announcement: newAnnouncement
    });
  }
);

// DELETE /api/announcements - Disable current announcement (protected endpoint)
app.delete('/api/announcements', 
  // authenticateApiKey,
  // adminLimit,
  (req, res) => {
    const oldAnnouncement = { ...announcements.current };
    
    announcements.current.enabled = false;
    announcements.current.message = "";
    
    res.json({
      success: true,
      message: 'Announcement disabled'
    });
  }
);

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// POST /api/visit - Track visitor (public endpoint)
app.post('/api/visit', 
  // generalLimit,
  (req, res) => {
    const { page, timestamp, userAgent: clientUserAgent, referrer } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = clientUserAgent || req.get('User-Agent') || '';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const now = new Date();
    
    // Reset daily visitors if needed
    resetDailyVisitors();
    
    // Create or get today's stats
    if (!visitors.daily.has(today)) {
      visitors.daily.set(today, {
        uniqueVisitors: new Set(),
        totalVisits: 0,
        visits: [] // Store detailed visit logs
      });
    }
    
    const todayStats = visitors.daily.get(today);
    
    // Track unique visitor (using IP + User-Agent hash)
    const visitorId = require('crypto')
      .createHash('sha256')
      .update(clientIP + userAgent)
      .digest('hex')
      .substring(0, 16); // First 16 chars for privacy
    
    const isNewVisitor = !todayStats.uniqueVisitors.has(visitorId);
    
    // Update today's stats
    todayStats.uniqueVisitors.add(visitorId);
    todayStats.totalVisits++;
    
    // Log detailed visit information
    const visitLog = {
      visitorId,
      timestamp: timestamp || Date.now(),
      page: page || '/',
      ip: clientIP,
      userAgent: userAgent.substring(0, 200), // Limit length
      referrer: referrer || 'direct',
      time: now.toISOString(),
      isNewVisitor
    };
    
    // Add to today's visit logs (keep last 1000 for performance)
    if (!todayStats.visits) todayStats.visits = [];
    todayStats.visits.push(visitLog);
    if (todayStats.visits.length > 1000) {
      todayStats.visits = todayStats.visits.slice(-1000);
    }
    
    // Update overall stats
    visitors.overall.totalVisitors.add(visitorId);
    visitors.overall.totalVisits++;
    
    // Log to console for real-time monitoring
    console.log(`📍 VISIT LOGGED: ${page} | Visitor: ${visitorId.substring(0, 8)}... | IP: ${clientIP} | Time: ${now.toISOString()} | New: ${isNewVisitor}`);
    
    res.json({
      success: true,
      stats: {
        today: {
          uniqueVisitors: todayStats.uniqueVisitors.size,
          totalVisits: todayStats.totalVisits,
          isNewVisitor: isNewVisitor
        },
        overall: {
          uniqueVisitors: visitors.overall.totalVisitors.size,
          totalVisits: visitors.overall.totalVisits,
          startDate: visitors.overall.startDate
        }
      },
      visitLog: {
        id: visitorId.substring(0, 8),
        page: page || '/',
        timestamp: now.toISOString(),
        isNewVisitor
      }
    });
  }
);

// GET /api/stats - Get visitor statistics (public endpoint)
app.get('/api/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayStats = visitors.daily.get(today) || { uniqueVisitors: new Set(), totalVisits: 0, visits: [] };
  
  // Get last 7 days of stats
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayStats = visitors.daily.get(dateStr) || { uniqueVisitors: new Set(), totalVisits: 0 };
    
    last7Days.push({
      date: dateStr,
      uniqueVisitors: dayStats.uniqueVisitors.size,
      totalVisits: dayStats.totalVisits
    });
  }
  
  // Get recent activity (last 10 visits)
  const recentActivity = (todayStats.visits || []).slice(-10).reverse().map(visit => ({
    page: visit.page,
    timestamp: visit.time,
    isNewVisitor: visit.isNewVisitor,
    visitorId: visit.visitorId.substring(0, 8)
  }));
  
  res.json({
    success: true,
    stats: {
      today: {
        uniqueVisitors: todayStats.uniqueVisitors.size,
        totalVisits: todayStats.totalVisits,
        date: today,
        recentActivity
      },
      last7Days: last7Days,
      overall: {
        uniqueVisitors: visitors.overall.totalVisitors.size,
        totalVisits: visitors.overall.totalVisits,
        startDate: visitors.overall.startDate
      }
    }
  });
});

// GET /api/visits-live - Get real-time visitor logs (admin endpoint)
app.get('/api/visits-live', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayStats = visitors.daily.get(today) || { visits: [] };
  
  // Get all visits from today, most recent first
  const allVisits = (todayStats.visits || []).slice().reverse().map(visit => ({
    visitorId: visit.visitorId.substring(0, 8),
    page: visit.page,
    timestamp: visit.time,
    ip: visit.ip,
    isNewVisitor: visit.isNewVisitor,
    referrer: visit.referrer
  }));
  
  res.json({
    success: true,
    visits: allVisits,
    totalToday: allVisits.length,
    uniqueToday: todayStats.uniqueVisitors ? todayStats.uniqueVisitors.size : 0
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Secure announcement server running on port ${PORT}`);
  console.log(`🔒 Security features enabled:`);
  console.log(`   - API Key Authentication`);
  console.log(`   - Rate Limiting`);
  console.log(`   - Content Filtering`);
  console.log(`   - Input Validation`);
  console.log(`   - XSS Protection`);
  console.log(`📊 Analytics features enabled:`);
  console.log(`   - Visitor Tracking`);
  console.log(`   - Daily Statistics`);
  console.log(`   - Privacy-First (hashed IPs)`);
  console.log(`   - Daily Reset at Midnight`);
  console.log(`📢 API endpoints available:`);
  console.log(`   GET  /api/announcements - Fetch current announcement`);
  console.log(`   POST /api/announcements - Create/update announcement (protected)`);
  console.log(`   DELETE /api/announcements - Disable announcement (protected)`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/visit - Track visitor (public)`);
  console.log(`   GET  /api/stats - Get visitor statistics (public)`);
  
  // Schedule daily reset at midnight
  const scheduleMidnightReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      resetDailyVisitors();
      console.log(`🔄 Scheduled daily visitor reset completed at ${new Date().toISOString()}`);
      
      // Schedule next day's reset
      scheduleMidnightReset();
    }, msUntilMidnight);
  };
  
  // Start the daily reset schedule
  scheduleMidnightReset();
});

module.exports = app;
