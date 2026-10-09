const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'frontend', 'src', 'pages');
let filesWithDummyData = [];

function scanDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for common dummy data patterns
      const hasDummyComment = content.toLowerCase().includes('dummy data') || content.toLowerCase().includes('mock data');
      const hasHardcodedId = content.includes("_id: '1'") || content.includes('id: 1') || content.includes('_id: "1"');
      const hasFallbackArray = content.match(/res\.data\.data\.length === 0\s*\)\s*\{\s*set[A-Z]\w*\(\s*\[/);

      if (hasDummyComment || hasHardcodedId || hasFallbackArray) {
        filesWithDummyData.push(fullPath.replace(path.join(__dirname, 'apps', 'frontend', 'src', 'pages') + path.sep, ''));
      }
    }
  }
}

scanDirectory(srcDir);
console.log(`Found ${filesWithDummyData.length} files with potential dummy data fallbacks:`);
filesWithDummyData.forEach(f => console.log('- ' + f));
