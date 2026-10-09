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
  'student/CampusReels.jsx',
  'student/ClubsDirectory.jsx',
  'student/Grades.jsx',
  'student/HotSeat.jsx',
  'student/IpVault.jsx',
  'student/MatchMaker.jsx',
  'student/MentorshipBooking.jsx',
  'student/NoteDao.jsx',
  'student/Offers.jsx',
  'student/OpenSourceDashboard.jsx',
  'student/ParkingManager.jsx',
  'student/PeerReviews.jsx',
  'student/ScavengerHunt.jsx',
  'student/ScholarshipMatchmaker.jsx',
  'student/SkillBadges.jsx',
  'student/SpotFinder.jsx',
  'student/SprintBoard.jsx',
  'student/StudentAgencies.jsx',
  'student/SyllabusExplorer.jsx',
  'student/Timetable.jsx'
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, 'apps', 'frontend', 'src', 'pages', filePath);
  let code = fs.readFileSync(fullPath, 'utf8');

  // We are looking for something like:
  // if (res.data.data.length === 0) { ... } else { setXYZ(res.data.data); }
  // or if (res.data.data.length === 0) { ... } else { setXYZ(res.data.data || []); }
  // or if (!res.data.data || res.data.data.length === 0) { ... } else { setXYZ(res.data.data); }

  const regex = /if\s*\([^)]*\.length\s*===\s*0[^)]*\)\s*\{/g;
  let match;
  let hasChanges = false;
  
  while ((match = regex.exec(code)) !== null) {
    let startIndex = match.index;
    // Find the state setter variable name inside the else block
    // We expect it to be something like setAgencies(res.data.data)
    let searchArea = code.substring(startIndex, startIndex + 2000); // 2000 chars should cover the if-else block
    let setterMatch = searchArea.match(/else\s*\{\s*(set[a-zA-Z0-9_]+)\(.*?res\.data\.data.*?\);/);
    if (!setterMatch) {
      setterMatch = searchArea.match(/(set[a-zA-Z0-9_]+)\(.*?res\.data\.data.*?\);/); // Sometimes no else block, just returns early?
    }
    
    if (setterMatch) {
      const stateSetter = setterMatch[1];
      
      // Let's do brace counting to find the exact end of the if-else structure
      let i = startIndex;
      while (i < code.length && code[i] !== '{') i++;
      let openBraces = 1;
      i++;
      while (i < code.length && openBraces > 0) {
        if (code[i] === '{') openBraces++;
        if (code[i] === '}') openBraces--;
        i++;
      }
      // i is now at the character after the closing brace of the `if` block.
      // Check if there's an `else` immediately following
      let remaining = code.substring(i);
      let elseMatch = remaining.match(/^\s*else\s*\{/);
      if (elseMatch) {
        let elseStartIndex = i + elseMatch[0].length - 1; // pointing to '{' of else
        let elseOpenBraces = 1;
        let j = elseStartIndex + 1;
        while (j < code.length && elseOpenBraces > 0) {
          if (code[j] === '{') elseOpenBraces++;
          if (code[j] === '}') elseOpenBraces--;
          j++;
        }
        
        // Reconstruct code: replace everything from startIndex to j with `${stateSetter}(res.data.data || []);`
        code = code.substring(0, startIndex) + `${stateSetter}(res.data.data || []);` + code.substring(j);
        regex.lastIndex = 0; // Restart regex search because string length changed
        hasChanges = true;
      } else {
        // Just remove the if block and let the subsequent code run
        code = code.substring(0, startIndex) + code.substring(i);
        regex.lastIndex = 0;
        hasChanges = true;
      }
    }
  }

  // Also remove "// Dummy data for MVP if empty" comments
  code = code.replace(/\/\/.*Dummy data.*/ig, '');
  code = code.replace(/\/\/.*Mock data.*/ig, '');

  if (hasChanges) {
    fs.writeFileSync(fullPath, code, 'utf8');
    console.log(`Processed: ${filePath}`);
  }
}

files.forEach(processFile);
console.log('Finished dummy data stripping.');
