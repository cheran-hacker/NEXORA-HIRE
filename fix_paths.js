import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendSrcDir = path.join(__dirname, 'apps/backend/src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /['"](\.\.\/)*packages\/(shared-[^'"]+)['"]/g;
      let match;
      let newContent = content;
      let modified = false;

      while ((match = regex.exec(content)) !== null) {
         const packageSubPath = match[2];
         const targetPath = path.join(__dirname, 'packages', packageSubPath);
         let relPath = path.relative(path.dirname(fullPath), targetPath).replace(/\\/g, '/');
         if (!relPath.startsWith('.')) relPath = './' + relPath;
         
         newContent = newContent.replace(match[0], `'${relPath}'`);
         modified = true;
         console.log(`Updated ${fullPath} to use ${relPath}`);
      }

      if (modified) {
         fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir(backendSrcDir);
