const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Filter = require('bad-words');
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

// Create a DOM window for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Initialize profanity filter
const filter = new Filter();

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
exports.generalLimit = createRateLimit(
  1 * 60 * 1000, // 1 minute
  10000, // 10000 requests per minute (very generous)
  'Rate limit exceeded. Please wait a moment.'
);

exports.adminLimit = createRateLimit(
  60 * 1000, // 1 minute
  50, // 50 admin actions per minute (increased from 20)
  'Too many admin actions, please slow down.'
);

// API Key authentication middleware
exports.authenticateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  const validApiKey = process.env.ADMIN_API_KEY;

  if (!validApiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
};

// Input validation middleware
exports.validateAnnouncement = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
    .escape(),
  
  body('type')
    .isIn(['info', 'warning', 'success'])
    .withMessage('Type must be info, warning, or success'),
  
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];

// Content filtering and sanitization
exports.filterAndSanitize = (req, res, next) => {
  try {
    const { message } = req.body;

    // Check for profanity
    if (filter.isProfane(message)) {
      return res.status(400).json({ 
        error: 'Message contains inappropriate content',
        filtered: filter.clean(message)
      });
    }

    // Sanitize HTML to prevent XSS
    const sanitizedMessage = purify.sanitize(message, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });

    // Additional security checks
    const suspiciousPatterns = [
      /javascript:/i,
      /<script/i,
      /on\w+\s*=/i,
      /data:text\/html/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitizedMessage)) {
        return res.status(400).json({ 
          error: 'Message contains potentially malicious content' 
        });
      }
    }

    // Replace the message with the sanitized version
    req.body.message = sanitizedMessage;
    next();
  } catch (error) {
    console.error('Content filtering error:', error);
    res.status(500).json({ error: 'Content processing error' });
  }
};

// Log security events
exports.logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, details);
};
