import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendSrcDir = path.join(__dirname, 'apps/backend/src');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      const regex = /mongoose\.model\(['"]([^'"]+)['"]\s*,/g;
      const newContent = content.replace(regex, (match, modelName) => {
         if (content.includes(`mongoose.models.${modelName} ||`)) return match;
         if (content.includes(`mongoose.models['${modelName}'] ||`)) return match;
         modified = true;
         return `mongoose.models.${modelName} || ${match}`;
      });

      if (modified) {
         fs.writeFileSync(fullPath, newContent);
         console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(backendSrcDir);
