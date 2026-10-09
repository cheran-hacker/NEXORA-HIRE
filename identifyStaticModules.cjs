const fs = require('fs');
const path = require('path');

const files = [
  'alumni/Donations.jsx',
  'community/Contests.jsx',
  'community/Forum.jsx',
  'community/Hackathons.jsx',
  'recruiter/Dashboard.jsx',
  'shared/Events.jsx',
  'student/BountyBoard.jsx',
  'student/ClubsDirectory.jsx',
  'student/MatchMaker.jsx',
  'student/MentorshipBooking.jsx',
  'student/Offers.jsx',
  'student/ParkingManager.jsx',
  'student/ScavengerHunt.jsx',
  'student/SkillBadges.jsx',
  'student/SprintBoard.jsx',
  'student/Timetable.jsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, 'apps', 'frontend', 'src', 'pages', filePath);
  let code = fs.readFileSync(fullPath, 'utf8');

  const hasUseEffect = code.includes('useEffect');
  const hasApiImport = code.includes('services/api') || code.includes('axios');
  
  if (!hasUseEffect || !hasApiImport) {
    console.log(`[Static] ${filePath}`);
  } else {
    console.log(`[API-Driven with Mock Fallbacks] ${filePath}`);
  }
});
