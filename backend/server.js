const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { connectDB, getDB } = require('./db');
const twoFA = require('./twoFactorAuth');
const rateLimit = require('express-rate-limit');

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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  xssFilter: true
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// CORS configuration
app.use(cors({
  origin: [
    'https://forsyth-county.github.io',
    'https://forsyth-county.github.io/portal/',
    'https://portal-t795.onrender.com',
    'https://forsyth.onrender.com',
    'http://localhost:3002',
    'http://localhost:3000'
  ],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiters for different endpoint types
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 authentication attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit admin actions to 10 per minute
  message: 'Too many admin requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// In-memory cache for announcements (backed by MongoDB)
let announcementCache = {
  current: {
    message: "",
    type: "info",
    timestamp: 0,
    id: "",
    enabled: false
  }
};

// GET /api/announcements - Fetch current announcement (public endpoint)
app.get('/api/announcements', async (req, res) => {
  try {
    const db = getDB();
    const announcement = await db.collection('announcements').findOne({ current: true });
    
    if (announcement) {
      res.json({
        message: announcement.message,
        type: announcement.type,
        timestamp: announcement.timestamp,
        id: announcement.id,
        enabled: announcement.enabled
      });
    } else {
      res.json(announcementCache.current);
    }
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.json(announcementCache.current);
  }
});

// POST /api/announcements - Create/update announcement (protected endpoint)
app.post('/api/announcements', 
  adminLimiter,
  // authenticateApiKey,
  // validateAnnouncement,
  // filterAndSanitize,
  async (req, res) => {
    try {
      const { message, type, enabled } = req.body;
      
      const newAnnouncement = {
        message: message.trim(),
        type: type || 'info',
        timestamp: Date.now(),
        id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        enabled: enabled !== false,
        current: true
      };
      
      const db = getDB();
      
      // Mark all existing announcements as not current
      await db.collection('announcements').updateMany(
        { current: true },
        { $set: { current: false } }
      );
      
      // Insert new announcement
      await db.collection('announcements').insertOne(newAnnouncement);
      
      // Update cache
      announcementCache.current = newAnnouncement;
      
      res.json({
        success: true,
        announcement: newAnnouncement
      });
    } catch (error) {
      console.error('Error saving announcement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save announcement'
      });
    }
  }
);

// DELETE /api/announcements - Disable current announcement (protected endpoint)
app.delete('/api/announcements', 
  adminLimiter,
  // authenticateApiKey,
  async (req, res) => {
    try {
      const db = getDB();
      
      // Disable current announcement
      await db.collection('announcements').updateMany(
        { current: true },
        { $set: { enabled: false, current: false } }
      );
      
      announcementCache.current.enabled = false;
      announcementCache.current.message = "";
      
      res.json({
        success: true,
        message: 'Announcement disabled'
      });
    } catch (error) {
      console.error('Error disabling announcement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable announcement'
      });
    }
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

// GET /2fa - Get current 2FA code (for display/testing)
app.get('/2fa', (req, res) => {
  const { code, secondsRemaining, expiresAt } = twoFA.getCurrentCode();
  
  // Return HTML page with auto-refresh
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>2FA Code</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Courier New', monospace;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .code {
          font-size: 4rem;
          font-weight: bold;
          letter-spacing: 0.5rem;
          margin: 1rem 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .timer {
          font-size: 1.5rem;
          margin-top: 1rem;
          opacity: 0.9;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          margin-top: 1rem;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #4ade80;
          transition: width 1s linear;
        }
        h1 {
          margin-top: 0;
          font-size: 1.5rem;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Forsyth Portal 2FA</h1>
        <div class="code" id="code">${code}</div>
        <div class="timer">Expires in <span id="timer">${secondsRemaining}</span>s</div>
        <div class="progress-bar">
          <div class="progress-fill" id="progress"></div>
        </div>
      </div>
      <script>
        let secondsLeft = ${secondsRemaining};
        const totalSeconds = 30;
        
        function updateTimer() {
          document.getElementById('timer').textContent = secondsLeft;
          const progress = (secondsLeft / totalSeconds) * 100;
          document.getElementById('progress').style.width = progress + '%';
          
          if (secondsLeft <= 0) {
            location.reload();
          } else {
            secondsLeft--;
            setTimeout(updateTimer, 1000);
          }
        }
        
        updateTimer();
        
        // Auto-refresh when code expires
        setTimeout(() => {
          location.reload();
        }, ${secondsRemaining * 1000});
      </script>
    </body>
    </html>
  `);
});

// GET /api/2fa/current - Get current 2FA code (JSON endpoint)
app.get('/api/2fa/current', (req, res) => {
  const codeData = twoFA.getCurrentCode();
  res.json({
    success: true,
    ...codeData
  });
});

// POST /api/2fa/verify - Verify a 2FA code
app.post('/api/2fa/verify', authLimiter, (req, res) => {
  const { code, token } = req.body;
  const codeToVerify = code || token;
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (!codeToVerify) {
    console.warn(`[SECURITY] 2FA verification failed - No code provided from IP: ${clientIP}`);
    return res.status(400).json({
      success: false,
      error: 'Code is required'
    });
  }
  
  const isValid = twoFA.verifyCode(codeToVerify);
  
  if (isValid) {
    console.log(`[SECURITY] ✅ 2FA verification successful from IP: ${clientIP}`);
    res.json({
      success: true,
      message: '2FA verification successful',
      verified: true
    });
  } else {
    console.warn(`[SECURITY] ❌ 2FA verification failed - Invalid code from IP: ${clientIP}`);
    res.status(401).json({
      success: false,
      message: 'Invalid 2FA code',
      verified: false
    });
  }
});

// GET /api/2fa/setup - Get QR code for 2FA setup
app.get('/api/2fa/setup', async (req, res) => {
  try {
    const qrCodeDataUrl = await twoFA.generateQRCode();
    const secret = twoFA.getSecret();
    
    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      secret: secret,
      instructions: 'Scan the QR code with Google Authenticator or enter the secret manually'
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

// POST /api/visit - Track visitor (public endpoint)
app.post('/api/visit', 
  // generalLimit,
  async (req, res) => {
    try {
      const { page, timestamp, userAgent: clientUserAgent, referrer, game, action } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = clientUserAgent || req.get('User-Agent') || '';
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const now = new Date();
      
      const db = getDB();
      
      // Track unique visitor (using IP + User-Agent hash)
      const visitorId = require('crypto')
        .createHash('sha256')
        .update(clientIP + userAgent)
        .digest('hex')
        .substring(0, 16); // First 16 chars for privacy
      
      // Check if visitor exists today
      const existingVisitor = await db.collection('visitors').findOne({
        date: today,
        visitorId: visitorId
      });
      
      const isNewVisitor = !existingVisitor;
      
      // Update or create visitor record
      if (!existingVisitor) {
        await db.collection('visitors').insertOne({
          visitorId,
          date: today,
          firstSeen: now,
          visitCount: 1
        });
      } else {
        await db.collection('visitors').updateOne(
          { visitorId, date: today },
          { $inc: { visitCount: 1 }, $set: { lastSeen: now } }
        );
      }
      
      // Log detailed visit information
      const visitLog = {
        visitorId,
        timestamp: timestamp || Date.now(),
        date: today,
        page: page || '/',
        ip: clientIP,
        userAgent: userAgent.substring(0, 200),
        referrer: referrer || 'direct',
        time: now,
        isNewVisitor,
        game: game || null,
        action: action || 'visit'
      };
      
      // Insert visit log
      await db.collection('visits').insertOne(visitLog);
      
      // Track game-specific activity
      if (game) {
        await db.collection('gameActivity').updateOne(
          { game, date: today },
          {
            $inc: { 
              visits: 1,
              uniquePlayers: isNewVisitor ? 1 : 0
            },
            $set: { lastActivity: now }
          },
          { upsert: true }
        );
      }
      
      // Get today's stats
      const todayVisitors = await db.collection('visitors').countDocuments({ date: today });
      const todayVisits = await db.collection('visits').countDocuments({ date: today });
      
      // Get overall stats
      const overallVisitors = await db.collection('visitors').distinct('visitorId').then(arr => arr.length);
      const overallVisits = await db.collection('visits').countDocuments({});
      
      // Get start date
      const firstVisit = await db.collection('visits').findOne({}, { sort: { timestamp: 1 } });
      const startDate = firstVisit ? firstVisit.time : now;
      
      // Log to console for real-time monitoring
      console.log(`📍 VISIT LOGGED: ${page} | Visitor: ${visitorId.substring(0, 8)}... | IP: ${clientIP} | Time: ${now.toISOString()} | New: ${isNewVisitor}`);
      
      res.json({
        success: true,
        stats: {
          today: {
            uniqueVisitors: todayVisitors,
            totalVisits: todayVisits,
            isNewVisitor: isNewVisitor
          },
          overall: {
            uniqueVisitors: overallVisitors,
            totalVisits: overallVisits,
            startDate: startDate
          }
        },
        visitLog: {
          id: visitorId.substring(0, 8),
          page: page || '/',
          timestamp: now.toISOString(),
          isNewVisitor
        }
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track visit'
      });
    }
  }
);

// GET /api/stats - Get visitor statistics (public endpoint)
app.get('/api/stats', async (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's stats
    const todayVisitors = await db.collection('visitors').countDocuments({ date: today });
    const todayVisits = await db.collection('visits').countDocuments({ date: today });
    
    // Get last 7 days of stats
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayVisitors = await db.collection('visitors').countDocuments({ date: dateStr });
      const dayVisits = await db.collection('visits').countDocuments({ date: dateStr });
      
      last7Days.push({
        date: dateStr,
        uniqueVisitors: dayVisitors,
        totalVisits: dayVisits
      });
    }
    
    // Get recent activity (last 10 visits)
    const recentVisits = await db.collection('visits')
      .find({ date: today })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    const recentActivity = recentVisits.map(visit => ({
      page: visit.page,
      timestamp: visit.time,
      isNewVisitor: visit.isNewVisitor,
      visitorId: visit.visitorId.substring(0, 8)
    }));
    
    // Get overall stats
    const overallVisitors = await db.collection('visitors').distinct('visitorId').then(arr => arr.length);
    const overallVisits = await db.collection('visits').countDocuments({});
    
    // Get start date
    const firstVisit = await db.collection('visits').findOne({}, { sort: { timestamp: 1 } });
    const startDate = firstVisit ? firstVisit.time : new Date();
    
    res.json({
      success: true,
      stats: {
        today: {
          uniqueVisitors: todayVisitors,
          totalVisits: todayVisits,
          date: today,
          recentActivity
        },
        last7Days: last7Days,
        overall: {
          uniqueVisitors: overallVisitors,
          totalVisits: overallVisits,
          startDate: startDate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// GET /api/visits-live - Get real-time visitor logs (admin endpoint)
app.get('/api/visits-live', async (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];
    
    // Get all visits from today, most recent first
    const allVisits = await db.collection('visits')
      .find({ date: today })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    const formattedVisits = allVisits.map(visit => ({
      visitorId: visit.visitorId.substring(0, 8),
      page: visit.page,
      timestamp: visit.time,
      ip: visit.ip,
      isNewVisitor: visit.isNewVisitor,
      referrer: visit.referrer,
      game: visit.game || null
    }));
    
    const uniqueToday = await db.collection('visitors').countDocuments({ date: today });
    
    res.json({
      success: true,
      visits: formattedVisits,
      totalToday: allVisits.length,
      uniqueToday: uniqueToday
    });
  } catch (error) {
    console.error('Error fetching live visits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live visits'
    });
  }
});

// POST /api/player-count - Track player count for games
app.post('/api/player-count', async (req, res) => {
  try {
    const { game, count, action } = req.body;
    const db = getDB();
    const now = new Date();
    
    // Store player count snapshot
    await db.collection('playerCount').insertOne({
      game,
      count: count || 1,
      action: action || 'playing',
      timestamp: now,
      date: now.toISOString().split('T')[0]
    });
    
    // Update current player count
    await db.collection('currentPlayers').updateOne(
      { game },
      {
        $set: {
          count: count || 1,
          lastUpdate: now
        }
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      game,
      count: count || 1
    });
  } catch (error) {
    console.error('Error tracking player count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track player count'
    });
  }
});

// GET /api/player-count - Get current player counts
app.get('/api/player-count', async (req, res) => {
  try {
    const db = getDB();
    const { game } = req.query;
    
    if (game) {
      // Get specific game player count
      const playerData = await db.collection('currentPlayers').findOne({ game });
      res.json({
        success: true,
        game,
        count: playerData ? playerData.count : 0,
        lastUpdate: playerData ? playerData.lastUpdate : null
      });
    } else {
      // Get all games player count
      const allPlayers = await db.collection('currentPlayers').find({}).toArray();
      res.json({
        success: true,
        games: allPlayers.map(p => ({
          game: p.game,
          count: p.count,
          lastUpdate: p.lastUpdate
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching player count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player count'
    });
  }
});

// GET /api/game-stats - Get game-specific statistics
app.get('/api/game-stats', async (req, res) => {
  try {
    const db = getDB();
    const { game, days } = req.query;
    const daysToFetch = parseInt(days) || 7;
    
    if (game) {
      // Get stats for specific game
      const gameActivity = [];
      for (let i = daysToFetch - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const activity = await db.collection('gameActivity').findOne({ game, date: dateStr });
        gameActivity.push({
          date: dateStr,
          visits: activity ? activity.visits : 0,
          uniquePlayers: activity ? activity.uniquePlayers : 0
        });
      }
      
      res.json({
        success: true,
        game,
        activity: gameActivity
      });
    } else {
      // Get top games by activity
      const today = new Date().toISOString().split('T')[0];
      const topGames = await db.collection('gameActivity')
        .find({ date: today })
        .sort({ visits: -1 })
        .limit(10)
        .toArray();
      
      res.json({
        success: true,
        topGames: topGames.map(g => ({
          game: g.game,
          visits: g.visits,
          uniquePlayers: g.uniquePlayers
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game stats'
    });
  }
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

// Initialize database and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Load current announcement from DB
    const db = getDB();
    const currentAnnouncement = await db.collection('announcements').findOne({ current: true });
    if (currentAnnouncement) {
      announcementCache.current = currentAnnouncement;
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Secure announcement server running on port ${PORT}`);
      console.log(`🔒 Security features enabled:`);
      console.log(`   - API Key Authentication`);
      console.log(`   - Rate Limiting`);
      console.log(`   - Content Filtering`);
      console.log(`   - Input Validation`);
      console.log(`   - XSS Protection`);
      console.log(`📊 Analytics features enabled:`);
      console.log(`   - Visitor Tracking with MongoDB`);
      console.log(`   - Daily Statistics`);
      console.log(`   - Privacy-First (hashed IPs)`);
      console.log(`   - Game Activity Tracking`);
      console.log(`   - Player Count Tracking`);
      console.log(`📢 API endpoints available:`);
      console.log(`   GET  /api/announcements - Fetch current announcement`);
      console.log(`   POST /api/announcements - Create/update announcement (protected)`);
      console.log(`   DELETE /api/announcements - Disable announcement (protected)`);
      console.log(`   GET  /api/health - Health check`);
      console.log(`   POST /api/visit - Track visitor (public)`);
      console.log(`   GET  /api/stats - Get visitor statistics (public)`);
      console.log(`   GET  /api/visits-live - Get live visitor logs (admin)`);
      console.log(`   POST /api/player-count - Track player count`);
      console.log(`   GET  /api/player-count - Get current player counts`);
      console.log(`   GET  /api/game-stats - Get game statistics`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  const { closeDB } = require('./db');
  await closeDB();
  process.exit(0);
});

module.exports = app;
