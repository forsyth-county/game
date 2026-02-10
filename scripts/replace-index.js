const fs = require('fs');
const path = require('path');

// Read the shutdown notice
const shutdownNotice = fs.readFileSync(path.join(__dirname, '../public/shutdown-notice.html'), 'utf8');

// Write it as the new index.html
fs.writeFileSync(path.join(__dirname, '../public/index.html'), shutdownNotice);

console.log('✅ Index.html replaced with shutdown notice');
console.log('🚀 Users will be redirected to forsyth.onrender.com');
