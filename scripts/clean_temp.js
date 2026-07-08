const fs = require('fs');
const path = require('path');

const targets = [
  // Directorios vacíos o de depuración
  "__tests__",
  "diagnostics",
  "docs",
  "backups",
  "scratch",
  "app/api/check",
  "app/api/debug-r48",
  "app/api/debug-shift",
  "app/api/debug-soto",
  "app/api/magic-2",
  "app/api/verify-fix",
  "app/api/recalc",

  // Archivos en la raíz
  "check-attendance-types.js",
  "check-shifts.js",
  "debug_output.json",
  "middleware.ts.bak"
];

console.log("🧹 Starting temporary files cleanup...");

targets.forEach(target => {
  const fullPath = path.join(__dirname, '..', target);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${target}`);
    } catch (e) {
      console.error(`❌ Error deleting ${target}:`, e.message);
    }
  }
});

console.log("✨ Cleanup completed successfully.");
