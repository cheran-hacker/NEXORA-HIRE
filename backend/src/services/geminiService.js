import { GoogleGenerativeAI } from '@google/generative-ai';

// Store singleton instance
let genAI = null;

/**
 * Initializes and returns the Gemini client if configured.
 * Throws a specific configuration error if the API key is missing.
 */
const getClient = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '' || process.env.GEMINI_API_KEY === 'dummy_key') {
    throw new Error('Gemini AI is not configured. Please configure GEMINI_API_KEY on the backend.');
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  
  return genAI;
};

/**
 * Robust JSON parser: handles markdown code fences from AI responses.
 */
const parseAIJson = (rawText) => {
  let text = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Find the first { or [
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = text.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = text.lastIndexOf(']');
  }

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('AI did not return valid JSON. Please try again.');
  }

  const jsonString = text.substring(startIdx, endIdx + 1);
  return JSON.parse(jsonString);
};

export const geminiService = {
  /**
   * Generates content and safely parses it as JSON.
   */
  async generateJsonContent(prompt, modelName = 'gemini-1.5-flash') {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      return parseAIJson(response.response.text());
    } catch (error) {
      this.handleError(error);
    }
  },

  /**
   * Generates standard text content.
   */
  async generateTextContent(prompt, modelName = 'gemini-1.5-flash') {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch (error) {
      this.handleError(error);
    }
  },

  /**
   * Starts a conversational chat session with a provided history.
   */
  async startChatSession(history = [], modelName = 'gemini-1.5-flash') {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({ model: modelName });
      
      const chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || msg.text || '' }]
      }));
      
      return model.startChat({ history: chatHistory });
    } catch (error) {
      this.handleError(error);
    }
  },
  
  /**
   * Checks if the Gemini service is configured. 
   * Returns true/false without throwing errors.
   */
  isConfigured() {
    return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key' && process.env.GEMINI_API_KEY.trim() !== '';
  },

  /**
   * Standardized AI error handler to avoid exposing secrets or obscure SDK traces.
   */
  handleError(error) {
    if (error.message.includes('not configured')) {
      // Pass our custom config error directly
      throw error;
    }
    
    console.error('Gemini API Error:', error.message);
    
    if (
      error.status === 403 ||
      error.status === 400 ||
      error.message.includes('API_KEY_INVALID') ||
      error.message.includes('API key not valid') ||
      error.message.includes('API_KEY')
    ) {
      throw new Error('Gemini API authentication failed. Replace GEMINI_API_KEY with a valid Gemini API key.');
    }
    
    if (error.status === 429 || error.message.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please try again later or check your billing plan.');
    }
    
    throw new Error('AI Analysis Failed: ' + error.message);
  }
};
