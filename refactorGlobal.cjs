const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'apps/frontend/src/pages/shared/SecurityCenter.jsx',
  'apps/frontend/src/pages/recruiter/CurriculumVoting.jsx',
  'apps/frontend/src/pages/faculty/CurriculumInsights.jsx',
  'apps/frontend/src/pages/alumni/MyBounties.jsx',
  'apps/frontend/src/pages/alumni/AlumniDirectory.jsx'
];

filesToProcess.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes("import toast from 'react-hot-toast';")) {
    console.log('Processing', relPath);

    // 1. Replace import (adjust relative path since some are different depth)
    // Actually, all these are in `pages/X/`, so `../../context/ToastContext` works perfectly.
    content = content.replace(
      "import toast from 'react-hot-toast';",
      "import { useToast } from '../../context/ToastContext';"
    );

    // 2. Inject addToast
    const componentRegex = /const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*\([^)]*\)\s*=>\s*\{/;
    const match = content.match(componentRegex);
    if (match && !content.includes('const { addToast } = useToast();')) {
      const insertIdx = match.index + match[0].length;
      content = content.slice(0, insertIdx) + "\n  const { addToast } = useToast();" + content.slice(insertIdx);
    }

    // 3. Replace toast.success('...')
    content = content.replace(/toast\.success\(([^)]+)\)/g, "addToast($1, 'success')");

    // 4. Replace toast.error('...')
    content = content.replace(/toast\.error\(([^)]+)\)/g, "addToast($1, 'error')");

    // 5. Replace toast('...', { icon: ... })
    content = content.replace(/toast\(([^,]+),\s*\{[^}]+\}\)/g, "addToast($1, 'info')");
    
    // 6. Replace remaining plain toast('...')
    content = content.replace(/toast\(([^)]+)\)/g, "addToast($1, 'info')");

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done global refactoring!');
