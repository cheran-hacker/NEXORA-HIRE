import { geminiService } from '../../../services/geminiService.js';
import AppError from '../../../core/errors/AppError.js';

/**
 * Generates interview questions based on job role, skills, and interview mode.
 */
export const generateInterviewQuestions = async (jobRole, skills, mode = 'Technical', count = 5) => {
  try {
    const prompt = `You are an expert Technical Interviewer and HR Manager.
Generate ${count} interview questions for a candidate applying for the role of "${jobRole}".
The candidate's core skills are: ${skills.join(', ')}.
The interview mode is: "${mode}" (e.g., Technical, HR, Behavioral).
Return ONLY a JSON array of objects with the following structure:
[
  {
    "question": "The interview question",
    "difficulty": "Easy|Medium|Hard",
    "expectedTopics": ["topic1", "topic2"]
  }
]`;

    return await geminiService.generateJsonContent(prompt);
  } catch (error) {
    console.error('Interview Generation Error:', error.message);
    if (error.message.includes('not configured') || error.message.includes('authentication failed')) {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to generate interview questions', 500);
  }
};

/**
 * Evaluates an interview answer provided by the candidate.
 */
export const evaluateAnswer = async (question, answer) => {
  try {
    const prompt = `You are evaluating a candidate's answer to an interview question.
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer and return strictly JSON:
{
  "score": Number (0-100),
  "feedback": "Detailed feedback on what was good and what was missing",
  "confidenceScore": Number (0-100),
  "idealAnswerSnippet": "A short snippet of how an ideal answer would start or cover"
}`;

    return await geminiService.generateJsonContent(prompt);
  } catch (error) {
    console.error('Answer Evaluation Error:', error.message);
    if (error.message.includes('not configured') || error.message.includes('authentication failed')) {
      throw new AppError(error.message, 400);
    }
    throw new AppError('Failed to evaluate interview answer', 500);
  }
};
