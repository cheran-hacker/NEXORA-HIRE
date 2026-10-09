import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendSrcDir = path.join(__dirname, 'apps/backend/src/modules');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('restrictTo')) {
         content = content.replace(/import \{ (.*)restrictTo(.*) \} from '([^']+)';/, (match, p1, p2, p3) => {
             // We just want to replace restrictTo with authorize
             // Also replace `../../core/middlewares/auth.js` to `../../middleware/auth.js`
             // But let's just make it simpler.
             return match; // We'll handle imports manually if they are complex, but wait, it's just 'import { protect, restrictTo } from '../../core/middlewares/auth.js';'
         });
         
         content = content.replace(/restrictTo\(/g, 'authorize(');
         content = content.replace(/restrictTo,/g, 'authorize,');
         content = content.replace(/,\s*restrictTo/g, ', authorize');
         content = content.replace(/core\/middlewares\/auth\.js/g, 'middleware/auth.js');
         
         fs.writeFileSync(fullPath, content);
         console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(backendSrcDir);
