import { User } from '../models/User.js';
import { AIInterviewSession } from '../models/AIInterviewSession.js';
import { geminiService } from '../services/geminiService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const analyzeResume = async (req, res, next) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = req.body.jobDescription;
    
    if (req.file) {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume text or file is required' });
    }

    const prompt = `
      Act as an expert ATS (Applicant Tracking System) and senior recruiter.
      Analyze the following resume against the job description (if provided).
      
      Resume Text:
      ${resumeText}
      
      Job Description:
      ${jobDescription || 'None provided. Evaluate for general software engineering readiness.'}
      
      Return ONLY a JSON object with the following structure:
      {
        "atsScore": (number 0-100),
        "extractedSkills": [(array of strings)],
        "missingSkills": [(array of strings)],
        "suggestions": [(array of strings for improvement)],
        "summary": (brief paragraph summary of candidate readiness)
      }
    `;

    try {
      const result = await geminiService.generateJsonContent(prompt);

      if (req.user && req.user.role === 'Student') {
        const user = await User.findById(req.user.id);
        if (user && user.studentProfile) {
          // Save ATS score
          user.studentProfile.resumeScore = result.atsScore || 0;

          // Also merge extracted skills into student's profile
          const extractedSkills = Array.isArray(result.extractedSkills) ? result.extractedSkills : [];
          if (extractedSkills.length > 0) {
            const existingSkills = user.studentProfile.skills || [];
            const mergedSet = new Set(existingSkills.map(s => s.toLowerCase().trim()));
            const finalSkills = [...existingSkills];
            for (const skill of extractedSkills) {
              const normalized = skill.toLowerCase().trim();
              if (!mergedSet.has(normalized)) {
                mergedSet.add(normalized);
                finalSkills.push(skill.trim());
              }
            }
            user.studentProfile.skills = finalSkills;
          }

          user.markModified('studentProfile');
          await user.save();
        }
      }

      res.status(200).json({ success: true, data: result });
    } catch (e) {
      // Differentiate config error (400) from other API errors (500)
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) {
    next(error);
  }
};

export const mockInterview = async (req, res, next) => {
  try {
    const { message, history, role } = req.body;
    
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    let interviewRole = role;
    if (!interviewRole && req.user) {
      const user = await User.findById(req.user.id);
      if (user?.studentProfile?.targetCareerRole) {
        interviewRole = user.studentProfile.targetCareerRole;
      }
    }
    interviewRole = interviewRole || 'Software Engineer';

    let chatHistory = history || [];
    if (chatHistory.length === 0) {
      chatHistory.push({
        role: 'user',
        content: `Act as a senior technical recruiter hiring for a ${interviewRole} role. Start the interview by introducing yourself briefly and asking the first question.`
      });
      chatHistory.push({
        role: 'model',
        content: `Hello! I am the senior engineering manager here. Let's get started. Could you walk me through your background and your strongest technical skills?`
      });
    } else if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      // Gemini requires the first message to be from the 'user'
      chatHistory.unshift({
        role: 'user',
        content: `Act as a senior technical recruiter hiring for a ${interviewRole} role. Start the interview by introducing yourself briefly and asking the first question.`
      });
    }

    try {
      const chat = await geminiService.startChatSession(chatHistory);
      const result = await chat.sendMessage(message);
      const responseText = result.response.text();
      
      // Save session if user is logged in
      if (req.user) {
        try {
          const newHistory = [...chatHistory, { role: 'user', content: message }, { role: 'model', content: responseText }];
          
          await AIInterviewSession.findOneAndUpdate(
            { studentId: req.user.id, status: 'In Progress' },
            { 
              targetRole: interviewRole,
              messages: newHistory
            },
            { upsert: true, new: true, sort: { createdAt: -1 } }
          );
        } catch (dbErr) {
          console.error("Failed to save interview session:", dbErr);
        }
      }

      res.status(200).json({ success: true, reply: responseText });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) {
    next(error);
  }
};

export const generateRoadmap = async (req, res, next) => {
  try {
    const { targetRole, currentSkills, timeFrame } = req.body;
    try {
      const prompt = `Generate a career roadmap for ${targetRole} with skills ${currentSkills} over ${timeFrame}. Return ONLY a JSON object with a single key "roadmap" containing an array of milestone strings. Example: { "roadmap": ["Learn React", "Build Projects"] }`;
      const result = await geminiService.generateJsonContent(prompt);
      res.status(200).json({ success: true, data: result.roadmap || result });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) { next(error); }
};

export const analyzeSkillGap = async (req, res, next) => {
  try {
    const { targetCompany, targetRole, userResume } = req.body;
    try {
      const prompt = `Analyze skill gap for ${targetRole} at ${targetCompany} using resume: ${userResume}. Return JSON { "matchPercentage": 0, "missingSkills": [], "recommendations": [] }.`;
      const result = await geminiService.generateJsonContent(prompt);
      res.status(200).json({ success: true, data: result });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) { next(error); }
};

export const generateQuestions = async (req, res, next) => {
  try {
    const { jobRole, skills, mode, count } = req.body;
    try {
      const prompt = `Generate ${count} ${mode} interview questions for ${jobRole} with skills ${skills}. Return JSON { "questions": [{ "id": 1, "text": "", "type": "" }] }.`;
      const result = await geminiService.generateJsonContent(prompt);
      res.status(200).json({ success: true, data: result });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) { next(error); }
};

export const evaluateAnswer = async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    try {
      const prompt = `Evaluate answer "${answer}" for question "${question}". Return JSON { "score": 1, "feedback": "", "idealPoints": [] }.`;
      const result = await geminiService.generateJsonContent(prompt);
      res.status(200).json({ success: true, data: result });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) { next(error); }
};

// @desc    AI-generate MCQ assessment questions
// @route   POST /api/ai/assessment/generate
export const generateAssessmentQuestions = async (req, res, next) => {
  try {
    const { title, topic, difficulty, count = 10 } = req.body;

    if (!title || !topic || !difficulty) {
      return res.status(400).json({ success: false, message: 'title, topic, and difficulty are required.' });
    }

    let pdfText = '';
    if (req.file) {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(req.file.buffer);
      pdfText = pdfData.text.slice(0, 15000); // Limit to ~15k characters to avoid token limits
    }

    const marks = difficulty === 'Hard' ? 4 : difficulty === 'Medium' ? 3 : 2;

    try {
      const pdfSection = pdfText ? ('\nIMPORTANT: Base your questions strictly on the following provided material:\n"' + pdfText + '"\n') : '';
      const prompt = 'You are a JSON API. Generate ' + count + ' multiple-choice quiz questions about "' + topic + '" at ' + difficulty + ' difficulty level for an assessment titled "' + title + '".\n' +
        pdfSection +
        '\nOutput ONLY valid JSON. No explanation. No markdown. No code fences. Start directly with {\n' +
        '\nThe JSON must follow this exact structure with real values (not placeholders):\n' +
        '{"questions":[{"text":"What is a variable in programming?","type":"MCQ","marks":' + marks + ',"options":[{"text":"A fixed value","isCorrect":false},{"text":"A named storage location","isCorrect":true},{"text":"A function call","isCorrect":false},{"text":"A loop","isCorrect":false}]},{"text":"Which keyword declares a constant in JavaScript?","type":"MCQ","marks":' + marks + ',"options":[{"text":"var","isCorrect":false},{"text":"let","isCorrect":false},{"text":"const","isCorrect":true},{"text":"define","isCorrect":false}]}]}\n' +
        '\nNow generate ' + count + ' questions about "' + topic + '". Remember: output ONLY the JSON object, nothing else.';

      // We use gemma-3-27b-it for this typically but mapped it via the service
      const parsed = await geminiService.generateJsonContent(prompt, 'gemini-2.0-flash');

      if (!parsed?.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Invalid question structure from AI');
      }

      // Normalize questions
      const normalized = parsed.questions
        .map((q, idx) => ({
          text: q.text || q.question || ('Question ' + (idx + 1)),
          type: 'MCQ',
          marks: typeof q.marks === 'number' ? q.marks : marks,
          options: Array.isArray(q.options)
            ? q.options.map(o => ({
                text: String(o.text || o.option || o.answer || o),
                isCorrect: o.isCorrect === true || o.correct === true || o.is_correct === true
              }))
            : []
        }))
        .filter(q => q.options.length >= 2 && q.text.length > 3);

      if (normalized.length === 0) throw new Error('All questions malformed');

      // Ensure at least one correct answer per question
      normalized.forEach(q => {
        const hasCorrect = q.options.some(o => o.isCorrect);
        if (!hasCorrect && q.options.length > 0) q.options[0].isCorrect = true;
      });

      return res.status(200).json({ success: true, data: { questions: normalized } });

    } catch (e) {
      console.error('AI Generation Error:', e.message);
      console.error('AI Generation Stack:', e.stack);
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      return res.status(500).json({ success: false, message: 'AI failed to generate assessment questions. Please try again.', debug: e.message });
    }
  } catch (error) {
    console.error('Assessment Generation Error:', error.message);
    next(error);
  }
};

export const generateVerificationRubric = async (req, res, next) => {
  try {
    const { skillName } = req.body;
    if (!skillName) return res.status(400).json({ success: false, message: 'skillName is required' });

    try {
      const prompt = `You are an expert technical interviewer. An alumni needs to verify if a student actually knows "${skillName}". Provide a JSON object with exactly 3 practical criteria they should look for in the student's evidence (like a GitHub repo, certificate, or project).
Return ONLY JSON:
{
  "criteria": [
    "criterion 1",
    "criterion 2",
    "criterion 3"
  ]
}`;
      const result = await geminiService.generateJsonContent(prompt);
      res.status(200).json({ success: true, data: result });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) { next(error); }
};

export const enhanceBounty = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });

    try {
      const prompt = `You are a technical project manager. Expand the following brief bounty idea into a professional task specification for computer science students.
Idea Title: ${title}
Idea Description: ${description || ''}

Return ONLY a JSON object:
{
  "enhancedTitle": "Professional Title",
  "enhancedDescription": "Detailed 2-paragraph description of the problem and expected outcome",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;
      const result = await geminiService.generateJsonContent(prompt);
      res.status(200).json({ success: true, data: result });
    } catch (e) {
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: e.message });
      }
      res.status(500).json({ success: false, message: e.message });
    }
  } catch (error) { next(error); }
};
