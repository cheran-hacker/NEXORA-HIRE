const fs = require('fs');
const path = require('path');

const files = [
  'admin/Dashboard.jsx',
  'alumni/Donations.jsx',
  'community/Contests.jsx',
  'community/Forum.jsx',
  'community/Hackathons.jsx',
  'faculty/Dashboard.jsx',
  'placement/Dashboard.jsx',
  'recruiter/Dashboard.jsx',
  'shared/Events.jsx',
  'student/ARTour.jsx',
  'student/BountyBoard.jsx',
  'student/ClubsDirectory.jsx',
  'student/Grades.jsx',
  'student/MatchMaker.jsx',
  'student/MentorshipBooking.jsx',
  'student/Offers.jsx',
  'student/ParkingManager.jsx',
  'student/ScavengerHunt.jsx',
  'student/ScholarshipMatchmaker.jsx',
  'student/SkillBadges.jsx',
  'student/SprintBoard.jsx',
  'student/Timetable.jsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, 'apps', 'frontend', 'src', 'pages', filePath);
  let code = fs.readFileSync(fullPath, 'utf8');

  // Find ternary arrays like: stats?.securityAlerts?.length > 0 ? stats.securityAlerts : [ { id: 1, ... } ]
  // We'll replace it with: stats?.securityAlerts?.length > 0 ? stats.securityAlerts : []
  
  // A regex to match: ? (variable) : [ (objects) ]
  // Since objects can have nested braces, we'll manually parse it similar to last time
  let hasChanges = false;

  const regex = /\?\s*([a-zA-Z0-9_\.]+)\s*:\s*\[/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    let startIndex = match.index; // points to ?
    let arrayVar = match[1];
    
    // Find where the array starts
    let openBraces = 1;
    let i = startIndex + match[0].length; // just after the '['
    
    while (i < code.length && openBraces > 0) {
      if (code[i] === '[') openBraces++;
      if (code[i] === ']') openBraces--;
      i++;
    }
    // i is now right after the closing ']'
    
    // Check if the contents actually look like dummy data (contains '{' or 'id')
    let arrayContents = code.substring(startIndex + match[0].length, i - 1);
    if (arrayContents.includes('{')) {
      code = code.substring(0, startIndex) + `? ${arrayVar} : []` + code.substring(i);
      regex.lastIndex = 0;
      hasChanges = true;
    }
  }

  // Find another pattern: setVariable([ { dummy } ]) or setVariable(res.data.data || [ { dummy } ])
  const setRegex = /set[A-Z][a-zA-Z0-9_]*\(\s*\[/g;
  while ((match = setRegex.exec(code)) !== null) {
    let i = match.index + match[0].length; // after '['
    let openBraces = 1;
    while (i < code.length && openBraces > 0) {
      if (code[i] === '[') openBraces++;
      if (code[i] === ']') openBraces--;
      i++;
    }
    let arrayContents = code.substring(match.index + match[0].length, i - 1);
    if (arrayContents.includes('{')) {
      code = code.substring(0, match.index + match[0].length - 1) + '[]' + code.substring(i);
      setRegex.lastIndex = 0;
      hasChanges = true;
    }
  }

  // Or res.data.data || [ { dummy } ]
  const orRegex = /\|\|\s*\[/g;
  while ((match = orRegex.exec(code)) !== null) {
    let i = match.index + match[0].length; // after '['
    let openBraces = 1;
    while (i < code.length && openBraces > 0) {
      if (code[i] === '[') openBraces++;
      if (code[i] === ']') openBraces--;
      i++;
    }
    let arrayContents = code.substring(match.index + match[0].length, i - 1);
    if (arrayContents.includes('{')) {
      code = code.substring(0, match.index + match[0].length - 1) + '[]' + code.substring(i);
      orRegex.lastIndex = 0;
      hasChanges = true;
    }
  }

  // Remove `// Dummy data` comments
  let prevCode = code;
  code = code.replace(/\/\/.*Dummy data.*/ig, '');
  code = code.replace(/\/\/.*Mock data.*/ig, '');
  if (code !== prevCode) hasChanges = true;

  if (hasChanges) {
    fs.writeFileSync(fullPath, code, 'utf8');
    console.log(`Processed: ${filePath}`);
  }
});
console.log('Finished secondary strip.');
