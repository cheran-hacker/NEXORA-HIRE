const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, 'apps/frontend/src/layouts');

const layouts = [
  { file: 'AdminLayout.jsx', role: 'Admin' },
  { file: 'AlumniLayout.jsx', role: 'Alumni' },
  { file: 'FacultyLayout.jsx', role: 'Faculty' },
  { file: 'PlacementLayout.jsx', role: 'Placement' },
  { file: 'RecruiterLayout.jsx', role: 'Recruiter' },
  { file: 'StudentLayout.jsx', role: 'Student' },
];

layouts.forEach(layout => {
  const filePath = path.join(layoutsDir, layout.file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${layout.file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Navigate if missing
  if (content.includes('import { Outlet, useLocation } from \'react-router-dom\';')) {
    content = content.replace('import { Outlet, useLocation } from \'react-router-dom\';', 'import { Outlet, useLocation, Navigate } from \'react-router-dom\';');
  } else if (!content.includes('Navigate')) {
    content = content.replace(/import \{.*?\} from 'react-router-dom';/, match => match.replace('}', ', Navigate }'));
  }
  
  // Add useAuth if missing
  if (!content.includes('useAuth')) {
    content = content.replace(/import \{ Outlet.*?\} from 'react-router-dom';/, match => match + `\nimport { useAuth } from '../context/AuthContext';`);
  }
  
  // Add RBAC logic
  if (!content.includes('const { user, loading } = useAuth();')) {
    const rbacLogic = `
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== '${layout.role}' && user.role !== 'Admin') return <Navigate to="/login" replace />;
`;
    content = content.replace(/export default function \w+\(\) \{/, match => match + rbacLogic);
    
    // Remove mock user: const user = { ... };
    content = content.replace(/const user = \{[^}]+\};\n?/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully refactored: ${layout.file}`);
  } else {
    console.log(`Already refactored: ${layout.file}`);
  }
});
