# Security Features - /spec-ops Admin Page

## Multi-Layer Security Architecture

The `/spec-ops` admin page implements multiple layers of security to prevent unauthorized access:

### 1. Two-Factor Authentication (2FA)
- **Step 1**: Password verification using SHA-256 hash
- **Step 2**: Time-based One-Time Password (TOTP) verification
- 2FA codes rotate every 30 seconds
- Backend endpoint: `https://portal-t795.onrender.com/2fa` displays current code
- API endpoint: `https://portal-t795.onrender.com/api/2fa/current` provides code via JSON

### 2. Rate Limiting & Account Lockout
- Maximum 3 failed login attempts
- 15-minute lockout after exceeding max attempts
- Lockout applies to both password and 2FA verification
- Attempts tracked in localStorage

### 3. Session Management
- 30-minute session timeout
- Session validated on page load
- Requires both password AND 2FA verification for valid session
- Sessions cleared on timeout or logout

### 4. IP Tracking & Logging
- User IP address logged for all authentication attempts
- Location detection (city, country)
- Security events logged to console (production: send to SIEM)
- Failed attempts trigger security warnings

### 5. Secure Connection Monitoring
- HTTPS enforcement in production
- Connection security status displayed to user
- Warning shown for insecure connections

### 6. MongoDB Data Persistence
- All analytics data stored in MongoDB Atlas
- Hardcoded connection string: `mongodb+srv://blakeflyz1_db_user:REkE0JzAuMQUWZNU@cluster0.fh6dmbp.mongodb.net/superbowl2026`
- Collections:
  - `announcements` - Admin announcements
  - `visitors` - Unique visitor tracking
  - `visits` - Detailed visit logs
  - `gameActivity` - Game-specific analytics
  - `playerCount` - Real-time player counts
  - `currentPlayers` - Current active players per game

### 7. CORS & CSP Protection
- Helmet.js security headers
- CORS restricted to allowed origins
- Content Security Policy configured

## Authentication Flow

```
1. User enters password → SHA-256 hash verification
   ↓ (Success)
2. Password verified → 2FA screen shown
   ↓
3. User checks https://portal-t795.onrender.com/2fa for current code
   ↓
4. User enters 6-digit code → Backend verification
   ↓ (Success)
5. Full access granted with session cookie
```

## Backend Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/announcements` - Get current announcement
- `GET /api/stats` - Get visitor statistics
- `POST /api/visit` - Track visitor
- `GET /2fa` - Display current 2FA code (HTML page)
- `GET /api/2fa/current` - Get current 2FA code (JSON)

### Protected Endpoints (Require Authentication)
- `POST /api/announcements` - Create/update announcement
- `DELETE /api/announcements` - Disable announcement
- `GET /api/visits-live` - Get live visitor logs
- `POST /api/player-count` - Track player count
- `GET /api/player-count` - Get player counts
- `GET /api/game-stats` - Get game statistics
- `POST /api/2fa/verify` - Verify 2FA code

## Security Best Practices

1. **Never share the admin passcode** - Current hash: `bc10b57514d76124b4120a34db2224067fed660b09408ade0b14b582946ff2fc`
2. **Monitor the 2FA display page** - Bookmark `https://portal-t795.onrender.com/2fa`
3. **Check logs regularly** - Review failed login attempts
4. **Use HTTPS always** - Ensure secure connection
5. **Don't bypass 2FA** - Both factors required for access
6. **Session timeout** - Re-authenticate after 30 minutes
7. **MongoDB security** - Connection string is hardcoded but uses strong credentials

## Testing 2FA Locally

```bash
# Get current 2FA code
curl http://localhost:3001/api/2fa/current

# Verify a code
curl -X POST http://localhost:3001/api/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

## Emergency Access

If locked out:
1. Wait 15 minutes for lockout to expire
2. Clear localStorage: `localStorage.removeItem('forsyth-admin-lockout')`
3. Clear sessionStorage: `sessionStorage.clear()`
4. Refresh the page

## Future Enhancements

- [ ] Add email notifications for failed login attempts
- [ ] Implement IP whitelisting
- [ ] Add biometric authentication
- [ ] Implement CAPTCHA after failed attempts
- [ ] Add audit log dashboard
- [ ] Implement API key rotation
- [ ] Add geofencing restrictions
