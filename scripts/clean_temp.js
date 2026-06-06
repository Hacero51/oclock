const fs = require('fs');
const path = require('path');

const files = [
  "app/debug-soto/page.tsx",
  "app/test-route/route.ts",
  "app/api/auth-debug/route.ts",
  "app/api/auth/debug-soto/route.ts",
  "debug_output.json",
  "soto.json",
  "soto_error.json",
  "scripts/test_agustin.js"
];

const dirs = [
  "app/debug-soto",
  "app/test-route",
  "app/api/auth-debug"
];

console.log("🧹 Starting temporary files cleanup...");

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted file: ${file}`);
    } catch (e) {
      console.error(`❌ Error deleting file ${file}:`, e.message);
    }
  }
});

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmdirSync(fullPath);
      console.log(`✅ Deleted folder: ${dir}`);
    } catch (e) {
      console.error(`❌ Error deleting folder ${dir}:`, e.message);
    }
  }
});

console.log("✨ Cleanup completed successfully.");
