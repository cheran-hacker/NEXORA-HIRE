/**
 * Calculates a dynamic Readiness Score for a student out of 100
 * based on profile completeness, assessments, and learning activity.
 */
export const calculateReadinessScore = (studentProfile, stats) => {
  let score = 0;

  // 1. Profile Completeness (Max 30 points)
  if (studentProfile) {
    if (studentProfile.skills && studentProfile.skills.length >= 3) score += 10;
    else if (studentProfile.skills && studentProfile.skills.length > 0) score += 5;

    if (studentProfile.cgpa) score += 5;
    
    if (studentProfile.projects && studentProfile.projects.length > 0) score += 10;
    
    if (studentProfile.resumeUrl) score += 5;
  }

  // 2. Assessment Performance (Max 40 points)
  // Each assessment gives 10 points (capping at 40)
  if (stats.assessmentsTaken > 0) {
    score += Math.min(stats.assessmentsTaken * 10, 40);
  }

  // 3. Learning & Certifications (Max 30 points)
  // Each badge/cert gives 10 points (capping at 30)
  const learningCount = (stats.badgesCount || 0) + (stats.certificatesCount || 0);
  if (learningCount > 0) {
    score += Math.min(learningCount * 10, 30);
  }

  return Math.min(score, 100);
};
