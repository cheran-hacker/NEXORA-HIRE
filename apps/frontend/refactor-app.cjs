const fs = require('fs');

let code = fs.readFileSync('src/app/App.jsx', 'utf8');

// Replace standard imports with React.lazy
code = code.replace(/import\s+(\w+)\s+from\s+['"](\.\.\/pages\/[^'"]+)['"];/g, 'const $1 = React.lazy(() => import(\'$2\'));');

// Add Suspense boundary inside Router
code = code.replace('<Router>', '<Router>\n              <React.Suspense fallback={<GlobalLoader />}>');
code = code.replace('</Router>', '              </React.Suspense>\n            </Router>');

// Update React import to include Suspense and import GlobalLoader
code = code.replace('import React, { useState, useEffect } from \'react\';', 'import React, { useState, useEffect, Suspense } from \'react\';\nimport GlobalLoader from \'../components/common/GlobalLoader.jsx\';');

fs.writeFileSync('src/app/App.jsx', code);
console.log('App.jsx successfully refactored for Lazy Loading!');
