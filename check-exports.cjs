const fs = require('fs');
const path = require('path');
const routesDir = path.join(process.cwd(), 'apps/backend/src/routes');

const files = fs.readdirSync(routesDir);
let errors = 0;
files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importedFunctions = match[1].split(',').map(s => s.trim());
    const importPath = match[2];
    if (importPath.includes('../controllers/')) {
      const controllerPath = path.join(routesDir, importPath);
      if (fs.existsSync(controllerPath)) {
        const controllerContent = fs.readFileSync(controllerPath, 'utf8');
        importedFunctions.forEach(fn => {
          if (!controllerContent.includes('export const ' + fn) && 
              !controllerContent.includes('export async function ' + fn) && 
              !controllerContent.includes('export function ' + fn)) {
            console.log('MISSING EXPORT: ' + fn + ' in ' + importPath + ' (used by ' + file + ')');
            errors++;
          }
        });
      }
    }
  }
});
if (errors === 0) console.log('All exports are valid!');
