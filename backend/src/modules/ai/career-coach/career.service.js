import { geminiService } from '../../../services/geminiService.js';
import AppError from '../../../core/errors/AppError.js';

export const generateCareerRoadmap = async (targetRole, currentSkills, timeFrame = '6 months') => {
  try {
    const prompt = `You are an expert Career Coach and Tech Mentor.
Generate a structured learning and career roadmap for a user whose target role is "${targetRole}".
Their current skills are: ${currentSkills.join(', ')}.
The timeframe to achieve this goal is: ${timeFrame}.

Return ONLY a JSON array representing milestones. Schema:
[
  {
    "month": "Month 1",
    "focusArea": "Core Concepts",
    "skillsToLearn": ["Skill 1", "Skill 2"],
    "actionItems": ["Action 1", "Action 2"]
  }
]`;

    return await geminiService.generateJsonContent(prompt);
  } catch (error) {
    console.error('Career Roadmap Generation Error:', error.message);
    if (error.message.includes('not configured') || error.message.includes('authentication failed')) {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to generate career roadmap', 500);
  }
};

export const analyzeSkillGap = async (targetCompany, targetRole, userResume) => {
  try {
    const prompt = `You are an expert HR Analyst at ${targetCompany}.
Analyze the user's resume against the standard requirements for a "${targetRole}" at ${targetCompany}.

User Resume Text:
${userResume}

Return ONLY a JSON object. Schema:
{
  "matchPercentage": Number,
  "missingCoreSkills": ["Skill 1"],
  "recommendedCertifications": ["Cert 1"],
  "resumeEnhancementTips": ["Tip 1"]
}`;

    return await geminiService.generateJsonContent(prompt);
  } catch (error) {
    console.error('Skill Gap Analysis Error:', error.message);
    if (error.message.includes('not configured') || error.message.includes('authentication failed')) {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to analyze skill gap', 500);
  }
};
