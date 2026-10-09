const fs = require('fs');

let code = fs.readFileSync('src/app/App.jsx', 'utf8');

// Revert React.lazy
code = code.replace(/const\s+(\w+)\s+=\s+React\.lazy\(\(\)\s*=>\s*import\(['"](\.\.\/pages\/[^'"]+)['"]\)\);/g, "import $1 from '$2';");

// Revert Suspense
code = code.replace(/<React\.Suspense fallback={<GlobalLoader \/>}>\s*(<Routes>[\s\S]*?<\/Routes>)\s*<\/React\.Suspense>/g, "$1");

// Remove Suspense from import
code = code.replace("import React, { useState, useEffect, Suspense } from 'react';", "import React, { useState, useEffect } from 'react';");
code = code.replace("import GlobalLoader from '../components/common/GlobalLoader.jsx';", "");

fs.writeFileSync('src/app/App.jsx', code);
console.log('App.jsx reverted successfully.');
