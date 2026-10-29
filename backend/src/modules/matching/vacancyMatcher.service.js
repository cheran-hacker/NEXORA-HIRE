import { User } from '../../models/User.js';

/**
 * Service to intelligently match a new vacancy (ReferralLink) with students based on their Digital Twin skills.
 * Note: In a full implementation, this compares `requiredSkills` against the student's `studentProfile.skills` or `skillBadges`.
 */
export const matchVacancyToStudents = async (referralLink) => {
  try {
    if (!referralLink.requiredSkills || referralLink.requiredSkills.length === 0) {
      return [];
    }

    // Find students whose skills overlap with requiredSkills
    const students = await User.find({ role: 'Student' }).populate('studentProfile');
    
    const matchedStudents = [];

    students.forEach(student => {
      if (student.studentProfile && student.studentProfile.skills) {
        const studentSkills = student.studentProfile.skills;
        
        // Strictly boolean evidence matching - no fake percentages
        const missingSkills = referralLink.requiredSkills.filter(skill => !studentSkills.includes(skill));
        
        if (missingSkills.length === 0) {
          matchedStudents.push({
            studentId: student._id,
            matchStatus: 'Highly Relevant',
            missingSkills: []
          });
        } else if (missingSkills.length <= 2) {
          matchedStudents.push({
            studentId: student._id,
            matchStatus: 'Potentially Relevant',
            missingSkills
          });
        }
      }
    });

    // In a real system, we would trigger notifications here.
    return matchedStudents;
  } catch (error) {
    console.error("Error matching vacancy to students:", error);
    return [];
  }
};
