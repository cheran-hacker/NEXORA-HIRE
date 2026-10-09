import fs from 'fs';
import path from 'path';

const SRC_DIR = 'c:/Users/chera/Downloads/Desktop/NEXORA-HIRE/apps/frontend/src';

const regexReplacements = [
  { pattern: /bg-white/g, replacement: 'bg-card' },
  { pattern: /text-dark/g, replacement: 'text-foreground' },
  { pattern: /text-black/g, replacement: 'text-foreground' },
  { pattern: /text-gray-800/g, replacement: 'text-foreground' },
  { pattern: /text-gray-900/g, replacement: 'text-foreground' },
  { pattern: /text-gray-500/g, replacement: 'text-muted-foreground' },
  { pattern: /text-gray-600/g, replacement: 'text-muted-foreground' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      
      for (const { pattern, replacement } of regexReplacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log('Finished UI color replacements.');
