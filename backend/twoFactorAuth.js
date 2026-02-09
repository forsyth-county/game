const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Hard-coded secret for the 2FA system (in production, this should be per-user and stored securely)
const SECRET = speakeasy.generateSecret({
  name: 'Forsyth Portal Admin',
  length: 32
});

// Store the base32 secret for consistency
const BASE32_SECRET = SECRET.base32;

/**
 * Generate a new TOTP code
 * @returns {string} 6-digit code
 */
function generateCode() {
  const token = speakeasy.totp({
    secret: BASE32_SECRET,
    encoding: 'base32',
    step: 30 // 30 seconds
  });
  return token;
}

/**
 * Verify a TOTP code
 * @param {string} token - The code to verify
 * @returns {boolean} True if valid
 */
function verifyCode(token) {
  const verified = speakeasy.totp.verify({
    secret: BASE32_SECRET,
    encoding: 'base32',
    token: token,
    step: 30,
    window: 1 // Allow 1 step before/after for clock drift
  });
  return verified;
}

/**
 * Get the current code and time remaining
 * @returns {object} Code and seconds remaining
 */
function getCurrentCode() {
  const code = generateCode();
  const now = Math.floor(Date.now() / 1000);
  const step = 30;
  const secondsRemaining = step - (now % step);
  
  return {
    code,
    secondsRemaining,
    expiresAt: Date.now() + (secondsRemaining * 1000)
  };
}

/**
 * Generate QR code for authenticator apps
 * @returns {Promise<string>} Data URL of QR code
 */
async function generateQRCode() {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: BASE32_SECRET,
    label: 'Forsyth Portal Admin',
    issuer: 'Forsyth County Portal',
    encoding: 'base32'
  });
  
  const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
  return qrCodeDataUrl;
}

/**
 * Get the secret for manual entry
 * @returns {string} Base32 secret
 */
function getSecret() {
  return BASE32_SECRET;
}

module.exports = {
  generateCode,
  verifyCode,
  getCurrentCode,
  generateQRCode,
  getSecret
};
