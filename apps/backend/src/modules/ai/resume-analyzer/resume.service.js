import { geminiService } from '../../../services/geminiService.js';
import AppError from '../../../core/errors/AppError.js';

/**
 * Analyzes parsed resume text using Gemini to extract structured data
 * and calculate ATS scores against an optional job description.
 */
export const analyzeResume = async (resumeText, jobDescription = null) => {
  try {
    const prompt = `You are an expert AI Resume Analyzer and ATS (Applicant Tracking System).
Your task is to analyze the provided resume text. If a job description is provided, calculate the ATS score against it.
Extract skills, identify missing skills, and provide actionable feedback.
IMPORTANT: If the provided text is clearly NOT a resume (e.g. an error log, code snippet, or gibberish), you MUST still return the JSON schema but with an atsScore of 0 and a suggestion explaining that the input is invalid.

Return the response strictly as a JSON object with the following schema:
{
  "atsScore": Number (0-100),
  "extractedSkills": [String],
  "missingSkills": [String],
  "experienceLevel": String (e.g., "Entry", "Mid", "Senior", "N/A"),
  "heatmap": {
    "impact": Number (0-100),
    "brevity": Number (0-100),
    "style": Number (0-100)
  },
  "suggestions": [String]
}

Resume Text:
${resumeText}

${jobDescription ? `Target Job Description:\n${jobDescription}` : 'No specific job description provided. Evaluate against general industry standards for the inferred role.'}
`;

    return await geminiService.generateJsonContent(prompt);
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    if (error.message.includes('not configured') || error.message.includes('authentication failed')) {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to analyze resume with AI', 500);
  }
};
