import mongoose from 'mongoose';
import { geminiService } from './src/services/geminiService.js';

mongoose.connect('mongodb://127.0.0.1:27017/nexora').then(async () => {
  try {
    console.log('Testing gemini-2.0-flash...');
    const result = await geminiService.generateJsonContent(
      'Generate 2 MCQ questions about JavaScript. Output ONLY valid JSON: {"questions":[{"text":"Q?","type":"MCQ","marks":2,"options":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":false}]}]}'
    );
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
  process.exit(0);
});
