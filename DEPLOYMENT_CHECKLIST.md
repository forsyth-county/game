# Deployment Checklist

## Pre-Deployment Steps

### 1. Backend Deployment
- [ ] Deploy updated `backend/` directory to https://portal-t795.onrender.com
- [ ] Ensure all dependencies are installed (`npm install`)
- [ ] Verify MongoDB connection is working
- [ ] Test all API endpoints
- [ ] Verify 2FA endpoint is accessible

### 2. MongoDB Verification
- [ ] Confirm connection string is correct
- [ ] Test database write operations
- [ ] Verify indexes are created
- [ ] Check collection permissions

### 3. Security Verification
- [ ] Test 2FA code generation at `/2fa`
- [ ] Verify 2FA code rotates every 30 seconds
- [ ] Test password authentication
- [ ] Test 2FA verification flow
- [ ] Confirm rate limiting is working
- [ ] Test account lockout mechanism

## Post-Deployment Testing

### 1. Service Worker Fix
- [ ] Visit https://forsyth-county.github.io/portal/games/stumble-guys
- [ ] Open browser console
- [ ] Verify no 404 errors for `sw.js`
- [ ] Confirm service worker registers successfully

### 2. Admin Panel Security
- [ ] Navigate to `/spec-ops`
- [ ] Test password login (passcode: 1140)
- [ ] Verify 2FA screen appears
- [ ] Visit https://portal-t795.onrender.com/2fa to get current code
- [ ] Enter 2FA code and verify access is granted
- [ ] Test invalid password (should fail)
- [ ] Test invalid 2FA code (should fail)
- [ ] Test rate limiting (5+ failed attempts should trigger lockout)
- [ ] Test session timeout (wait 30 minutes, should logout)

### 3. Analytics Verification
- [ ] Check MongoDB collections are populated
- [ ] Verify visitor tracking is working
- [ ] Confirm analytics display on admin dashboard
- [ ] Test live analytics updates

## Security Monitoring

### Daily Checks
- [ ] Review failed authentication attempts
- [ ] Check for unusual IP addresses
- [ ] Monitor MongoDB data growth
- [ ] Verify no service disruptions

### Weekly Checks
- [ ] Review all security logs
- [ ] Check rate limiting effectiveness
- [ ] Verify 2FA system stability
- [ ] Monitor database performance

## Emergency Procedures

### If Locked Out
1. Wait 15 minutes for automatic lockout expiration
2. Clear browser localStorage: `localStorage.removeItem('forsyth-admin-lockout')`
3. Clear sessionStorage: `sessionStorage.clear()`
4. Refresh page and try again

### If 2FA Not Working
1. Verify backend is online: https://portal-t795.onrender.com/api/health
2. Check 2FA display page: https://portal-t795.onrender.com/2fa
3. Verify network connectivity
4. Check browser console for errors

### If MongoDB Connection Fails
1. Verify connection string in `backend/db.js`
2. Check MongoDB Atlas cluster status
3. Verify IP whitelist allows server IP
4. Check network connectivity
5. Review MongoDB logs

## Rollback Plan

If issues occur:
1. Revert to previous commit: `git revert HEAD`
2. Rebuild frontend: `npm run build`
3. Redeploy backend
4. Test basic functionality
5. Notify users of temporary service disruption

## Success Criteria

✅ All checklist items completed
✅ No console errors
✅ Service worker loads successfully
✅ 2FA authentication works
✅ MongoDB data persists
✅ Rate limiting prevents abuse
✅ Admin panel secure and accessible
✅ Analytics data accurate

## Support Contacts

- Backend URL: https://portal-t795.onrender.com
- 2FA Display: https://portal-t795.onrender.com/2fa
- MongoDB Cluster: cluster0.fh6dmbp.mongodb.net
- Admin Panel: /spec-ops
