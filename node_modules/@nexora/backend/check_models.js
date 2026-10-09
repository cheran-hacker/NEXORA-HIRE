import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const res = await model.generateContent("hello");
    console.log("Response from gemini-3.6-flash:", res.response.text());
  } catch(e) {
    console.error("gemini-3.6-flash failed:", e.message);
  }
}

checkModels();
