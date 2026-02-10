const fs = require('fs');
const path = require('path');

console.log('🚀 Initiating GitHub Pages shutdown...');

// Replace index.html with shutdown notice
const shutdownNotice = fs.readFileSync(path.join(__dirname, 'public/shutdown-notice.html'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'public/index.html'), shutdownNotice);

console.log('✅ GitHub Pages index.html replaced with shutdown notice');
console.log('🌐 New tab will open: https://forsyth.onrender.com');
console.log('📋 Next deployment will activate the shutdown');
