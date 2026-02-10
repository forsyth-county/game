const fs = require('fs');
const path = require('path');

// Get the correct paths for CI environment
const projectRoot = process.cwd();
const shutdownNoticePath = path.join(projectRoot, 'public/shutdown-notice.html');
const indexPath = path.join(projectRoot, 'public/index.html');

console.log('🚀 Initiating GitHub Pages shutdown...');
console.log('📁 Project root:', projectRoot);
console.log('📄 Shutdown notice path:', shutdownNoticePath);
console.log('📄 Index path:', indexPath);

try {
  // Read the shutdown notice
  const shutdownNotice = fs.readFileSync(shutdownNoticePath, 'utf8');
  
  // Write it as the new index.html
  fs.writeFileSync(indexPath, shutdownNotice);
  
  console.log('✅ GitHub Pages index.html replaced with shutdown notice');
  console.log('🌐 New tab will open: https://forsyth.onrender.com');
  console.log('📋 Next deployment will activate the shutdown');
} catch (error) {
  console.error('❌ Error replacing index.html:', error.message);
  process.exit(1);
}
