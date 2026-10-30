import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { User } from './src/models/User.js';
import { Job } from './src/models/Job.js';
import { Application } from './src/models/Application.js';
import { Bounty } from './src/models/Bounty.js';
import { Post } from './src/models/Post.js';
import { Assessment } from './src/models/Assessment.js';
import { Submission } from './src/models/Submission.js';
import { MentorshipSession } from './src/models/MentorshipSession.js';
import { MentorshipRequest } from './src/models/MentorshipRequest.js';
import { MentorAvailability } from './src/models/MentorAvailability.js';
import { CareerRoadmap } from './src/models/CareerRoadmap.js';
import { CareerTarget } from './src/models/CareerTarget.js';
import { RoleSkillMap } from './src/models/RoleSkillMap.js';
import { SkillBadge } from './src/models/SkillBadge.js';
import { Certificate } from './src/models/Certificate.js';
import { Notification } from './src/models/Notification.js';
import { AuditLog } from './src/models/AuditLog.js';
import { SkillValidationRequest } from './src/models/SkillValidationRequest.js';
import { AlumniConnection } from './src/models/AlumniConnection.js';
import { Announcement } from './src/models/Announcement.js';
import { HiringDrive } from './src/models/HiringDrive.js';
import { Scholarship } from './src/models/Scholarship.js';
import { HackathonEvent } from './src/models/HackathonEvent.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

export const runSafeDemoSeed = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';
  console.log('🔄 Connecting to MongoDB at:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
  console.log('✅ Connected to MongoDB. Starting safe, non-destructive demo seeding...');

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);
  const adminPassword = await bcrypt.hash('cheran@2006', salt);

  // Helper for upserting users safely without overwriting password if user exists
  const upsertUser = async (filter, data, isDefaultAdmin = false) => {
    const existing = await User.findOne(filter);
    if (existing) {
      // Preserve existing password, email, and id; update profile info
      const updateData = { ...data };
      delete updateData.password; // Do not overwrite password of existing user
      const updated = await User.findByIdAndUpdate(existing._id, { $set: updateData }, { new: true });
      return updated;
    } else {
      const createData = {
        ...data,
        password: isDefaultAdmin ? adminPassword : defaultPassword,
      };
      return await User.create(createData);
    }
  };

  // ==========================================
  // 1. RECRUITERS & PLACEMENT OFFICERS
  // ==========================================
  console.log('📦 Seeding Placement Officers & Partner Recruiters...');
  const placementHead = await upsertUser(
    { email: 'head@placement.edu' },
    {
      name: 'Dr. Sarah Jenkins',
      email: 'head@placement.edu',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Career & Placement Center',
        designation: 'Director of Career Services',
        phone: '+91 98450 11223',
        companyName: 'NEXORA University Placement Cell',
        companyWebsite: 'https://careers.nexora.edu',
        verified: true
      }
    }
  );

  const recruiterGoogle = await upsertUser(
    { email: 'recruiter@google.com' },
    {
      name: 'Marcus Vance',
      email: 'recruiter@google.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'University Recruiting APAC',
        designation: 'Campus Hiring Lead',
        phone: '+91 80 6721 8000',
        companyName: 'Google',
        companyWebsite: 'https://careers.google.com',
        verified: true
      }
    }
  );

  const recruiterMicrosoft = await upsertUser(
    { email: 'recruiter@microsoft.com' },
    {
      name: 'Anjali Verma',
      email: 'recruiter@microsoft.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Global Talent Acquisition',
        designation: 'Senior Campus Recruiter',
        phone: '+91 80 6787 0000',
        companyName: 'Microsoft',
        companyWebsite: 'https://careers.microsoft.com',
        verified: true
      }
    }
  );

  const recruiterAmazon = await upsertUser(
    { email: 'recruiter@amazon.com' },
    {
      name: 'Vikram Singhania',
      email: 'recruiter@amazon.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Student Programs',
        designation: 'Technical Talent Partner',
        phone: '+91 80 4108 8000',
        companyName: 'Amazon',
        companyWebsite: 'https://amazon.jobs',
        verified: true
      }
    }
  );

  const recruiterAtlassian = await upsertUser(
    { email: 'recruiter@atlassian.com' },
    {
      name: 'Divya Nair',
      email: 'recruiter@atlassian.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Engineering Talent Lead',
        designation: 'Principal Campus Recruiter',
        phone: '+91 80 6744 5000',
        companyName: 'Atlassian',
        companyWebsite: 'https://www.atlassian.com/company/careers',
        verified: true
      }
    }
  );

  const recruiterSwiggy = await upsertUser(
    { email: 'recruiter@swiggy.com' },
    {
      name: 'Kavita Reddy',
      email: 'recruiter@swiggy.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Tech & Product Hiring',
        designation: 'Talent Acquisition Partner',
        phone: '+91 80 4670 6900',
        companyName: 'Swiggy',
        companyWebsite: 'https://careers.swiggy.com',
        verified: true
      }
    }
  );

  const recruiterRazorpay = await upsertUser(
    { email: 'recruiter@razorpay.com' },
    {
      name: 'Rohit Mehra',
      email: 'recruiter@razorpay.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Fintech Engineering Hiring',
        designation: 'Lead University Recruiter',
        phone: '+91 80 4666 9555',
        companyName: 'Razorpay',
        companyWebsite: 'https://razorpay.com/jobs',
        verified: true
      }
    }
  );

  const recruiterCisco = await upsertUser(
    { email: 'recruiter@cisco.com' },
    {
      name: 'Sanjay Gupta',
      email: 'recruiter@cisco.com',
      role: 'Placement',
      status: 'Active',
      placementProfile: {
        department: 'Networking & Security Talent',
        designation: 'Senior Campus Lead',
        phone: '+91 80 4426 0000',
        companyName: 'Cisco',
        companyWebsite: 'https://jobs.cisco.com',
        verified: true
      }
    }
  );

  // ==========================================
  // 2. ALUMNI MENTORS
  // ==========================================
  console.log('🎓 Seeding Alumni Mentors...');
  const alumniRavi = await upsertUser(
    { email: 'ravi.k@alumni.edu' },
    {
      name: 'Ravi Kumar',
      email: 'ravi.k@alumni.edu',
      role: 'Alumni',
      status: 'Active',
      alumniProfile: {
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2021,
        company: 'Google',
        designation: 'Software Engineer II (Frontend Infrastructure)',
        expertise: ['System Design', 'React', 'TypeScript', 'Web Performance', 'Micro-Frontends'],
        rating: 4.9,
        available: true,
        bio: 'SWE II at Google working on core web platforms. Passionate about helping students crack frontend and system design interviews.',
        linkedinUrl: 'https://linkedin.com/in/ravi-kumar-swe',
        githubUrl: 'https://github.com/ravik-google'
      }
    }
  );

  const alumniPriya = await upsertUser(
    { email: 'priya.s@alumni.edu' },
    {
      name: 'Priya Sharma',
      email: 'priya.s@alumni.edu',
      role: 'Alumni',
      status: 'Active',
      alumniProfile: {
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2020,
        company: 'Microsoft',
        designation: 'Senior AI Engineer (Azure Cognitive Services)',
        expertise: ['Python', 'PyTorch', 'Large Language Models', 'Generative AI', 'MLOps'],
        rating: 4.85,
        available: true,
        bio: 'Senior AI Engineer at Microsoft. Mentoring students on transitioning into applied AI and machine learning engineering.',
        linkedinUrl: 'https://linkedin.com/in/priya-sharma-ai',
        githubUrl: 'https://github.com/priyasharma-ai'
      }
    }
  );

  const alumniAravind = await upsertUser(
    { email: 'aravind.n@alumni.edu' },
    {
      name: 'Aravind Nair',
      email: 'aravind.n@alumni.edu',
      role: 'Alumni',
      status: 'Active',
      alumniProfile: {
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2019,
        company: 'Amazon',
        designation: 'Lead Cloud Solutions Architect',
        expertise: ['AWS', 'Distributed Systems', 'Kubernetes', 'Microservices', 'High-Scale Backend'],
        rating: 4.95,
        available: true,
        bio: 'Cloud Architect at AWS. Guiding prospective engineers through cloud architecture certifications and real-world system design.',
        linkedinUrl: 'https://linkedin.com/in/aravind-nair-cloud',
        githubUrl: 'https://github.com/aravindn-cloud'
      }
    }
  );

  const alumniCheranSuresh = await upsertUser(
    { email: 'cheransuresh869@gmail.com' },
    {
      name: 'Cheran Suresh',
      email: 'cheransuresh869@gmail.com',
      role: 'Alumni',
      status: 'Active',
      alumniProfile: {
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2022,
        company: 'Atlassian',
        designation: 'Staff Full Stack Engineer',
        expertise: ['React', 'Node.js', 'System Design', 'Cloud Architecture', 'CI/CD Pipelines'],
        rating: 4.9,
        available: true,
        bio: 'Staff Full Stack Engineer at Atlassian building resilient enterprise collaboration software. Actively mentoring students on career milestones.',
        linkedinUrl: 'https://linkedin.com/in/cheransuresh',
        githubUrl: 'https://github.com/cheransuresh'
      }
    }
  );

  // ==========================================
  // 3. STUDENTS
  // ==========================================
  console.log('🎒 Seeding Students & Enriching Primary Profile...');
  const studentCheran = await upsertUser(
    { email: 'cheran.it23@bitsathy.ac.in' },
    {
      name: 'Cheran S',
      email: 'cheran.it23@bitsathy.ac.in',
      role: 'Student',
      status: 'Active',
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'B.Tech Information Technology',
        department: 'Information Technology',
        batchYear: 2026,
        cgpa: 8.92,
        skills: [
          'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Python',
          'Git', 'AWS', 'Tailwind CSS', 'Java', 'Go', 'React.js', 'MySQL',
          'GitHub', 'HTML', 'CSS', 'Figma', 'Agile', 'System Design'
        ],
        targetCareerRole: 'Full Stack Developer',
        careerTarget: 'Full Stack Developer',
        preferredRoles: 'Full Stack Developer',
        readinessScore: 88,
        resumeScore: 95,
        atsScore: 95,
        resumeUrl: 'Cheran_S_Resume (1).pdf',
        registerNumber: '21BCE1024',
        phone: '+91 94883 23412',
        location: 'Tamil Nadu, India',
        bio: 'Passionate Full Stack Developer with hands-on expertise building scalable web platforms with React, Node.js, and Cloud Infrastructure.',
        githubUrl: 'https://github.com/cheran-dev',
        linkedinUrl: 'https://linkedin.com/in/cheran-s',
        websiteUrl: 'https://cheran.dev',
        verified: true,
        projects: [
          {
            name: 'NEXORA Integrated Student Success Ecosystem',
            stack: 'React, Node.js, Express, MongoDB Atlas, Gemini AI',
            desc: 'End-to-end multi-tenant student intelligence, ATS resume analyzer, and alumni networking platform.',
            github: 'https://github.com/cheran-dev/nexora'
          },
          {
            name: 'Microservice Task Flow Engine',
            stack: 'Node.js, Redis, Docker, RabbitMQ',
            desc: 'Distributed queue-based asynchronous background worker and notification service.',
            github: 'https://github.com/cheran-dev/task-flow'
          }
        ],
        certificates: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            date: '2025'
          },
          {
            name: 'Meta Full-Stack Developer Professional Certificate',
            issuer: 'Coursera / Meta',
            date: '2024'
          }
        ]
      }
    }
  );

  const studentSneha = await upsertUser(
    { email: 'sneha@student.edu' },
    {
      name: 'Sneha Patel',
      email: 'sneha@student.edu',
      role: 'Student',
      status: 'Active',
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Computer Science and Engineering (CSE)',
        department: 'Computer Science and Engineering',
        batchYear: 2026,
        cgpa: 9.35,
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Redux', 'System Design', 'Git'],
        targetCareerRole: 'Frontend Engineer',
        careerTarget: 'Frontend Engineer',
        preferredRoles: 'Frontend Engineer',
        readinessScore: 92,
        resumeScore: 96,
        atsScore: 96,
        resumeUrl: 'Sneha_Patel_Resume.pdf',
        registerNumber: '21BCE1048',
        phone: '+91 98412 34567',
        location: 'Bangalore, India',
        bio: 'Frontend-focused software engineer with high proficiency in React, TypeScript, and interactive web animation.',
        githubUrl: 'https://github.com/snehapatel-dev',
        linkedinUrl: 'https://linkedin.com/in/sneha-patel-cs',
        verified: true
      }
    }
  );

  const studentAditya = await upsertUser(
    { email: 'aditya.r@student.edu' },
    {
      name: 'Aditya Roy',
      email: 'aditya.r@student.edu',
      role: 'Student',
      status: 'Active',
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Information Technology (IT)',
        department: 'Information Technology',
        batchYear: 2026,
        cgpa: 8.78,
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'MySQL', 'Redis', 'Kafka'],
        targetCareerRole: 'Backend Developer',
        careerTarget: 'Backend Developer',
        preferredRoles: 'Backend Developer',
        readinessScore: 86,
        resumeScore: 91,
        atsScore: 91,
        resumeUrl: 'Aditya_Roy_Resume.pdf',
        registerNumber: '21BCE1072',
        phone: '+91 97123 45678',
        location: 'Hyderabad, India',
        bio: 'Backend systems engineer focused on distributed microservices, transactional consistency, and database scaling.',
        githubUrl: 'https://github.com/adityaroy-dev',
        linkedinUrl: 'https://linkedin.com/in/aditya-roy-tech',
        verified: true
      }
    }
  );

  const studentAnanya = await upsertUser(
    { email: 'ananya.k@student.edu' },
    {
      name: 'Ananya Krishnan',
      email: 'ananya.k@student.edu',
      role: 'Student',
      status: 'Active',
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Artificial Intelligence and Data Science (AI & DS)',
        department: 'AI & Data Science',
        batchYear: 2026,
        cgpa: 9.45,
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'NLP', 'SQL', 'Deep Learning', 'FastAPI'],
        targetCareerRole: 'AI / Machine Learning Engineer',
        careerTarget: 'AI / Machine Learning Engineer',
        preferredRoles: 'AI / Machine Learning Engineer',
        readinessScore: 94,
        resumeScore: 97,
        atsScore: 97,
        resumeUrl: 'Ananya_Krishnan_Resume.pdf',
        registerNumber: '21BCE1089',
        phone: '+91 98840 56789',
        location: 'Chennai, India',
        bio: 'AI researcher and applied machine learning engineer building intelligent predictive models and LLM agent pipelines.',
        githubUrl: 'https://github.com/ananya-ai',
        linkedinUrl: 'https://linkedin.com/in/ananya-krishnan-ai',
        verified: true
      }
    }
  );

  const studentRohan = await upsertUser(
    { email: 'rohan.m@student.edu' },
    {
      name: 'Rohan Menon',
      email: 'rohan.m@student.edu',
      role: 'Student',
      status: 'Active',
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Electronics and Communication Engineering (ECE)',
        department: 'Electronics & Communication',
        batchYear: 2025,
        cgpa: 8.42,
        skills: ['C++', 'Embedded C', 'Python', 'IoT', 'Linux', 'AWS', 'Network Protocols', 'Docker'],
        targetCareerRole: 'DevOps & Cloud Engineer',
        careerTarget: 'DevOps & Cloud Engineer',
        preferredRoles: 'DevOps & Cloud Engineer',
        readinessScore: 82,
        resumeScore: 88,
        atsScore: 88,
        resumeUrl: 'Rohan_Menon_Resume.pdf',
        registerNumber: '21BCE1104',
        phone: '+91 96543 21098',
        location: 'Coimbatore, India',
        bio: 'Hardware-meets-cloud engineer enthusiastic about automated infrastructure, Linux internals, and embedded firmware.',
        githubUrl: 'https://github.com/rohanm-dev',
        linkedinUrl: 'https://linkedin.com/in/rohan-menon-ece',
        verified: true
      }
    }
  );

  const studentArun = await upsertUser(
    { email: 'arun.kumar@student.edu' },
    {
      name: 'Arun Kumar',
      email: 'arun.kumar@student.edu',
      role: 'Student',
      status: 'Active',
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Computer Science and Engineering (CSE)',
        department: 'Computer Science and Engineering',
        batchYear: 2026,
        cgpa: 8.15,
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Figma', 'UI/UX Design', 'Tailwind CSS', 'Git'],
        targetCareerRole: 'Product Designer',
        careerTarget: 'Product Designer',
        preferredRoles: 'Product Designer',
        readinessScore: 79,
        resumeScore: 84,
        atsScore: 84,
        resumeUrl: 'Arun_Kumar_Resume.pdf',
        registerNumber: '21BCE1120',
        phone: '+91 97890 12345',
        location: 'Salem, India',
        bio: 'Product-focused frontend designer merging technical UI development with user research and modern aesthetics.',
        githubUrl: 'https://github.com/arunkumar-ui',
        linkedinUrl: 'https://linkedin.com/in/arun-kumar-design',
        verified: true
      }
    }
  );

  // ==========================================
  // 4. ADMIN USER
  // ==========================================
  console.log('🛡️ Ensuring Admin Accounts...');
  await upsertUser(
    { email: 'cheran@it' },
    {
      name: 'NEXORA Admin',
      email: 'cheran@it',
      role: 'Admin',
      status: 'Active'
    },
    true
  );

  await upsertUser(
    { email: 'admin@nexora.io' },
    {
      name: 'Super Admin',
      email: 'admin@nexora.io',
      role: 'Admin',
      status: 'Active'
    },
    true
  );

  // ==========================================
  // 5. ROLE-SKILL MAPS
  // ==========================================
  console.log('🗺️ Seeding Role-Skill Maps...');
  const roleMapsData = [
    {
      roleName: 'Full Stack Developer',
      description: 'End-to-end web and cloud application engineer.',
      requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'AWS', 'System Design', 'Git']
    },
    {
      roleName: 'Frontend Engineer',
      description: 'Client-side interface specialist building responsive, accessible web applications.',
      requiredSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Tailwind CSS', 'System Design', 'Git']
    },
    {
      roleName: 'Backend Developer',
      description: 'Server architecture, API design, and distributed data systems engineer.',
      requiredSkills: ['Node.js', 'Java', 'Python', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'System Design']
    },
    {
      roleName: 'AI / Machine Learning Engineer',
      description: 'Applies deep learning models, statistical inference, and generative AI systems.',
      requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'SQL', 'NLP', 'Data Science', 'FastAPI']
    },
    {
      roleName: 'DevOps & Cloud Engineer',
      description: 'Automates deployments, cloud infrastructure, and CI/CD reliability.',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'Git', 'Python']
    }
  ];

  for (const rm of roleMapsData) {
    await RoleSkillMap.findOneAndUpdate(
      { roleName: rm.roleName },
      { $set: rm },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 6. JOBS & PLACEMENT DRIVES
  // ==========================================
  console.log('💼 Seeding Placement Jobs & Drives...');
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const in45Days = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
  const in20Days = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
  const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const in25Days = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
  const in18Days = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000);
  const in35Days = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
  const in40Days = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
  const in10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

  const jobsData = [
    {
      title: 'Frontend Engineer (React / Next.js)',
      company: 'Google',
      recruiterId: recruiterGoogle._id,
      type: 'Full-Time',
      location: 'Bangalore, Hybrid',
      description: 'Join Google core user experience engineering to build next-generation web applications using React, Next.js, and TypeScript.',
      requirements: ['B.Tech / B.E. in CS, IT or equivalent', 'Proficiency in React, modern JavaScript, and web performance', 'Solid understanding of data structures and algorithms'],
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'System Design'],
      salary: { min: 2400000, max: 3200000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)', 'Artificial Intelligence and Data Science (AI & DS)'],
      minimumCGPA: 8.0,
      deadline: in30Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Software Engineering Intern (Summer 2026)',
      company: 'Google',
      recruiterId: recruiterGoogle._id,
      type: 'Internship',
      location: 'Hyderabad / Remote',
      description: 'Summer 2026 engineering internship tackling cloud infrastructure, search indexing, and real-time streaming pipelines.',
      requirements: ['Currently enrolled in an undergraduate technical program', 'Strong knowledge of Data Structures, Algorithms, and Object-Oriented Programming'],
      skills: ['C++', 'Java', 'Python', 'Go', 'Data Structures'],
      salary: { min: 120000, max: 150000, currency: 'INR' },
      experience: 'Fresher',
      eligibleBatches: [2026, 2027],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)', 'Artificial Intelligence and Data Science (AI & DS)', 'Electronics and Communication Engineering (ECE)'],
      minimumCGPA: 7.5,
      deadline: in45Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Cloud Infrastructure Engineer',
      company: 'Microsoft',
      recruiterId: recruiterMicrosoft._id,
      type: 'Full-Time',
      location: 'Bangalore / Hyderabad',
      description: 'Scale Azure core virtualization, container orchestration, and multi-tenant security architecture.',
      requirements: ['Bachelor degree in Computer Science, IT, or ECE', 'Familiarity with cloud platforms (Azure/AWS), Docker, and Linux systems'],
      skills: ['Azure', 'AWS', 'Docker', 'Kubernetes', 'Python', 'Linux'],
      salary: { min: 2200000, max: 2800000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)', 'Electronics and Communication Engineering (ECE)'],
      minimumCGPA: 8.0,
      deadline: in20Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Full Stack Developer',
      company: 'Amazon',
      recruiterId: recruiterAmazon._id,
      type: 'Full-Time',
      location: 'Chennai / Bangalore',
      description: 'Architect customer-facing microservices and reactive interfaces for Amazon high-throughput retail operations.',
      requirements: ['B.Tech / B.E. in engineering', 'Demonstrated expertise in Node.js, React, and relational/NoSQL datastores'],
      skills: ['Node.js', 'React', 'AWS', 'MongoDB', 'Java', 'System Design'],
      salary: { min: 2000000, max: 2600000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)', 'Artificial Intelligence and Machine Learning (AI & ML)'],
      minimumCGPA: 7.8,
      deadline: in15Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Associate DevOps Engineer',
      company: 'Atlassian',
      recruiterId: recruiterAtlassian._id,
      type: 'Full-Time',
      location: 'Bengaluru, India',
      description: 'Automate build pipelines, continuous integration workflows, and observability infrastructure for Jira and Confluence Cloud.',
      requirements: ['B.Tech in CS or IT', 'Hands-on practice with Git workflows, Docker containerization, and AWS services'],
      skills: ['CI/CD', 'Git', 'AWS', 'Terraform', 'Python', 'Docker'],
      salary: { min: 1800000, max: 2400000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)'],
      minimumCGPA: 8.0,
      deadline: in25Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Machine Learning Engineer',
      company: 'Swiggy',
      recruiterId: recruiterSwiggy._id,
      type: 'Full-Time',
      location: 'Bangalore, Hybrid',
      description: 'Deploy real-time delivery estimation, dynamic routing models, and automated recommendation algorithms.',
      requirements: ['Degree in AI, DS, CS, or Mathematics', 'Strong background in Python, Scikit-Learn, PyTorch, and SQL query tuning'],
      skills: ['Python', 'PyTorch', 'SQL', 'Machine Learning', 'FastAPI'],
      salary: { min: 1800000, max: 2200000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Artificial Intelligence and Data Science (AI & DS)', 'Artificial Intelligence and Machine Learning (AI & ML)', 'Computer Science and Engineering (CSE)'],
      minimumCGPA: 8.2,
      deadline: in18Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Backend Platform Engineer',
      company: 'Razorpay',
      recruiterId: recruiterRazorpay._id,
      type: 'Full-Time',
      location: 'Bangalore, India',
      description: 'Build mission-critical payment gateways, ledger reconciliation engines, and fault-tolerant banking APIs.',
      requirements: ['B.Tech in CS/IT', 'Deep knowledge of Go or Node.js, distributed locking, and relational database indexing'],
      skills: ['Go', 'Node.js', 'MySQL', 'Redis', 'Microservices', 'System Design'],
      salary: { min: 1600000, max: 2200000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)'],
      minimumCGPA: 7.5,
      deadline: in35Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    },
    {
      title: 'Cybersecurity Analyst',
      company: 'Cisco',
      recruiterId: recruiterCisco._id,
      type: 'Full-Time',
      location: 'Bangalore, Hybrid',
      description: 'Defend next-generation enterprise networks, perform automated threat analysis, and implement zero-trust protocols.',
      requirements: ['B.Tech in CS, IT, or ECE', 'Strong fundamentals in OSI model, Linux kernel security, and penetration testing'],
      skills: ['Network Security', 'Linux', 'Python', 'Cryptography', 'Wireshark'],
      salary: { min: 1500000, max: 2000000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering (CSE)', 'Information Technology (IT)', 'Electronics and Communication Engineering (ECE)'],
      minimumCGPA: 7.5,
      deadline: in40Days,
      status: 'Open',
      source: 'Placement',
      approvalStatus: 'Approved'
    }
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    const job = await Job.findOneAndUpdate(
      { title: j.title, company: j.company },
      { $set: j },
      { upsert: true, new: true }
    );
    createdJobs.push(job);
  }

  const jobGoogle = createdJobs[0];
  const jobGoogleIntern = createdJobs[1];
  const jobMicrosoft = createdJobs[2];
  const jobAmazon = createdJobs[3];
  const jobAtlassian = createdJobs[4];
  const jobSwiggy = createdJobs[5];
  const jobRazorpay = createdJobs[6];
  const jobCisco = createdJobs[7];

  // ==========================================
  // 7. APPLICATIONS WITH REALISTIC ATS & STATUSES
  // ==========================================
  console.log('📝 Seeding Student Applications (Consistent Cross-Role)...');
  const upsertApp = async (jobId, studentId, appData) => {
    return await Application.findOneAndUpdate(
      { jobId, studentId },
      {
        $set: {
          jobId,
          studentId,
          ...appData
        }
      },
      { upsert: true, new: true }
    );
  };

  // Cheran S applications
  await upsertApp(jobGoogle._id, studentCheran._id, {
    resumeUrl: 'Cheran_S_Resume (1).pdf',
    coverLetter: 'I am excited to apply for the Frontend Engineer position at Google. My experience building high-performance React architectures directly aligns with your web platform requirements.',
    status: 'Interview',
    aiAnalysis: {
      atsScore: 95,
      matchedSkills: ['React', 'JavaScript', 'CSS', 'System Design'],
      missingSkills: ['TypeScript'],
      summary: 'Demonstrated high technical alignment for frontend infrastructure. Outstanding project portfolio and clear UI engineering track record.'
    },
    interviewRounds: [
      {
        title: 'Technical Screen & Coding',
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        interviewer: 'Marcus Vance',
        feedback: 'Superb problem-solving and clean React component state lifecycle handling.',
        result: 'Pass'
      },
      {
        title: 'System Design & Architecture',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        interviewer: 'Ravi Kumar (Lead SWE)',
        feedback: 'Upcoming technical architectural assessment.',
        result: 'Pending'
      }
    ]
  });

  await upsertApp(jobAmazon._id, studentCheran._id, {
    resumeUrl: 'Cheran_S_Resume (1).pdf',
    coverLetter: 'Applying for Full Stack Developer at Amazon. Ready to leverage my expertise in Node.js, Express, and distributed databases.',
    status: 'Offered',
    aiAnalysis: {
      atsScore: 92,
      matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'AWS', 'System Design'],
      missingSkills: ['Java'],
      summary: 'Strong candidate with demonstrated full-stack mastery and microservice architecture experience.'
    },
    interviewRounds: [
      {
        title: 'Bar Raiser & Final Leadership Round',
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        interviewer: 'Vikram Singhania',
        feedback: 'Exemplary customer obsession and bias for action. Candidate offered Full Stack Developer position with 24 LPA CTC.',
        result: 'Pass'
      }
    ]
  });

  await upsertApp(jobMicrosoft._id, studentCheran._id, {
    resumeUrl: 'Cheran_S_Resume (1).pdf',
    coverLetter: 'Passionate about cloud infrastructure and high-availability systems on Azure.',
    status: 'Shortlisted',
    aiAnalysis: {
      atsScore: 88,
      matchedSkills: ['AWS', 'Python', 'Linux', 'Docker'],
      missingSkills: ['Azure', 'Kubernetes'],
      summary: 'Solid cloud foundations and Linux problem solving. Shortlisted for upcoming technical interview cohort.'
    }
  });

  await upsertApp(jobAtlassian._id, studentCheran._id, {
    resumeUrl: 'Cheran_S_Resume (1).pdf',
    coverLetter: 'Interested in DevOps automation and CI/CD reliability at Atlassian.',
    status: 'Screening',
    aiAnalysis: {
      atsScore: 85,
      matchedSkills: ['Git', 'AWS', 'Python', 'Docker'],
      missingSkills: ['Terraform', 'CI/CD'],
      summary: 'Resume under initial technical resume review by talent acquisition team.'
    }
  });

  await upsertApp(jobRazorpay._id, studentCheran._id, {
    resumeUrl: 'Cheran_S_Resume (1).pdf',
    coverLetter: 'Experienced with Node.js and SQL database optimizations.',
    status: 'Under Review',
    aiAnalysis: {
      atsScore: 86,
      matchedSkills: ['Node.js', 'MySQL', 'Go', 'System Design'],
      missingSkills: ['Redis'],
      summary: 'Profile submitted to hiring team for technical qualification review.'
    }
  });

  await upsertApp(jobSwiggy._id, studentCheran._id, {
    resumeUrl: 'Cheran_S_Resume (1).pdf',
    coverLetter: 'Interested in applying data-driven backend models at scale.',
    status: 'Applied',
    aiAnalysis: {
      atsScore: 78,
      matchedSkills: ['Python'],
      missingSkills: ['PyTorch', 'SQL', 'Machine Learning'],
      summary: 'Application submitted. Resume analysis complete.'
    }
  });

  // Sneha Patel applications
  await upsertApp(jobGoogle._id, studentSneha._id, {
    resumeUrl: 'Sneha_Patel_Resume.pdf',
    status: 'Offered',
    aiAnalysis: {
      atsScore: 96,
      matchedSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'System Design'],
      missingSkills: [],
      summary: 'Exceptional frontend skill profile. Comprehensive mastery across React and modern web standards.'
    },
    interviewRounds: [
      {
        title: 'Final Onsite Technical Interview',
        scheduledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        interviewer: 'Marcus Vance',
        feedback: 'Candidate cleared all rounds with distinction. Offer issued at 28 LPA CTC.',
        result: 'Pass'
      }
    ]
  });

  await upsertApp(jobMicrosoft._id, studentSneha._id, {
    resumeUrl: 'Sneha_Patel_Resume.pdf',
    status: 'Shortlisted',
    aiAnalysis: {
      atsScore: 90,
      matchedSkills: ['AWS', 'Python', 'Linux'],
      missingSkills: ['Azure'],
      summary: 'Shortlisted for candidate technical evaluation.'
    }
  });

  await upsertApp(jobAmazon._id, studentSneha._id, {
    resumeUrl: 'Sneha_Patel_Resume.pdf',
    status: 'Interview',
    aiAnalysis: {
      atsScore: 91,
      matchedSkills: ['React', 'Node.js', 'System Design'],
      missingSkills: ['Java', 'MongoDB'],
      summary: 'Interview round scheduled.'
    }
  });

  // Aditya Roy applications
  await upsertApp(jobRazorpay._id, studentAditya._id, {
    resumeUrl: 'Aditya_Roy_Resume.pdf',
    status: 'Offered',
    aiAnalysis: {
      atsScore: 93,
      matchedSkills: ['Go', 'MySQL', 'Redis', 'Microservices', 'System Design'],
      missingSkills: ['Node.js'],
      summary: 'Outstanding systems engineering knowledge and microservice design.'
    },
    interviewRounds: [
      {
        title: 'Architecture & Scalability Discussion',
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        interviewer: 'Rohit Mehra',
        feedback: 'Exceptional depth in database isolation levels and distributed locks. Offer generated at 20 LPA CTC.',
        result: 'Pass'
      }
    ]
  });

  await upsertApp(jobAmazon._id, studentAditya._id, {
    resumeUrl: 'Aditya_Roy_Resume.pdf',
    status: 'Shortlisted',
    aiAnalysis: {
      atsScore: 87,
      matchedSkills: ['Java', 'System Design'],
      missingSkills: ['React'],
      summary: 'Shortlisted for backend engineering track.'
    }
  });

  await upsertApp(jobCisco._id, studentAditya._id, {
    resumeUrl: 'Aditya_Roy_Resume.pdf',
    status: 'Screening',
    aiAnalysis: {
      atsScore: 82,
      matchedSkills: ['Linux'],
      missingSkills: ['Network Security', 'Cryptography'],
      summary: 'Profile in recruiter review queue.'
    }
  });

  // Ananya Krishnan applications
  await upsertApp(jobSwiggy._id, studentAnanya._id, {
    resumeUrl: 'Ananya_Krishnan_Resume.pdf',
    status: 'Offered',
    aiAnalysis: {
      atsScore: 97,
      matchedSkills: ['Python', 'PyTorch', 'SQL', 'Machine Learning', 'FastAPI'],
      missingSkills: [],
      summary: 'Top percentile candidate. Deep mathematical foundations and applied PyTorch experience.'
    },
    interviewRounds: [
      {
        title: 'Machine Learning Research & Coding Round',
        scheduledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        interviewer: 'Kavita Reddy',
        feedback: 'Clear mastery over transformer models and loss optimization. Offer extended at 22 LPA CTC.',
        result: 'Pass'
      }
    ]
  });

  await upsertApp(jobGoogleIntern._id, studentAnanya._id, {
    resumeUrl: 'Ananya_Krishnan_Resume.pdf',
    status: 'Interview',
    aiAnalysis: {
      atsScore: 94,
      matchedSkills: ['Python', 'Data Structures'],
      missingSkills: ['C++', 'Go'],
      summary: 'Invited for Google Summer 2026 technical screening.'
    }
  });

  // Rohan Menon applications
  await upsertApp(jobCisco._id, studentRohan._id, {
    resumeUrl: 'Rohan_Menon_Resume.pdf',
    status: 'Interview',
    aiAnalysis: {
      atsScore: 89,
      matchedSkills: ['Network Security', 'Linux', 'Python'],
      missingSkills: ['Cryptography'],
      summary: 'Solid network architecture and Linux low-level systems expertise.'
    }
  });

  await upsertApp(jobAtlassian._id, studentRohan._id, {
    resumeUrl: 'Rohan_Menon_Resume.pdf',
    status: 'Shortlisted',
    aiAnalysis: {
      atsScore: 84,
      matchedSkills: ['Git', 'Linux', 'Docker'],
      missingSkills: ['CI/CD', 'Terraform'],
      summary: 'Shortlisted for technical screening.'
    }
  });

  // Arun Kumar applications
  await upsertApp(jobGoogle._id, studentArun._id, {
    resumeUrl: 'Arun_Kumar_Resume.pdf',
    status: 'Screening',
    aiAnalysis: {
      atsScore: 83,
      matchedSkills: ['React', 'JavaScript', 'CSS'],
      missingSkills: ['TypeScript', 'System Design'],
      summary: 'Candidate under initial review for UI engineer pipeline.'
    }
  });

  // ==========================================
  // 8. MENTORSHIP SESSIONS & REQUESTS
  // ==========================================
  console.log('🤝 Seeding Mentorship Sessions & Availability...');
  // Mentor Availability
  const mentors = [alumniRavi, alumniPriya, alumniAravind, alumniCheranSuresh];
  for (const m of mentors) {
    await MentorAvailability.findOneAndUpdate(
      { alumni: m._id },
      {
        $set: {
          alumni: m._id,
          weeklySchedule: {
            monday: [{ start: "18:00", end: "20:00", enabled: true }],
            wednesday: [{ start: "18:00", end: "20:00", enabled: true }],
            friday: [{ start: "18:00", end: "20:00", enabled: true }],
            saturday: [{ start: "10:00", end: "13:00", enabled: true }]
          },
          isAvailable: true,
          sessionDuration: 30,
          topics: ['Career Guidance', 'Resume Review', 'Mock Interview', 'Skill Gap Roadmapping', 'Technical System Design']
        }
      },
      { upsert: true, new: true }
    );
  }

  // Mentorship Sessions for Cheran S
  const session1Start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const session1End = new Date(session1Start.getTime() + 45 * 60000);

  await MentorshipSession.findOneAndUpdate(
    { mentor: alumniRavi._id, mentee: studentCheran._id, topic: 'System Design for FAANG & High-Scale React Architecture' },
    {
      $set: {
        mentor: alumniRavi._id,
        mentee: studentCheran._id,
        topic: 'System Design for FAANG & High-Scale React Architecture',
        careerGoal: 'Become a Staff Full-Stack Engineer at Google',
        targetRole: 'Full Stack Developer',
        scheduledStart: session1Start,
        scheduledEnd: session1End,
        durationMinutes: 45,
        status: 'Completed',
        message: 'Conducted in-depth review of micro-frontend state coordination and caching strategies with Redis.',
        actionItems: [
          {
            title: 'Build distributed caching prototype with Redis',
            description: 'Implement cache-aside pattern on top of Express server',
            assignedTo: 'Student',
            status: 'COMPLETED'
          },
          {
            title: 'Read Chapter 5 of Designing Data-Intensive Applications',
            description: 'Focus on replication lag and partition strategies',
            assignedTo: 'Student',
            status: 'IN_PROGRESS'
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  const session2Start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const session2End = new Date(session2Start.getTime() + 30 * 60000);

  await MentorshipSession.findOneAndUpdate(
    { mentor: alumniRavi._id, mentee: studentCheran._id, topic: 'Mock Behavioral & Technical Interview for Google' },
    {
      $set: {
        mentor: alumniRavi._id,
        mentee: studentCheran._id,
        topic: 'Mock Behavioral & Technical Interview for Google',
        careerGoal: 'Ace Google technical interview loop',
        targetRole: 'Full Stack Developer',
        scheduledStart: session2Start,
        scheduledEnd: session2End,
        durationMinutes: 30,
        status: 'Scheduled',
        meetingLink: 'https://meet.google.com/nex-mock-ravi',
        message: 'Upcoming session simulating Google SWE interview rounds and behavioral STAR method.'
      }
    },
    { upsert: true, new: true }
  );

  const session3Start = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const session3End = new Date(session3Start.getTime() + 30 * 60000);

  await MentorshipSession.findOneAndUpdate(
    { mentor: alumniPriya._id, mentee: studentCheran._id, topic: 'Full-Stack to AI Integration & Career Trajectory' },
    {
      $set: {
        mentor: alumniPriya._id,
        mentee: studentCheran._id,
        topic: 'Full-Stack to AI Integration & Career Trajectory',
        careerGoal: 'Integrate LLMs and GenAI workflows into full-stack web products',
        targetRole: 'Full Stack Developer',
        scheduledStart: session3Start,
        scheduledEnd: session3End,
        durationMinutes: 30,
        status: 'Approved',
        meetingLink: 'https://meet.google.com/nex-ai-priya',
        message: 'Discussing practical implementation patterns for embedding models and vector indexing in MERN apps.'
      }
    },
    { upsert: true, new: true }
  );

  // Mentorship Requests
  await MentorshipRequest.findOneAndUpdate(
    { student: studentCheran._id, alumni: alumniAravind._id },
    {
      $set: {
        student: studentCheran._id,
        alumni: alumniAravind._id,
        topic: 'AWS Cloud Architecture & Kubernetes Cluster Hardening',
        careerGoal: 'Deepen container orchestration skills',
        targetRole: 'Full Stack Developer',
        requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requestedStartTime: '18:00',
        requestedEndTime: '18:30',
        status: 'Pending',
        message: 'Hi Aravind, I am building distributed microservices and would appreciate your guidance on multi-region AWS setup.'
      }
    },
    { upsert: true, new: true }
  );

  // Mentorship Session for Sneha Patel
  await MentorshipSession.findOneAndUpdate(
    { mentor: alumniAravind._id, mentee: studentSneha._id },
    {
      $set: {
        mentor: alumniAravind._id,
        mentee: studentSneha._id,
        topic: 'Frontend Cloud Deployment & Global CDN Invalidation',
        careerGoal: 'Optimize global asset latency for web applications',
        targetRole: 'Frontend Engineer',
        scheduledStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60000),
        durationMinutes: 30,
        status: 'Completed',
        message: 'Explored CloudFront edge lambdas and modern asset cache header strategies.'
      }
    },
    { upsert: true, new: true }
  );

  // ==========================================
  // 9. ALUMNI BOUNTIES & SUBMISSIONS
  // ==========================================
  console.log('🏆 Seeding Alumni Bounties & Student Submissions...');
  const bountiesData = [
    {
      title: 'Build Distributed Rate Limiter with Redis & Express',
      description: 'Implement a sliding-window counter rate limiter middleware in Node.js using Redis Lua scripts. Must support multi-tier API rate limits and include unit test coverage.',
      taskInstructions: '1. Clone the repo\n2. Implement middleware in src/rateLimiter.js\n3. Use atomic Redis EVAL scripts\n4. Submit GitHub PR link with tests.',
      rewardAmount: 150,
      rewardCurrency: 'USD',
      tags: ['Node.js', 'Redis', 'Express', 'System Design'],
      requiredSkills: ['Node.js', 'Redis', 'Express', 'System Design'],
      difficulty: 'Intermediate',
      category: 'Software Development',
      status: 'Open',
      poster: alumniRavi._id,
      deadline: in25Days
    },
    {
      title: 'Interactive Kanban Board in React with Fluid Drag & Drop',
      description: 'Create an accessible, keyboard-navigable Kanban board component with column reordering, task tagging, and optimistic UI updates using Framer Motion and React state.',
      taskInstructions: 'Build a modular component library demoing smooth spring physics and persisted board states.',
      rewardAmount: 120,
      rewardCurrency: 'USD',
      tags: ['React', 'Framer Motion', 'Tailwind CSS', 'UI/UX'],
      requiredSkills: ['React', 'Framer Motion', 'Tailwind CSS', 'UI/UX'],
      difficulty: 'Intermediate',
      category: 'Frontend Development',
      status: 'Under Review',
      poster: alumniCheranSuresh._id,
      deadline: in15Days,
      submissions: [
        {
          student: studentCheran._id,
          submissionNotes: 'Engineered Kanban board with fluid drag handles, keyboard navigation, and optimistic local storage sync.',
          githubUrl: 'https://github.com/cheran-dev/kanban-demo',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'Submitted'
        }
      ]
    },
    {
      title: 'Fine-tune BERT / RoBERTa Model for Automated Resume Skill Extraction',
      description: 'Train a lightweight Named Entity Recognition (NER) pipeline that extracts technical skills, years of experience, and educational credentials from unstructured PDF text.',
      taskInstructions: 'Provide notebook with training metrics, HuggingFace pipeline weights, and an evaluation report against CoNLL-style test sets.',
      rewardAmount: 200,
      rewardCurrency: 'USD',
      tags: ['Python', 'NLP', 'PyTorch', 'HuggingFace'],
      requiredSkills: ['Python', 'NLP', 'PyTorch', 'HuggingFace'],
      difficulty: 'Advanced',
      category: 'Machine Learning',
      status: 'Open',
      poster: alumniPriya._id,
      deadline: in30Days
    },
    {
      title: 'Automated Multi-Stage Docker CI/CD Pipeline Template with GitHub Actions',
      description: 'Write an optimized GitHub Actions workflow that builds multi-stage Docker images, scans for CVE vulnerabilities with Trivy, and pushes signed tags to Docker Hub.',
      taskInstructions: 'Provide sanitized repository with sample microservice and full CI/CD yaml definitions.',
      rewardAmount: 100,
      rewardCurrency: 'USD',
      tags: ['Docker', 'CI/CD', 'GitHub Actions', 'DevOps'],
      requiredSkills: ['Docker', 'CI/CD', 'GitHub Actions', 'DevOps'],
      difficulty: 'Beginner',
      category: 'DevOps',
      status: 'Completed',
      poster: alumniAravind._id,
      deadline: in10Days,
      submissions: [
        {
          student: studentSneha._id,
          submissionNotes: 'Full GitHub Action workflow with Trivy security scans, caching layers, and semantic version tagging.',
          githubUrl: 'https://github.com/sneha/docker-ci-cd',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'Approved',
          feedback: 'Exceptional submission! Minimal build image footprint and flawless security compliance.'
        }
      ]
    }
  ];

  for (const b of bountiesData) {
    await Bounty.findOneAndUpdate(
      { title: b.title },
      { $set: b },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 10. ASSESSMENTS & SUBMISSIONS
  // ==========================================
  console.log('📝 Seeding Technical Assessments & Submissions...');
  const assessmentsData = [
    {
      title: 'Advanced React & Modern JavaScript Certification',
      description: 'Comprehensive evaluation covering component lifecycles, custom hooks, virtual DOM reconciliation, closures, and performance optimization.',
      createdBy: placementHead._id,
      type: 'Technical',
      durationMinutes: 45,
      status: 'Published',
      questions: [
        {
          type: 'MCQ',
          content: 'What does React useEffect cleanup function do when dependency array values change?',
          marks: 2,
          difficulty: 'Medium',
          options: [
            { text: 'It runs before the effect re-runs to clean up previous resources', isCorrect: true },
            { text: 'It runs only when the component unmounts from the DOM', isCorrect: false },
            { text: 'It prevents the effect from executing again', isCorrect: false },
            { text: 'It cancels pending asynchronous network requests automatically', isCorrect: false }
          ]
        },
        {
          type: 'MCQ',
          content: 'Which hook should be prioritized to memoize an expensive computation between renders?',
          marks: 2,
          difficulty: 'Easy',
          options: [
            { text: 'useMemo', isCorrect: true },
            { text: 'useCallback', isCorrect: false },
            { text: 'useRef', isCorrect: false },
            { text: 'useEffect', isCorrect: false }
          ]
        },
        {
          type: 'Coding',
          content: 'Write a function debounce(fn, delay) that delays invoking fn until after delay milliseconds have elapsed since the last time it was called.',
          marks: 5,
          difficulty: 'Medium',
          language: 'javascript',
          initialCode: 'function debounce(fn, delay) {\n  // your code here\n}',
          testCases: [
            { input: 'fn, 100', expectedOutput: 'delayed execution after 100ms', isHidden: false }
          ]
        }
      ]
    },
    {
      title: 'Data Structures & Algorithmic Problem Solving',
      description: 'Assesses mastery of Arrays, Hash Tables, Trees, Graphs, Dynamic Programming, and Big-O computational efficiency.',
      createdBy: placementHead._id,
      type: 'Coding',
      durationMinutes: 60,
      status: 'Published',
      questions: [
        {
          type: 'MCQ',
          content: 'What is the average time complexity of lookups in a well-balanced Red-Black Tree?',
          marks: 2,
          difficulty: 'Medium',
          options: [
            { text: 'O(log N)', isCorrect: true },
            { text: 'O(1)', isCorrect: false },
            { text: 'O(N)', isCorrect: false },
            { text: 'O(N log N)', isCorrect: false }
          ]
        }
      ]
    },
    {
      title: 'Full Stack System Architecture & Cloud Fundamentals',
      description: 'Tests relational vs NoSQL trade-offs, caching topologies, message queues, and REST/GraphQL interface design.',
      createdBy: placementHead._id,
      type: 'Technical',
      durationMinutes: 40,
      status: 'Published',
      questions: [
        {
          type: 'MCQ',
          content: 'When implementing a write-heavy telemetry service, which storage paradigm offers optimal append performance?',
          marks: 2,
          difficulty: 'Medium',
          options: [
            { text: 'LSM-tree based key-value stores (e.g. Cassandra / RocksDB)', isCorrect: true },
            { text: 'B-tree indexed relational tables with multiple secondary keys', isCorrect: false },
            { text: 'XML document files on network-attached storage', isCorrect: false },
            { text: 'In-memory array serializations without WAL', isCorrect: false }
          ]
        }
      ]
    },
    {
      title: 'General Aptitude & Logical Reasoning',
      description: 'Quantitative aptitude, pattern recognition, syllogisms, and critical comprehension for campus recruiting filters.',
      createdBy: placementHead._id,
      type: 'Aptitude',
      durationMinutes: 30,
      status: 'Published',
      questions: [
        {
          type: 'MCQ',
          content: 'If 6 workers can complete a coding sprint in 12 days, how many days will 9 workers take to complete the same sprint at the same velocity?',
          marks: 2,
          difficulty: 'Easy',
          options: [
            { text: '8 days', isCorrect: true },
            { text: '10 days', isCorrect: false },
            { text: '6 days', isCorrect: false },
            { text: '9 days', isCorrect: false }
          ]
        }
      ]
    }
  ];

  const createdAssessments = [];
  for (const a of assessmentsData) {
    const doc = await Assessment.findOneAndUpdate(
      { title: a.title },
      { $set: a },
      { upsert: true, new: true }
    );
    createdAssessments.push(doc);
  }

  // Student Submissions
  const reactAssessment = createdAssessments[0];
  const fullstackAssessment = createdAssessments[2];
  const dsaAssessment = createdAssessments[1];
  const aptitudeAssessment = createdAssessments[3];

  await Submission.findOneAndUpdate(
    { assessmentId: reactAssessment._id, studentId: studentCheran._id },
    {
      $set: {
        assessmentId: reactAssessment._id,
        studentId: studentCheran._id,
        startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        submitTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 38 * 60000),
        status: 'Evaluated',
        totalScore: 9,
        answers: [
          { questionId: reactAssessment.questions[0]._id, isCorrect: true, marksAwarded: 2 },
          { questionId: reactAssessment.questions[1]._id, isCorrect: true, marksAwarded: 2 },
          { questionId: reactAssessment.questions[2]._id, isCorrect: true, marksAwarded: 5, code: 'function debounce(fn, delay) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); }; }' }
        ]
      }
    },
    { upsert: true, new: true }
  );

  await Submission.findOneAndUpdate(
    { assessmentId: fullstackAssessment._id, studentId: studentCheran._id },
    {
      $set: {
        assessmentId: fullstackAssessment._id,
        studentId: studentCheran._id,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        submitTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 32 * 60000),
        status: 'Evaluated',
        totalScore: 2,
        answers: [
          { questionId: fullstackAssessment.questions[0]._id, isCorrect: true, marksAwarded: 2 }
        ]
      }
    },
    { upsert: true, new: true }
  );

  await Submission.findOneAndUpdate(
    { assessmentId: reactAssessment._id, studentId: studentSneha._id },
    {
      $set: {
        assessmentId: reactAssessment._id,
        studentId: studentSneha._id,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        submitTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60000),
        status: 'Evaluated',
        totalScore: 9
      }
    },
    { upsert: true, new: true }
  );

  await Submission.findOneAndUpdate(
    { assessmentId: dsaAssessment._id, studentId: studentAditya._id },
    {
      $set: {
        assessmentId: dsaAssessment._id,
        studentId: studentAditya._id,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        submitTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 50 * 60000),
        status: 'Evaluated',
        totalScore: 2
      }
    },
    { upsert: true, new: true }
  );

  await Submission.findOneAndUpdate(
    { assessmentId: aptitudeAssessment._id, studentId: studentAnanya._id },
    {
      $set: {
        assessmentId: aptitudeAssessment._id,
        studentId: studentAnanya._id,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        submitTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60000),
        status: 'Evaluated',
        totalScore: 2
      }
    },
    { upsert: true, new: true }
  );

  // ==========================================
  // 11. COMMUNITY FORUM POSTS
  // ==========================================
  console.log('💬 Seeding Community Forum Discussions...');
  const postsData = [
    {
      author: alumniRavi._id,
      title: 'How I Cracked Google as a Fresher — My 5-Step Roadmap & System Design Checklist',
      content: 'During campus placements, students often over-index on memorizing LeetCode solutions without understanding core data structure trade-offs. When interviewing with Google, interviewers focus heavily on your ability to clarify ambiguity, evaluate time-space trade-offs, and construct scalable frontend architectures. Here are the 5 exact milestones I followed...',
      tags: ['Google', 'Interview Prep', 'Career Guide', 'System Design'],
      topic: 'Career Advice',
      likes: [studentCheran._id, studentSneha._id, studentAditya._id, studentAnanya._id],
      comments: [
        {
          author: studentCheran._id,
          content: 'Invaluable advice, Ravi! The emphasis on explaining architectural trade-offs during live coding really changed how I approach technical rounds.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          author: studentSneha._id,
          content: 'Thank you for breaking down the Google frontend interview loop so clearly! What resources helped you most for web performance metrics?',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      author: studentCheran._id,
      title: 'Building Production-Grade Multi-Tenant SaaS with Clean Architecture in MERN Stack',
      content: 'Sharing learnings from architecting the NEXORA Integrated Student Success platform: segregating role middleware, implementing idempotent MongoDB operations, and managing real-time WebSocket state synchronizations.',
      tags: ['React', 'Node.js', 'System Design', 'Clean Architecture'],
      topic: 'Technical Deep Dive',
      likes: [alumniRavi._id, alumniCheranSuresh._id, studentSneha._id],
      comments: [
        {
          author: alumniCheranSuresh._id,
          content: 'Impressive system separation, Cheran! Keeping database mutations idempotent is an essential skill when working at enterprise scale.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      author: alumniPriya._id,
      title: 'Transitioning from Traditional Software to GenAI & Applied Machine Learning in 2026',
      content: 'The demand for engineers who understand both traditional distributed systems and modern LLM application stacks is exploding. Here are key projects you can build right now to demonstrate readiness to top employers.',
      tags: ['AI', 'Career Advice', 'Machine Learning', 'GenAI'],
      topic: 'Industry Trends',
      likes: [studentAnanya._id, studentCheran._id],
      comments: [
        {
          author: studentAnanya._id,
          content: 'So true! Hands-on RAG architectures and evaluation metrics stand out far more than generic classification tutorials.',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ]
    },
    {
      author: placementHead._id,
      title: 'Campus Placement Drives 2026: Official Guidelines, Eligibility & Preparation Schedule',
      content: 'Dear Students, the Phase 1 Placement season commences next month with tier-1 technology partners including Google, Microsoft, Amazon, Atlassian, and Swiggy. Please ensure your profiles and ATS resumes are finalized on NEXORA.',
      tags: ['Placement', 'Announcement', 'Campus Drives', 'Important'],
      topic: 'Official Announcements',
      isPinned: true,
      likes: [studentCheran._id, studentSneha._id, studentAditya._id, studentAnanya._id, studentRohan._id, studentArun._id]
    }
  ];

  for (const p of postsData) {
    await Post.findOneAndUpdate(
      { title: p.title },
      { $set: p },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 12. CAREER TARGET & ROADMAP FOR STUDENTS
  // ==========================================
  console.log('🎯 Seeding Career Targets & Roadmaps...');
  await CareerTarget.findOneAndUpdate(
    { studentId: studentCheran._id },
    {
      $set: {
        studentId: studentCheran._id,
        targetRole: 'Full Stack Developer',
        targetCompanies: ['Google', 'Amazon', 'Atlassian', 'Microsoft', 'Razorpay'],
        preferredLocations: ['Bangalore', 'Chennai', 'Remote'],
        preferredWorkModes: ['Hybrid', 'Remote'],
        preferredJobTypes: ['Full-time'],
        history: [
          {
            roleName: 'Full Stack Developer',
            status: 'active',
            targetCompanies: ['Google', 'Amazon', 'Atlassian'],
            setAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  await CareerRoadmap.findOneAndUpdate(
    { studentId: studentCheran._id, roleName: 'Full Stack Developer' },
    {
      $set: {
        studentId: studentCheran._id,
        roleName: 'Full Stack Developer',
        duration: '6 months',
        durationMonths: 6,
        description: 'Comprehensive milestone roadmap to become a high-impact Full Stack Developer at tier-1 product companies.',
        status: 'In Progress',
        progress: 65,
        currentSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Git'],
        targetSkills: ['AWS', 'Docker', 'Kubernetes', 'Redis', 'System Design'],
        milestones: [
          {
            month: 'Month 1',
            focusArea: 'Core Full-Stack Mastery & React Internals',
            description: 'Deep dive into React 18 concurrent rendering, fiber trees, custom hooks, and state management.',
            status: 'Completed',
            skillsToLearn: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
            actionItems: ['Build custom state manager hook', 'Optimize bundle size with code splitting', 'Implement virtualized list component'],
            tags: ['React', 'Frontend']
          },
          {
            month: 'Month 2',
            focusArea: 'Advanced Backend Architecture & Microservices',
            description: 'Scalable Node.js architectures, distributed caching with Redis, and relational database indexing.',
            status: 'In Progress',
            skillsToLearn: ['Node.js', 'Express', 'Redis', 'MongoDB', 'PostgreSQL'],
            actionItems: ['Implement cache-aside pattern with Redis', 'Build rate-limiting middleware', 'Containerize services with Docker'],
            tags: ['Backend', 'Microservices']
          },
          {
            month: 'Month 3',
            focusArea: 'Cloud Deployment, DevOps & Infrastructure',
            description: 'Automated CI/CD pipelines, container orchestration, and cloud service deployments on AWS.',
            status: 'Not Started',
            skillsToLearn: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
            actionItems: ['Deploy multi-container app on ECS', 'Set up GitHub Actions workflow', 'Configure CloudFront distribution'],
            tags: ['Cloud', 'DevOps']
          },
          {
            month: 'Month 4',
            focusArea: 'High-Scale System Design & Interview Readiness',
            description: 'Designing distributed rate limiters, message queues, load balancers, and FAANG technical interview loops.',
            status: 'Not Started',
            skillsToLearn: ['System Design', 'Algorithms', 'High Availability'],
            actionItems: ['Complete 5 system design mock interviews', 'Review distributed consensus algorithms', 'Finalize production resume'],
            tags: ['System Design', 'Interview Prep']
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  // ==========================================
  // 13. SKILL BADGES & CERTIFICATES
  // ==========================================
  console.log('🏅 Seeding Skill Badges & Certificates for Activity Tracking...');
  await SkillBadge.findOneAndUpdate(
    { student: studentCheran._id, badgeName: 'Full-Stack Pioneer' },
    {
      $set: {
        student: studentCheran._id,
        badgeName: 'Full-Stack Pioneer',
        issuer: 'NEXORA Assessment Engine',
        issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    },
    { upsert: true, new: true }
  );

  await Certificate.findOneAndUpdate(
    { user: studentCheran._id, title: 'AWS Certified Cloud Practitioner' },
    {
      $set: {
        user: studentCheran._id,
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2025-01-15'),
        url: 'https://aws.amazon.com/verification/aws-cloud-cheran',
        skillsVerified: ['AWS', 'Cloud Computing', 'IAM', 'VPC', 'S3'],
        type: 'Course',
        status: 'Verified'
      }
    },
    { upsert: true, new: true }
  );

  // ==========================================
  // 14. IN-APP NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  console.log('🔔 Seeding System Notifications & Audit Logs...');
  const notifsData = [
    {
      recipient: studentCheran._id,
      type: 'SUCCESS',
      title: 'Congratulations! Official Offer from Amazon',
      message: 'Amazon has officially extended an offer for the Full Stack Developer position (24 LPA CTC). View offer details in Placement Tracking.',
      link: '/student/applications',
      read: false
    },
    {
      recipient: studentCheran._id,
      type: 'INFO',
      title: 'Interview Scheduled with Google',
      message: 'Your Technical System Design round with Marcus Vance at Google is confirmed for this Friday at 18:00 IST.',
      link: '/student/applications',
      read: false
    },
    {
      recipient: studentCheran._id,
      type: 'INFO',
      title: 'Mentorship Session Confirmed with Ravi Kumar',
      message: 'Ravi Kumar confirmed your 1-on-1 session: "Mock Behavioral & Technical Interview for Google".',
      link: '/student/mentorship-sessions',
      read: true
    },
    {
      recipient: placementHead._id,
      type: 'SUCCESS',
      title: 'New Placement Offer Issued: Amazon & Google',
      message: 'Cheran S and Sneha Patel have accepted placement offers at Amazon (24 LPA) and Google (28 LPA).',
      link: '/placement/tracking',
      read: false
    }
  ];

  for (const n of notifsData) {
    await Notification.findOneAndUpdate(
      { recipient: n.recipient, title: n.title },
      { $set: n },
      { upsert: true, new: true }
    );
  }

  // Audit Logs for Admin Dashboard
  const auditLogsData = [
    {
      actor: { id: placementHead._id, name: 'Dr. Sarah Jenkins', email: 'head@placement.edu', role: 'Placement' },
      action: 'DRIVE_PUBLISHED',
      entity: 'Job',
      severity: 'Info',
      details: 'Published campus placement drive for Google Frontend Engineer (24-32 LPA).'
    },
    {
      actor: { id: placementHead._id, name: 'Dr. Sarah Jenkins', email: 'head@placement.edu', role: 'Placement' },
      action: 'OFFER_STATUS_UPDATED',
      entity: 'Application',
      severity: 'Info',
      details: 'Recorded placement offer for student Cheran S at Amazon.'
    },
    {
      actor: { name: 'System Security Service', email: 'security@nexora.io', role: 'System' },
      action: 'SECURITY_AUDIT_PASSED',
      entity: 'Authentication',
      severity: 'Info',
      details: 'Automated OAuth2 token validation, rate-limiting, and RBAC integrity audit completed successfully.'
    },
    {
      actor: { id: placementHead._id, name: 'Dr. Sarah Jenkins', email: 'head@placement.edu', role: 'Placement' },
      action: 'PARTNER_ONBOARDED',
      entity: 'Company',
      severity: 'Info',
      details: 'Onboarded partner recruitment account for Atlassian Campus Hiring.'
    }
  ];

  for (const al of auditLogsData) {
    await AuditLog.findOneAndUpdate(
      { action: al.action, details: al.details },
      { $set: al },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 15. SKILL VALIDATION REQUESTS
  // ==========================================
  console.log('🛡️ Seeding Skill Validation Requests (Student & Alumni Inbox)...');
  const validationsData = [
    {
      student: studentCheran._id,
      alumni: alumniRavi._id,
      type: 'skill',
      skill: 'React & System Design',
      title: 'React Concurrent Mode & Fiber Architecture Validation',
      evidenceDescription: 'Engineered high-scale multi-tenant dashboards with virtualized lists and custom memoization hooks.',
      evidenceUrl: 'https://github.com/cheran-dev/nexora',
      status: 'Approved',
      reviewer: alumniRavi._id,
      feedback: 'Verified production-grade component state isolation, clean prop lifting, and optimal reconciliation patterns.'
    },
    {
      student: studentCheran._id,
      alumni: alumniCheranSuresh._id,
      type: 'project',
      skill: 'Distributed Node.js Microservices',
      title: 'Microservice Task Flow Engine',
      evidenceDescription: 'Distributed queue worker with Redis and RabbitMQ handling asynchronous telemetry events.',
      evidenceUrl: 'https://github.com/cheran-dev/task-flow',
      status: 'Demonstrated',
      reviewer: alumniCheranSuresh._id,
      feedback: 'Excellent idempotent task execution and clean Docker container orchestration.'
    },
    {
      student: studentCheran._id,
      alumni: alumniPriya._id,
      type: 'skill',
      skill: 'AWS Cloud & Docker',
      title: 'Multi-Stage Docker & Cloud Architecture Verification',
      evidenceDescription: 'Containerized multi-tier MERN stack with automated health probes and IAM isolation.',
      evidenceUrl: 'https://github.com/cheran-dev',
      status: 'Pending'
    },
    {
      student: studentSneha._id,
      alumni: alumniRavi._id,
      type: 'skill',
      skill: 'TypeScript & Web Performance',
      title: 'TypeScript Generics & Web Vitals Audit',
      evidenceDescription: 'Refactored frontend component library with zero typescript errors and 98+ Lighthouse score.',
      evidenceUrl: 'https://github.com/snehapatel-dev',
      status: 'Pending'
    },
    {
      student: studentAditya._id,
      alumni: alumniAravind._id,
      type: 'project',
      skill: 'Go & Database Indexing',
      title: 'Distributed Transactional Ledger in Go',
      evidenceDescription: 'ACID-compliant banking ledger engine with two-phase commit support and Redis caching.',
      evidenceUrl: 'https://github.com/adityaroy-dev',
      status: 'Approved',
      reviewer: alumniAravind._id,
      feedback: 'Exceptional lock granularity and solid test coverage.'
    }
  ];

  for (const v of validationsData) {
    await SkillValidationRequest.findOneAndUpdate(
      { student: v.student, alumni: v.alumni, title: v.title },
      { $set: v },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 16. ALUMNI CONNECTIONS
  // ==========================================
  console.log('👥 Seeding Alumni-Student Connections...');
  const connectionsData = [
    {
      student: studentCheran._id,
      alumni: alumniRavi._id,
      status: 'Accepted',
      notes: 'Mentorship connection for Google Frontend Engineering preparation.'
    },
    {
      student: studentCheran._id,
      alumni: alumniCheranSuresh._id,
      status: 'Accepted',
      notes: 'Full-stack software engineering career guidance at Atlassian.'
    },
    {
      student: studentCheran._id,
      alumni: alumniPriya._id,
      status: 'Accepted',
      notes: 'AI/ML systems engineering and deep learning application guidance.'
    },
    {
      student: studentSneha._id,
      alumni: alumniRavi._id,
      status: 'Pending',
      notes: 'Aspiring frontend developer seeking feedback on portfolio projects.'
    },
    {
      student: studentAditya._id,
      alumni: alumniAravind._id,
      status: 'Accepted',
      notes: 'Distributed cloud systems and backend infrastructure mentoring.'
    }
  ];

  for (const c of connectionsData) {
    await AlumniConnection.findOneAndUpdate(
      { student: c.student, alumni: c.alumni },
      { $set: c },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 17. OFFICIAL ANNOUNCEMENTS
  // ==========================================
  console.log('📢 Seeding Official Announcements...');
  const announcementsData = [
    {
      title: 'Phase 1 Campus Recruitment Season 2026 Commences',
      content: 'Tier-1 technology partners including Google, Microsoft, Amazon, Atlassian, Swiggy, and Razorpay are conducting campus hiring drives over the next 6 weeks. Review your ATS profile and ensure your resumes are up to date.',
      audience: 'ALL',
      priority: 'Urgent',
      status: 'Published',
      authorName: 'Dr. Sarah Jenkins'
    },
    {
      title: 'Google Software Engineering Summer 2026 Internship Open',
      content: 'Applications are now open for 2026 and 2027 batch undergraduate engineers. Technical coding assessments will be conducted on the NEXORA Assessment Engine.',
      audience: 'STUDENTS',
      priority: 'High',
      status: 'Published',
      authorName: 'University Recruiting Cell'
    },
    {
      title: 'Alumni Mentorship Weekend: 1-on-1 Mock Interview Loop',
      content: 'Calling all verified alumni! We invite our alumni community across top engineering firms to host 30-minute mock technical and behavioral loops this weekend.',
      audience: 'ALUMNI',
      priority: 'Normal',
      status: 'Published',
      authorName: 'Alumni Relations Team'
    }
  ];

  for (const a of announcementsData) {
    await Announcement.findOneAndUpdate(
      { title: a.title },
      { $set: a },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 18. HIRING DRIVES
  // ==========================================
  console.log('🚀 Seeding Campus Hiring Drives...');
  const hiringDrivesData = [
    {
      name: 'Google Campus Blitz 2026',
      company: 'Google',
      status: 'Active',
      locations: ['Bangalore', 'Hyderabad', 'Hybrid'],
      applied: 24,
      assessed: 18,
      interviewed: 8,
      offered: 3,
      description: 'Annual campus drive for Frontend Engineer, SWE Intern, and Cloud Infrastructure roles.',
      createdBy: recruiterGoogle._id
    },
    {
      name: 'Microsoft Azure Engineering Sprint',
      company: 'Microsoft',
      status: 'Active',
      locations: ['Bangalore', 'Hyderabad'],
      applied: 19,
      assessed: 15,
      interviewed: 6,
      offered: 2,
      description: 'Exclusive campus recruitment drive for Azure Core Systems and Cloud Platform engineering.',
      createdBy: recruiterMicrosoft._id
    },
    {
      name: 'Amazon Campus Tech Drive 2026',
      company: 'Amazon',
      status: 'Active',
      locations: ['Chennai', 'Bangalore'],
      applied: 22,
      assessed: 16,
      interviewed: 7,
      offered: 4,
      description: 'Recruitment for Full Stack Developers, Distributed SDE-1, and AWS Cloud Architects.',
      createdBy: recruiterAmazon._id
    }
  ];

  for (const hd of hiringDrivesData) {
    await HiringDrive.findOneAndUpdate(
      { name: hd.name },
      { $set: hd },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 19. SCHOLARSHIPS & FELLOWSHIPS
  // ==========================================
  console.log('🎓 Seeding Scholarships & Fellowships...');
  const scholarshipsData = [
    {
      title: 'NEXORA STEM Excellence Leadership Grant 2026',
      provider: placementHead._id,
      amount: 5000,
      currency: 'USD',
      description: 'Merit-based fellowship awarded to students demonstrating exemplary open-source contributions, academic consistency, and career roadmap execution.',
      deadline: in45Days,
      requirements: ['Enrolled undergraduate student', 'CGPA >= 8.5', 'Active open source project portfolio'],
      eligibility: { minGpa: 8.5, majors: ['Computer Science', 'Information Technology', 'AI & DS'], yearOfStudy: ['3rd Year', '4th Year'] },
      status: 'Open'
    },
    {
      title: 'AWS Cloud Solutions Student Fellowship',
      provider: recruiterAmazon._id,
      amount: 3500,
      currency: 'USD',
      description: 'Sponsored by AWS APAC to support students pursuing cloud architecture certifications and building distributed cloud systems.',
      deadline: in30Days,
      requirements: ['Cloud practitioner certification or coursework', 'Hands-on AWS architecture project demo'],
      eligibility: { minGpa: 8.0, majors: ['CSE', 'IT', 'ECE'], yearOfStudy: ['3rd Year', '4th Year'] },
      status: 'Open'
    }
  ];

  for (const s of scholarshipsData) {
    await Scholarship.findOneAndUpdate(
      { title: s.title },
      { $set: s },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 20. HACKATHON EVENTS
  // ==========================================
  console.log('⚡ Seeding Campus Hackathons & Contests...');
  const hackathonsData = [
    {
      organizer: placementHead._id,
      eventName: 'NEXORA Global Builders Hackathon 2026',
      theme: 'Next-Gen Multi-Agent Systems & Student Intelligence Platforms',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      participants: [studentCheran._id, studentSneha._id, studentAditya._id, studentAnanya._id],
      status: 'Upcoming'
    },
    {
      organizer: recruiterGoogle._id,
      eventName: 'Google Solution Challenge Campus Sprint',
      theme: 'Building for Social Good using Gemini & Google Cloud APIs',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      participants: [studentCheran._id, studentSneha._id],
      status: 'Live'
    }
  ];

  for (const h of hackathonsData) {
    await HackathonEvent.findOneAndUpdate(
      { eventName: h.eventName },
      { $set: h },
      { upsert: true, new: true }
    );
  }

  console.log('✨ Safe, non-destructive demo seeding completed successfully!');
  return { success: true };
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('safe_demo_seed.js')) {
  runSafeDemoSeed()
    .then(() => {
      console.log('🎉 All dashboards successfully populated with coherent demo records!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}
