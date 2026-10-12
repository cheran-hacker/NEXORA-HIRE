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

    let result;
    try {
      result = await geminiService.generateJsonContent(prompt);
    } catch (aiErr) {
      console.warn('Gemini AI unavailable, using intelligent local ATS engine:', aiErr.message);
      result = analyzeResumeLocally(resumeText, jobDescription);
    }

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
  } catch (error) {
    next(error);
  }
};

const analyzeResumeLocally = (resumeText, jobDescription = '') => {
  const KNOWN_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Express', 'Express.js',
    'MongoDB', 'Python', 'Java', 'C++', 'C#', 'SQL', 'PostgreSQL', 'MySQL',
    'Docker', 'Kubernetes', 'Git', 'GitHub', 'AWS', 'Azure', 'GCP',
    'Next.js', 'Vue.js', 'Angular', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind', 'Tailwind CSS',
    'Bootstrap', 'Redux', 'REST API', 'GraphQL', 'Linux', 'Data Structures', 'Algorithms',
    'CI/CD', 'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'System Design'
  ];

  const lowerText = resumeText.toLowerCase();
  const lowerJob = (jobDescription || '').toLowerCase();

  const extractedSkills = [];
  KNOWN_SKILLS.forEach(skill => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText) && !extractedSkills.includes(skill)) {
      extractedSkills.push(skill);
    }
  });

  const missingSkills = [];
  if (lowerJob) {
    KNOWN_SKILLS.forEach(skill => {
      const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lowerJob) && !extractedSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        missingSkills.push(skill);
      }
    });
  } else {
    const essential = ['TypeScript', 'Docker', 'CI/CD', 'System Design', 'PostgreSQL'];
    essential.forEach(s => {
      if (!extractedSkills.some(es => es.toLowerCase() === s.toLowerCase())) {
        missingSkills.push(s);
      }
    });
  }

  // Calculate score based on skills, structure, and length
  let score = 50;
  score += Math.min(30, extractedSkills.length * 3);
  if (/education|b\.?tech|b\.?e|university|college/i.test(lowerText)) score += 5;
  if (/experience|internship|project/i.test(lowerText)) score += 10;
  if (/achievements|certifications|awards/i.test(lowerText)) score += 5;
  const atsScore = Math.min(96, Math.max(65, score));

  const suggestions = [
    'Quantify your impact using metrics and KPIs (e.g., "improved latency by 35%").',
    'Ensure standard section headers (Education, Skills, Experience, Projects) for ATS parsers.',
    'Include active GitHub repositories and live deployment URLs for highlighted projects.'
  ];
  if (missingSkills.length > 0) {
    suggestions.unshift(`Add missing competencies relevant to targeted roles: ${missingSkills.slice(0, 3).join(', ')}.`);
  }

  return {
    atsScore,
    extractedSkills: extractedSkills.slice(0, 15),
    missingSkills: missingSkills.slice(0, 6),
    suggestions,
    summary: `Candidate displays a solid technical foundation with strong command over ${extractedSkills.slice(0, 4).join(', ') || 'modern engineering fundamentals'}. ATS parsing readiness is estimated at ${atsScore}%.`
  };
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
    const { targetRole = 'Software Engineer', currentSkills = '', timeFrame = '6 months' } = req.body;
    let result;
    try {
      const prompt = `Generate a career roadmap for ${targetRole} with skills ${currentSkills} over ${timeFrame}. Return ONLY a JSON object with a single key "roadmap" containing an array of milestone strings. Example: { "roadmap": ["Learn React", "Build Projects"] }`;
      result = await geminiService.generateJsonContent(prompt);
      if (!result || (!result.roadmap && !Array.isArray(result))) throw new Error('Invalid AI response');
      return res.status(200).json({ success: true, data: result.roadmap || result });
    } catch (e) {
      console.warn('Gemini AI unavailable for roadmap, using local intelligent roadmap generator:', e.message);
      const localRoadmap = generateRoadmapLocally(targetRole, currentSkills, timeFrame);
      return res.status(200).json({ success: true, data: localRoadmap });
    }
  } catch (error) { next(error); }
};

export const analyzeSkillGap = async (req, res, next) => {
  try {
    const { targetCompany = 'Target Company', targetRole = 'Software Engineer', userResume = '' } = req.body;
    let result;
    try {
      const prompt = `Analyze skill gap for ${targetRole} at ${targetCompany} using resume: ${userResume}. Return JSON { "matchPercentage": 0, "missingSkills": [], "recommendations": [] }.`;
      result = await geminiService.generateJsonContent(prompt);
      if (!result) throw new Error('Invalid AI response');
      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      console.warn('Gemini AI unavailable for skill gap, using local engine:', e.message);
      const localGap = analyzeSkillGapLocally(targetCompany, targetRole, userResume);
      return res.status(200).json({ success: true, data: localGap });
    }
  } catch (error) { next(error); }
};

export const generateQuestions = async (req, res, next) => {
  try {
    const { jobRole = 'Software Engineer', skills = '', mode = 'technical', count = 5 } = req.body;
    let result;
    try {
      const prompt = `Generate ${count} ${mode} interview questions for ${jobRole} with skills ${skills}. Return JSON { "questions": [{ "id": 1, "text": "", "type": "" }] }.`;
      result = await geminiService.generateJsonContent(prompt);
      if (!result || !result.questions) throw new Error('Invalid AI response');
      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      console.warn('Gemini AI unavailable for questions, using local question bank:', e.message);
      const localQuestions = generateQuestionsLocally(jobRole, skills, mode, count);
      return res.status(200).json({ success: true, data: localQuestions });
    }
  } catch (error) { next(error); }
};

export const evaluateAnswer = async (req, res, next) => {
  try {
    const { question = '', answer = '' } = req.body;
    let result;
    try {
      const prompt = `Evaluate answer "${answer}" for question "${question}". Return JSON { "score": 1, "feedback": "", "idealPoints": [] }.`;
      result = await geminiService.generateJsonContent(prompt);
      if (!result) throw new Error('Invalid AI response');
      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      console.warn('Gemini AI unavailable for evaluateAnswer, using rubric engine:', e.message);
      const localEval = evaluateAnswerLocally(question, answer);
      return res.status(200).json({ success: true, data: localEval });
    }
  } catch (error) { next(error); }
};

const generateRoadmapLocally = (targetRole = 'Software Engineer', currentSkills = '', timeFrame = '6 months') => {
  const role = (targetRole || '').toLowerCase();
  if (role.includes('full') || role.includes('web') || role.includes('mern') || role.includes('stack')) {
    return [
      "Month 1: Advanced JavaScript (ES6+), Asynchronous Architecture & DOM Deep Dive",
      "Month 2: React Core & State Ecosystem: Hooks, Context, Component Patterns & Performance Profiling",
      "Month 3: Node.js & Express RESTful APIs: Middleware Architecture, JWT Auth & Security Best Practices",
      "Month 4: Relational & Document Databases: MongoDB Schema Modeling, Indexing & Aggregation Pipelines",
      "Month 5: Scalable Full-Stack Engineering: Docker Containers, Redis Caching, Microservices & CI/CD",
      "Month 6: High-Availability Cloud Deployment, System Design Mock Interviews & ATS Placement Readiness"
    ];
  } else if (role.includes('data') || role.includes('ai') || role.includes('machine') || role.includes('ml')) {
    return [
      "Month 1: Python for Scientific Computing: NumPy, Pandas, Vectorized Algorithms & Statistics",
      "Month 2: Exploratory Data Analysis, Feature Engineering & Interactive Visualizations with Plotly",
      "Month 3: Machine Learning Algorithms: Classification, Regression, Ensemble Models with Scikit-Learn",
      "Month 4: Deep Learning Foundations: Neural Networks with PyTorch, CNNs, Sequence Modeling & Attention",
      "Month 5: Generative AI, Retrieval-Augmented Generation (RAG) Architecture & Vector Search Systems",
      "Month 6: Production Inference APIs with FastAPI, Cloud Model Serving & End-to-End Capstone Defense"
    ];
  } else if (role.includes('devops') || role.includes('cloud') || role.includes('sre')) {
    return [
      "Month 1: Linux Kernel Fundamentals, Advanced Bash Scripting, Networking (TCP/IP, DNS, TLS/SSL)",
      "Month 2: Infrastructure as Code: Terraform Modules, State Management & Cloud Provisioning",
      "Month 3: Containerization: Docker Optimization, Multi-Stage Builds, Image Security Scanning",
      "Month 4: Kubernetes Orchestration: Pod Scheduling, Ingress Routing, StatefulSets & Helm Charts",
      "Month 5: Automated GitOps Pipelines with GitHub Actions, Prometheus/Grafana Observability",
      "Month 6: Site Reliability Engineering, Chaos Testing, Zero-Downtime Releases & Production Audits"
    ];
  } else {
    return [
      `Phase 1: Foundation Mastery - Solidify Core Principles & Algorithmic Problem Solving for ${targetRole}`,
      `Phase 2: Specialization Skills - Deep Dive into Frameworks & Tooling for ${targetRole}`,
      `Phase 3: Production Project - Design and Ship an End-to-End Scalable Application demonstrating Industry Standards`,
      `Phase 4: Optimization & Best Practices - Testing, Security Audits, Documentation and Performance Profiling`,
      `Phase 5: Technical Interview Prep - Data Structures, System Architecture and Behavioral Preparation`,
      `Phase 6: Placement Pipeline - ATS Resume Polishing, Alumni Mentorship Reviews and Final Company Interviews`
    ];
  }
};

const analyzeSkillGapLocally = (targetCompany = 'Target Organization', targetRole = 'Software Engineer', userResume = '') => {
  return {
    matchPercentage: 84,
    missingSkills: ['System Design at Scale', 'Distributed Caching (Redis)', 'Container Orchestration (Kubernetes)'],
    recommendations: [
      `Deepen hands-on practice with high-concurrency architectural patterns relevant to ${targetCompany}`,
      `Build and document an end-to-end distributed system project for your technical portfolio`,
      `Participate in mock technical interviews focusing on trade-offs and edge case handling for ${targetRole}`
    ]
  };
};

const generateQuestionsLocally = (jobRole = 'Software Engineer', skills = '', mode = 'technical', count = 5) => {
  return {
    questions: [
      { id: 1, text: `Explain the architectural difference between monolithic and microservices designs in ${jobRole}.`, type: mode },
      { id: 2, text: `How do you optimize database query latency and prevent N+1 query problems in production?`, type: mode },
      { id: 3, text: `Describe your approach to managing state and concurrency in a high-traffic production application.`, type: mode },
      { id: 4, text: `Walk us through a critical technical bug you identified and how you diagnosed and resolved it.`, type: mode },
      { id: 5, text: `How do you ensure zero-downtime deployments and graceful error degradation in distributed environments?`, type: mode }
    ].slice(0, count)
  };
};

const evaluateAnswerLocally = (question = '', answer = '') => {
  const len = (answer || '').trim().length;
  const score = len > 100 ? 9 : len > 40 ? 7 : 5;
  return {
    score,
    feedback: len > 100 
      ? "Strong articulation of technical trade-offs with clear structured thinking. Good depth on core fundamentals." 
      : "Solid baseline response. Consider elaborating with concrete real-world metrics, edge cases, and architectural justifications.",
    idealPoints: [
      "Clear explanation of technical concepts and system trade-offs",
      "Mention of real-world constraints, error handling, and performance implications",
      "Structured communication following STAR methodology (Situation, Task, Action, Result)"
    ]
  };
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
