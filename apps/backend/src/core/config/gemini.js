import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Backward-compatible getGenerativeModel for any module that still uses this import path.
 * All primary AI modules should prefer importing geminiService directly.
 */
export const getGenerativeModel = (modelName = 'gemini-2.0-flash') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_key' || apiKey.trim() === '') {
    throw new Error('Gemini AI is not configured. Please configure GEMINI_API_KEY on the backend.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};
