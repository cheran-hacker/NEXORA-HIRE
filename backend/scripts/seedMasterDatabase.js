import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import all applicable models
import { User } from '../src/models/User.js';
import { CareerTarget } from '../src/models/CareerTarget.js';
import { RoleSkillMap } from '../src/models/RoleSkillMap.js';
import { Skill } from '../src/models/Skill.js';
import { StudentSkill } from '../src/models/StudentSkill.js';
import { Job } from '../src/models/Job.js';
import { Application } from '../src/models/Application.js';
import { Assessment } from '../src/models/Assessment.js';
import { Submission } from '../src/models/Submission.js';
import { ResumeAnalysis } from '../src/models/ResumeAnalysis.js';
import { AlumniConnection } from '../src/models/AlumniConnection.js';
import { MentorshipSession } from '../src/models/MentorshipSession.js';
import { MentorAvailability } from '../src/models/MentorAvailability.js';
import { Bounty } from '../src/models/Bounty.js';
import { Announcement } from '../src/models/Announcement.js';
import { Notification } from '../src/models/Notification.js';
import { HiringDrive } from '../src/models/HiringDrive.js';
import { HackathonEvent } from '../src/models/HackathonEvent.js';
import { CapstoneProject } from '../src/models/CapstoneProject.js';
import { SkillBadge } from '../src/models/SkillBadge.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Student-ecosystem';

async function seedMasterData() {
  console.log('🚀 Starting NEXORA Idempotent Database Seeding...');
  console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI.split('@').pop()}`);

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas successfully.');

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('Admin@123', salt);

  // ==========================================
  // 1. SEED / UPSERT USERS
  // ==========================================
  console.log('\n👤 Seeding core user accounts (Admin, Placement, Alumni, Students)...');

  const usersToSeed = [
    // Admin
    {
      email: 'admin@nexora.io',
      name: 'Super Admin',
      role: 'Admin',
      status: 'Active',
      isVerified: true
    },
    // Placement / Recruiters
    {
      email: 'head@placement.edu',
      name: 'Dr. Sarah Jenkins',
      role: 'Placement',
      status: 'Active',
      isVerified: true,
      placementProfile: {
        department: 'Central Placement Office',
        designation: 'Director of Career Services & Placement',
        companyName: 'NEXORA University Placement Cell',
        companyWebsite: 'https://nexora.edu/placements',
        verified: true
      }
    },
    {
      email: 'recruiter@google.com',
      name: 'Marcus Vance',
      role: 'Placement',
      status: 'Active',
      isVerified: true,
      placementProfile: {
        department: 'University Talent Acquisition',
        designation: 'Lead University Recruiter',
        companyName: 'Google India',
        companyWebsite: 'https://careers.google.com',
        verified: true
      }
    },
    // Alumni
    {
      email: 'ravi.k@alumni.edu',
      name: 'Ravi Kumar',
      role: 'Alumni',
      status: 'Active',
      isVerified: true,
      alumniProfile: {
        company: 'Google',
        designation: 'Senior Software Engineer (L5)',
        industry: 'Cloud Infrastructure & Distributed Systems',
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2021,
        degree: 'B.Tech Information Technology',
        experienceYears: 5,
        location: 'Bangalore, India',
        bio: 'Passionate about distributed storage, high-throughput systems, and mentoring engineering undergrads to crack Tier-1 product companies.',
        expertise: ['System Design', 'Distributed Systems', 'Go', 'React', 'Kubernetes'],
        available: true,
        rating: 4.9,
        sessionsCount: 38
      }
    },
    {
      email: 'priya.s@alumni.edu',
      name: 'Priya Sharma',
      role: 'Alumni',
      status: 'Active',
      isVerified: true,
      alumniProfile: {
        company: 'Microsoft',
        designation: 'Principal Solutions Architect',
        industry: 'Azure Cloud & Enterprise Solutions',
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2019,
        degree: 'B.E Computer Science',
        experienceYears: 7,
        location: 'Hyderabad, India',
        bio: 'Helping future architects navigate multi-cloud platforms, microservices architecture, and scalable design patterns.',
        expertise: ['Azure', 'Microservices', 'System Design', 'C#/.NET', 'DevOps'],
        available: true,
        rating: 4.95,
        sessionsCount: 52
      }
    },
    {
      email: 'aravind.n@alumni.edu',
      name: 'Aravind Nair',
      role: 'Alumni',
      status: 'Active',
      isVerified: true,
      alumniProfile: {
        company: 'Amazon Web Services',
        designation: 'Staff SRE / DevOps Lead',
        industry: 'Cloud Reliability & Platform Engineering',
        college: 'Bannari Amman Institute of Technology',
        graduationYear: 2020,
        degree: 'B.Tech Information Technology',
        experienceYears: 6,
        location: 'Bangalore, India',
        bio: 'Site Reliability Engineering and Platform Infrastructure enthusiast. Always happy to guide students in Linux, Docker, and CI/CD.',
        expertise: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Linux'],
        available: true,
        rating: 4.88,
        sessionsCount: 29
      }
    },
    // Students
    {
      email: 'cheran.it23@bitsathy.ac.in',
      name: 'Cheran S',
      role: 'Student',
      status: 'Active',
      isVerified: true,
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Information Technology',
        batchYear: 2026,
        cgpa: 8.9,
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Python', 'Git', 'AWS', 'Tailwind CSS'],
        preferredRoles: 'Full Stack Developer',
        targetCareerRole: 'Full Stack Developer',
        careerTarget: 'Full Stack Developer',
        readinessScore: 88,
        resumeScore: 92,
        verified: true,
        githubUrl: 'https://github.com/cheran-dev',
        linkedinUrl: 'https://linkedin.com/in/cheran-s',
        websiteUrl: 'https://cheran.dev',
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
          { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2025' },
          { name: 'Meta Full-Stack Developer Professional Certificate', issuer: 'Coursera / Meta', date: '2024' }
        ]
      }
    },
    {
      email: 'sneha@student.edu',
      name: 'Sneha Patel',
      role: 'Student',
      status: 'Active',
      isVerified: true,
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Computer Science and Engineering',
        batchYear: 2026,
        cgpa: 9.2,
        skills: ['React', 'Node.js', 'Python', 'TypeScript', 'Data Structures', 'System Design'],
        preferredRoles: 'Full Stack Developer',
        targetCareerRole: 'Full Stack Developer',
        careerTarget: 'Full Stack Developer',
        readinessScore: 91,
        resumeScore: 94,
        verified: true,
        githubUrl: 'https://github.com/snehapatel',
        linkedinUrl: 'https://linkedin.com/in/sneha-patel',
        projects: [
          {
            name: 'Real-Time Collaborative Code Studio',
            stack: 'React, WebSockets, Node.js, Monaco Editor',
            desc: 'Low-latency multiplayer code editor with instant test execution and voice chat.',
            github: 'https://github.com/snehapatel/code-studio'
          }
        ]
      }
    },
    {
      email: 'aditya.r@student.edu',
      name: 'Aditya Roy',
      role: 'Student',
      status: 'Active',
      isVerified: true,
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Information Technology',
        batchYear: 2026,
        cgpa: 8.7,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Python', 'Go', 'CI/CD'],
        preferredRoles: 'Cloud & DevOps Architect',
        targetCareerRole: 'Cloud & DevOps Architect',
        careerTarget: 'Cloud & DevOps Architect',
        readinessScore: 84,
        resumeScore: 89,
        verified: true,
        githubUrl: 'https://github.com/adityaroy-dev',
        linkedinUrl: 'https://linkedin.com/in/aditya-roy'
      }
    },
    {
      email: 'ananya.k@student.edu',
      name: 'Ananya Krishnan',
      role: 'Student',
      status: 'Active',
      isVerified: true,
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Artificial Intelligence & Data Science',
        batchYear: 2026,
        cgpa: 9.4,
        skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'FastAPI', 'Pandas', 'Scikit-learn'],
        preferredRoles: 'AI / Machine Learning Engineer',
        targetCareerRole: 'AI / Machine Learning Engineer',
        careerTarget: 'AI / Machine Learning Engineer',
        readinessScore: 93,
        resumeScore: 96,
        verified: true,
        githubUrl: 'https://github.com/ananya-ai',
        linkedinUrl: 'https://linkedin.com/in/ananya-krishnan'
      }
    },
    {
      email: 'rohan.m@student.edu',
      name: 'Rohan Menon',
      role: 'Student',
      status: 'Active',
      isVerified: true,
      studentProfile: {
        college: 'Bannari Amman Institute of Technology',
        branch: 'Computer Science and Engineering',
        batchYear: 2026,
        cgpa: 8.5,
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Next.js', 'HTML', 'CSS'],
        preferredRoles: 'Frontend Engineer',
        targetCareerRole: 'Frontend Engineer',
        careerTarget: 'Frontend Engineer',
        readinessScore: 82,
        resumeScore: 88,
        verified: true,
        githubUrl: 'https://github.com/rohan-frontend',
        linkedinUrl: 'https://linkedin.com/in/rohan-menon'
      }
    }
  ];

  const userMap = {};

  for (const uData of usersToSeed) {
    const existing = await User.findOne({ email: uData.email });
    if (existing) {
      // Update existing user with rich profile fields without replacing password
      const updatePayload = {
        name: uData.name,
        role: uData.role,
        status: uData.status,
        ...(uData.studentProfile ? { studentProfile: { ...existing.studentProfile?.toObject(), ...uData.studentProfile } } : {}),
        ...(uData.alumniProfile ? { alumniProfile: { ...existing.alumniProfile?.toObject(), ...uData.alumniProfile } } : {}),
        ...(uData.placementProfile ? { placementProfile: { ...existing.placementProfile?.toObject(), ...uData.placementProfile } } : {})
      };
      const updated = await User.findByIdAndUpdate(existing._id, { $set: updatePayload }, { new: true });
      userMap[uData.email] = updated;
      console.log(`  ✓ Updated existing user: ${uData.email} (${uData.role})`);
    } else {
      const created = await User.create({
        ...uData,
        password: defaultPassword
      });
      userMap[uData.email] = created;
      console.log(`  ✓ Created new user: ${uData.email} (${uData.role})`);
    }
  }

  // ==========================================
  // 2. SEED ROLE-SKILL MAPS
  // ==========================================
  console.log('\n🗺️ Seeding Role-Skill Maps...');
  const roleSkillData = [
    {
      roleName: 'Full Stack Developer',
      requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Git', 'HTML', 'CSS'],
      optionalSkills: ['Docker', 'AWS', 'TypeScript', 'GraphQL', 'Tailwind CSS', 'Redis'],
      industryTrends: ['Next.js App Router', 'Server Actions', 'Fullstack TypeScript', 'Microfrontends']
    },
    {
      roleName: 'Cloud & DevOps Architect',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux', 'Terraform'],
      optionalSkills: ['Python', 'Go', 'Prometheus', 'Grafana', 'Ansible', 'GitOps'],
      industryTrends: ['Platform Engineering', 'FinOps Cloud Cost Optimization', 'eBPF Observability']
    },
    {
      roleName: 'AI / Machine Learning Engineer',
      requiredSkills: ['Python', 'Machine Learning', 'Data Structures', 'PyTorch', 'SQL', 'FastAPI'],
      optionalSkills: ['Docker', 'MLOps', 'Vector Databases', 'Hugging Face', 'LangChain'],
      industryTrends: ['Retrieval-Augmented Generation (RAG)', 'Autonomous Agent Workflows', 'Model Quantization']
    },
    {
      roleName: 'Frontend Engineer',
      requiredSkills: ['React', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'JavaScript', 'Git'],
      optionalSkills: ['Next.js', 'Figma', 'Jest/Cypress', 'Redux', 'Performance Optimization'],
      industryTrends: ['Core Web Vitals Optimization', 'Server Components', 'Design Systems Architecture']
    },
    {
      roleName: 'Backend Platform Engineer',
      requiredSkills: ['Node.js', 'Java', 'SQL', 'System Design', 'Data Structures', 'Distributed Systems'],
      optionalSkills: ['Redis', 'Kafka', 'Docker', 'Kubernetes', 'gRPC'],
      industryTrends: ['Event-Driven Architectures', 'Zero-Trust Internal Mesh', 'Distributed Caching']
    }
  ];

  const roleMapDocs = {};
  for (const r of roleSkillData) {
    const doc = await RoleSkillMap.findOneAndUpdate(
      { roleName: r.roleName },
      { $set: r },
      { upsert: true, new: true }
    );
    roleMapDocs[r.roleName] = doc;
    console.log(`  ✓ Seeded RoleSkillMap: ${r.roleName}`);
  }

  // ==========================================
  // 3. SEED CORE SKILLS & STUDENT SKILLS
  // ==========================================
  console.log('\n💻 Seeding standardized Skills & StudentSkills...');
  const skillsList = [
    { name: 'React', normalizedName: 'react', category: 'Technical' },
    { name: 'Node.js', normalizedName: 'node.js', category: 'Technical' },
    { name: 'MongoDB', normalizedName: 'mongodb', category: 'Technical' },
    { name: 'Express', normalizedName: 'express', category: 'Technical' },
    { name: 'TypeScript', normalizedName: 'typescript', category: 'Language' },
    { name: 'Python', normalizedName: 'python', category: 'Language' },
    { name: 'AWS', normalizedName: 'aws', category: 'Technical' },
    { name: 'Docker', normalizedName: 'docker', category: 'Technical' },
    { name: 'Kubernetes', normalizedName: 'kubernetes', category: 'Technical' },
    { name: 'System Design', normalizedName: 'system design', category: 'Technical' },
    { name: 'Data Structures', normalizedName: 'data structures', category: 'Technical' },
    { name: 'Machine Learning', normalizedName: 'machine learning', category: 'Technical' },
    { name: 'PyTorch', normalizedName: 'pytorch', category: 'Technical' },
    { name: 'Tailwind CSS', normalizedName: 'tailwind css', category: 'Technical' },
    { name: 'Git', normalizedName: 'git', category: 'Technical' }
  ];

  const skillDocs = {};
  for (const s of skillsList) {
    const doc = await Skill.findOneAndUpdate(
      { normalizedName: s.normalizedName },
      { $set: s },
      { upsert: true, new: true }
    );
    skillDocs[s.name] = doc;
  }

  // Link skills to students
  const studentEmails = ['cheran.it23@bitsathy.ac.in', 'sneha@student.edu', 'aditya.r@student.edu', 'ananya.k@student.edu', 'rohan.m@student.edu'];
  for (const email of studentEmails) {
    const studentUser = userMap[email];
    if (studentUser && studentUser.studentProfile?.skills) {
      for (const skillName of studentUser.studentProfile.skills) {
        if (skillDocs[skillName]) {
          await StudentSkill.findOneAndUpdate(
            { studentId: studentUser._id, skillId: skillDocs[skillName]._id },
            {
              $set: {
                studentId: studentUser._id,
                skillId: skillDocs[skillName]._id,
                proficiency: 85,
                source: 'profile',
                verified: true
              }
            },
            { upsert: true, new: true }
          );
        }
      }
    }
  }
  console.log(`  ✓ Linked normalized skills for ${studentEmails.length} students`);

  // ==========================================
  // 4. SEED CAREERTARGET COLLECTION
  // ==========================================
  console.log('\n🎯 Seeding persistent CareerTarget documents in MongoDB...');

  const studentTargetSpecs = [
    {
      email: 'cheran.it23@bitsathy.ac.in',
      targetRole: 'Full Stack Developer',
      targetCompanies: ['Google', 'Microsoft', 'Atlassian', 'Amazon'],
      preferredLocations: ['Bangalore', 'Coimbatore', 'Remote'],
      preferredWorkModes: ['Hybrid', 'Remote'],
      preferredJobTypes: ['Full-Time']
    },
    {
      email: 'sneha@student.edu',
      targetRole: 'Full Stack Developer',
      targetCompanies: ['Google', 'Meta', 'Stripe', 'Atlassian'],
      preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
      preferredWorkModes: ['Hybrid', 'Remote'],
      preferredJobTypes: ['Full-Time']
    },
    {
      email: 'aditya.r@student.edu',
      targetRole: 'Cloud & DevOps Architect',
      targetCompanies: ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud', 'Uber'],
      preferredLocations: ['Bangalore', 'Remote'],
      preferredWorkModes: ['Hybrid', 'Remote'],
      preferredJobTypes: ['Full-Time']
    },
    {
      email: 'ananya.k@student.edu',
      targetRole: 'AI / Machine Learning Engineer',
      targetCompanies: ['OpenAI', 'Microsoft Research', 'Google DeepMind', 'NVIDIA'],
      preferredLocations: ['Bangalore', 'Remote'],
      preferredWorkModes: ['Remote', 'Hybrid'],
      preferredJobTypes: ['Full-Time']
    },
    {
      email: 'rohan.m@student.edu',
      targetRole: 'Frontend Engineer',
      targetCompanies: ['Vercel', 'Linear', 'Airbnb', 'Atlassian'],
      preferredLocations: ['Bangalore', 'Remote'],
      preferredWorkModes: ['Remote', 'Hybrid'],
      preferredJobTypes: ['Full-Time']
    }
  ];

  for (const spec of studentTargetSpecs) {
    const studentUser = userMap[spec.email];
    if (!studentUser) continue;

    const roleMapDoc = roleMapDocs[spec.targetRole];

    const savedTarget = await CareerTarget.findOneAndUpdate(
      { studentId: studentUser._id },
      {
        $set: {
          studentId: studentUser._id,
          targetRole: spec.targetRole,
          roleId: roleMapDoc ? roleMapDoc._id : undefined,
          targetCompanies: spec.targetCompanies,
          preferredLocations: spec.preferredLocations,
          preferredWorkModes: spec.preferredWorkModes,
          preferredJobTypes: spec.preferredJobTypes
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Synchronize with User.studentProfile
    await User.findByIdAndUpdate(studentUser._id, {
      $set: {
        'studentProfile.targetCareerRole': spec.targetRole,
        'studentProfile.careerTarget': spec.targetRole,
        'studentProfile.preferredRoles': spec.targetRole
      }
    });

    console.log(`  ✓ Persisted CareerTarget for ${spec.email} -> "${savedTarget.targetRole}"`);
  }

  // ==========================================
  // 5. SEED JOBS & OPPORTUNITIES
  // ==========================================
  console.log('\n💼 Seeding Job & Internship opportunities...');
  const recruiterUser = userMap['recruiter@google.com'] || userMap['head@placement.edu'];
  const placementOfficer = userMap['head@placement.edu'];

  const jobsData = [
    {
      title: 'Full Stack Software Engineer (React / Node)',
      company: 'Google',
      recruiterId: recruiterUser._id,
      type: 'Full-Time',
      location: 'Bangalore, Hybrid',
      description: 'Join the Google Workspace & Core Platform engineering group. Build high-availability distributed frontends and cloud service integrations.',
      requirements: ['Strong foundations in Data Structures and Algorithms', 'Fluency in Modern React, TypeScript, and Node.js', 'Experience building RESTful and gRPC microservices'],
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'System Design'],
      salary: { min: 2400000, max: 3800000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      eligibleBranches: ['Computer Science and Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
      minimumCGPA: 8.0,
      status: 'Open',
      approvalStatus: 'Approved',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Senior Frontend Architect',
      company: 'Atlassian',
      recruiterId: placementOfficer._id,
      type: 'Full-Time',
      location: 'Bangalore, Hybrid',
      description: 'Design world-class developer tools and next-generation collaboration interfaces used by millions of developers worldwide.',
      requirements: ['Mastery in React, Component Architecture, and Web Performance', 'Experience with Microfrontends, Design Systems, and TypeScript'],
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Git', 'Testing'],
      salary: { min: 2800000, max: 4200000, currency: 'INR' },
      experience: '1-3 years',
      eligibleBatches: [2025, 2026],
      minimumCGPA: 7.5,
      status: 'Open',
      approvalStatus: 'Approved',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Cloud DevOps & Infrastructure Intern',
      company: 'Amazon Web Services',
      recruiterId: placementOfficer._id,
      type: 'Internship',
      location: 'Remote',
      description: 'Summer 2026 internship focusing on AWS containerized services, automated CI/CD deployments, and Linux virtualization.',
      requirements: ['Currently enrolled in B.Tech/B.E in CS/IT', 'Familiarity with AWS, Docker, Linux, and Shell Scripting'],
      skills: ['AWS', 'Docker', 'Linux', 'Kubernetes', 'CI/CD Pipelines'],
      salary: { min: 100000, max: 140000, currency: 'INR' },
      experience: 'Fresher',
      eligibleBatches: [2026, 2027],
      minimumCGPA: 8.0,
      status: 'Open',
      approvalStatus: 'Approved',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'AI / Machine Learning Engineer',
      company: 'Microsoft Research',
      recruiterId: placementOfficer._id,
      type: 'Full-Time',
      location: 'Hyderabad, Hybrid',
      description: 'Work with world-renowned AI researchers on fine-tuning foundational models, multimodal agent pipelines, and high-throughput inference engines.',
      requirements: ['Strong math foundations, linear algebra, and probability', 'Proficiency in Python, PyTorch, Hugging Face, and Vector DBs'],
      skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'FastAPI'],
      salary: { min: 2600000, max: 4000000, currency: 'INR' },
      experience: '0-2 years',
      eligibleBatches: [2025, 2026],
      minimumCGPA: 8.5,
      status: 'Open',
      approvalStatus: 'Approved',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Backend Platform Engineer (Distributed Systems)',
      company: 'Stripe',
      recruiterId: recruiterUser._id,
      type: 'Full-Time',
      location: 'Bangalore, Hybrid',
      description: 'Scale financial infrastructure that moves hundreds of billions of dollars across the global economy with five-nines reliability.',
      requirements: ['Deep understanding of ACID transactions, distributed consistency, and concurrency', 'Proficiency in Node.js, Go, or Java'],
      skills: ['Node.js', 'System Design', 'Data Structures', 'MongoDB', 'Redis'],
      salary: { min: 3000000, max: 4800000, currency: 'INR' },
      experience: '1-3 years',
      eligibleBatches: [2025, 2026],
      minimumCGPA: 8.0,
      status: 'Open',
      approvalStatus: 'Approved',
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
    }
  ];

  const jobDocs = [];
  for (const j of jobsData) {
    const jobDoc = await Job.findOneAndUpdate(
      { title: j.title, company: j.company },
      { $set: j },
      { upsert: true, new: true }
    );
    jobDocs.push(jobDoc);
    console.log(`  ✓ Seeded Job: "${j.title}" at ${j.company}`);
  }

  // ==========================================
  // 6. SEED STUDENT APPLICATIONS
  // ==========================================
  console.log('\n📄 Seeding student Job Applications...');
  const cheranUser = userMap['cheran.it23@bitsathy.ac.in'];
  const snehaUser = userMap['sneha@student.edu'];
  const adityaUser = userMap['aditya.r@student.edu'];

  const applicationSpecs = [
    {
      student: cheranUser,
      job: jobDocs[0], // Google Full Stack
      status: 'Shortlisted',
      atsScore: 92,
      matched: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'AWS', 'Git'],
      missing: ['TypeScript', 'gRPC'],
      summary: 'Strong match for Google Full Stack Engineer. Excellent React & Node portfolio with high readiness score.'
    },
    {
      student: cheranUser,
      job: jobDocs[1], // Atlassian Frontend
      status: 'Applied',
      atsScore: 88,
      matched: ['React', 'HTML', 'CSS', 'Tailwind CSS', 'Git'],
      missing: ['Testing'],
      summary: 'Solid frontend capabilities with verified portfolio projects.'
    },
    {
      student: snehaUser,
      job: jobDocs[0], // Google Full Stack
      status: 'Interview',
      atsScore: 95,
      matched: ['React', 'Node.js', 'Python', 'TypeScript', 'Data Structures'],
      missing: [],
      summary: 'Top percentile candidate with exceptional algorithmic mastery and clean project architecture.'
    },
    {
      student: adityaUser,
      job: jobDocs[2], // AWS Cloud Intern
      status: 'Shortlisted',
      atsScore: 90,
      matched: ['AWS', 'Docker', 'Linux', 'Kubernetes', 'CI/CD Pipelines'],
      missing: [],
      summary: 'High aptitude for cloud infrastructure and automated container pipelines.'
    }
  ];

  for (const app of applicationSpecs) {
    if (!app.student || !app.job) continue;

    await Application.findOneAndUpdate(
      { jobId: app.job._id, studentId: app.student._id },
      {
        $set: {
          jobId: app.job._id,
          studentId: app.student._id,
          resumeUrl: '/uploads/resumes/Candidate-Verified-Resume.pdf',
          coverLetter: `I am thrilled to apply for the ${app.job.title} position at ${app.job.company}. My verified technical coursework, projects, and active target role align perfectly with this mission.`,
          status: app.status,
          aiAnalysis: {
            atsScore: app.atsScore,
            matchedSkills: app.matched,
            missingSkills: app.missing,
            summary: app.summary
          },
          appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Application seeded: ${app.student.name} -> ${app.job.company} (${app.status})`);
  }

  // ==========================================
  // 7. SEED ASSESSMENTS & SUBMISSIONS
  // ==========================================
  console.log('\n📝 Seeding Assessments & Submissions...');
  const assessmentsToSeed = [
    {
      title: 'Full Stack JavaScript & Node.js Mastery Benchmark',
      description: 'Comprehensive evaluation covering modern JavaScript ES6+, asynchronous Event Loop, Node.js streams, React component lifecycle, and MongoDB query optimization.',
      createdBy: placementOfficer._id,
      type: 'Technical',
      durationMinutes: 45,
      status: 'Published',
      settings: { shuffleQuestions: true, showResultsImmediately: true },
      questions: [
        {
          type: 'MCQ',
          content: 'What is the primary difference between microtasks (e.g., Promise callbacks) and macrotasks (e.g., setTimeout) in the Node.js Event Loop?',
          marks: 2,
          difficulty: 'Medium',
          options: [
            { text: 'Microtasks execute immediately after the current operation finishes and before the next macrotask in the queue.', isCorrect: true },
            { text: 'Macrotasks always execute with higher priority than Promise resolutions.', isCorrect: false },
            { text: 'There is no execution priority difference in V8 runtime.', isCorrect: false },
            { text: 'Microtasks only run in the Browser and not in Node.js.', isCorrect: false }
          ]
        },
        {
          type: 'MCQ',
          content: 'Which HTTP method should be idempotent and used to completely replace an existing resource representation in REST API design?',
          marks: 2,
          difficulty: 'Easy',
          options: [
            { text: 'PUT', isCorrect: true },
            { text: 'POST', isCorrect: false },
            { text: 'PATCH', isCorrect: false },
            { text: 'DELETE', isCorrect: false }
          ]
        },
        {
          type: 'MCQ',
          content: 'In MongoDB, how does a Compound Index with keys { branch: 1, cgpa: -1 } support sorting queries?',
          marks: 2,
          difficulty: 'Hard',
          options: [
            { text: 'It efficiently supports queries sorting by branch ascending and cgpa descending (or exact inverse).', isCorrect: true },
            { text: 'It can only sort when both keys are ascending.', isCorrect: false },
            { text: 'Compound indexes cannot be used for sorting.', isCorrect: false },
            { text: 'It requires an in-memory sort buffer for every query.', isCorrect: false }
          ]
        }
      ]
    },
    {
      title: 'Data Structures & Algorithms Core Challenge',
      description: 'Algorithms benchmark covering Dynamic Programming, Graph Traversals (BFS/DFS), and Binary Trees.',
      createdBy: placementOfficer._id,
      type: 'Coding',
      durationMinutes: 60,
      status: 'Published',
      settings: { shuffleQuestions: false, showResultsImmediately: true },
      questions: [
        {
          type: 'MCQ',
          content: 'What is the average time complexity of searching in an optimized Balanced Binary Search Tree (e.g., AVL or Red-Black Tree)?',
          marks: 3,
          difficulty: 'Medium',
          options: [
            { text: 'O(log N)', isCorrect: true },
            { text: 'O(N)', isCorrect: false },
            { text: 'O(1)', isCorrect: false },
            { text: 'O(N log N)', isCorrect: false }
          ]
        }
      ]
    }
  ];

  const assessmentDocs = [];
  for (const aData of assessmentsToSeed) {
    const doc = await Assessment.findOneAndUpdate(
      { title: aData.title },
      { $set: aData },
      { upsert: true, new: true }
    );
    assessmentDocs.push(doc);
    console.log(`  ✓ Assessment seeded: "${doc.title}"`);
  }

  // Seed Submissions for Cheran & Sneha
  if (cheranUser && assessmentDocs.length > 0) {
    const aDoc = assessmentDocs[0];
    const q1 = aDoc.questions[0];
    const opt1 = q1.options.find(o => o.isCorrect);

    await Submission.findOneAndUpdate(
      { assessmentId: aDoc._id, studentId: cheranUser._id },
      {
        $set: {
          assessmentId: aDoc._id,
          studentId: cheranUser._id,
          status: 'Evaluated',
          startTime: new Date(Date.now() - 40 * 60 * 1000),
          submitTime: new Date(Date.now() - 10 * 60 * 1000),
          totalScore: 6,
          answers: [
            {
              questionId: q1._id,
              selectedOptionId: opt1?._id,
              isCorrect: true,
              marksAwarded: 2
            }
          ]
        }
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Assessment Submission seeded for Cheran S (Score: 100%)`);
  }

  // ==========================================
  // 8. SEED RESUME ANALYSIS RECORDS
  // ==========================================
  console.log('\n📊 Seeding ResumeAnalysis records...');
  for (const email of studentEmails) {
    const st = userMap[email];
    if (!st) continue;

    await ResumeAnalysis.findOneAndUpdate(
      { studentId: st._id },
      {
        $set: {
          studentId: st._id,
          fileName: `${st.name.replace(/\s+/g, '_')}_Official_Resume.pdf`,
          fileUrl: `/uploads/resumes/${st.name.replace(/\s+/g, '_')}_Official_Resume.pdf`,
          atsScore: st.studentProfile?.resumeScore || 90,
          skills: st.studentProfile?.skills || ['React', 'Node.js', 'MongoDB', 'Python'],
          missingSkills: ['System Design Scalability Metrics', 'End-to-End Cypress Tests'],
          suggestions: [
            'Quantify project achievements with measurable impact metrics (e.g. reduced load time by 38%).',
            'Highlight cloud deployment architectures and CI/CD pipelines prominently.'
          ],
          summary: `Verified technical resume for ${st.name}. Strong ATS readability index with rich project demonstrations.`,
          experienceLevel: 'Entry-Level / Pre-Final Year'
        }
      },
      { upsert: true, new: true }
    );
  }
  console.log(`  ✓ Seeded ResumeAnalysis for ${studentEmails.length} students`);

  // ==========================================
  // 9. SEED ALUMNI CONNECTIONS & MENTORSHIP
  // ==========================================
  console.log('\n🤝 Seeding Alumni Connections and Mentorship Sessions...');
  const raviAlumni = userMap['ravi.k@alumni.edu'];
  const priyaAlumni = userMap['priya.s@alumni.edu'];
  const aravindAlumni = userMap['aravind.n@alumni.edu'];

  if (cheranUser && raviAlumni) {
    await AlumniConnection.findOneAndUpdate(
      { student: cheranUser._id, alumni: raviAlumni._id },
      {
        $set: {
          student: cheranUser._id,
          alumni: raviAlumni._id,
          status: 'Accepted',
          message: 'Hi Ravi, I am targeting a Full Stack / Distributed Systems role at Google and would love guidance on preparing for system design rounds.'
        }
      },
      { upsert: true, new: true }
    );

    await MentorshipSession.findOneAndUpdate(
      { mentor: raviAlumni._id, mentee: cheranUser._id },
      {
        $set: {
          mentor: raviAlumni._id,
          mentee: cheranUser._id,
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          scheduledEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
          topic: 'Google SWE Interview Strategy & High-Throughput Node.js Architecture',
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/nexora-mentor-session',
          actionItems: [
            { title: 'Read DynamoDB & Cassandra partitioning fundamentals', assignedTo: 'Student', status: 'TODO' },
            { title: 'Review Cheran GitHub distributed worker project', assignedTo: 'Mentor', status: 'TODO' }
          ]
        }
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Mentorship session scheduled: Ravi Kumar <-> Cheran S`);
  }

  if (cheranUser && priyaAlumni) {
    await AlumniConnection.findOneAndUpdate(
      { student: cheranUser._id, alumni: priyaAlumni._id },
      {
        $set: {
          student: cheranUser._id,
          alumni: priyaAlumni._id,
          status: 'Accepted',
          message: 'Seeking advice on cloud enterprise architectures and scaling microservices.'
        }
      },
      { upsert: true, new: true }
    );
  }

  // Mentor Availability
  if (raviAlumni) {
    await MentorAvailability.findOneAndUpdate(
      { alumni: raviAlumni._id },
      {
        $set: {
          alumni: raviAlumni._id,
          isAvailable: true,
          sessionDuration: 45,
          weeklySchedule: {
            saturday: [{ start: '10:00', end: '12:00', enabled: true }],
            sunday: [{ start: '15:00', end: '17:00', enabled: true }]
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  // ==========================================
  // 10. SEED BOUNTIES & CHALLENGES
  // ==========================================
  console.log('\n🏆 Seeding Technical Bounties & Innovation Challenges...');
  if (raviAlumni) {
    await Bounty.findOneAndUpdate(
      { title: 'Microservices Rate Limiter & Token Bucket Middleware' },
      {
        $set: {
          title: 'Microservices Rate Limiter & Token Bucket Middleware',
          description: 'Implement a Redis-backed distributed token bucket algorithm in Express.js supporting sliding windows and IP/API key rate limiting.',
          rewardAmount: 350,
          rewardCurrency: 'USD',
          tags: ['Node.js', 'Redis', 'Express', 'System Design'],
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'Open',
          poster: raviAlumni._id
        }
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Seeded Alumni Bounty: "Microservices Rate Limiter"`);
  }

  // ==========================================
  // 11. SEED ANNOUNCEMENTS & NOTIFICATIONS
  // ==========================================
  console.log('\n📢 Seeding Official Announcements & Student Notifications...');
  const announcements = [
    {
      title: 'Google & Microsoft Campus Recruitment Drive 2026',
      content: 'The Central Placement Cell is pleased to announce on-campus placement drives by Google and Microsoft for 2026 batch graduates. Update your Career Target and ensure your resume ATS score exceeds 85% to be eligible.',
      audience: 'STUDENTS',
      priority: 'Urgent',
      status: 'Published'
    },
    {
      title: 'AI Resume Optimization & Digital Twin Workshop',
      content: 'Join Google Senior SDE Ravi Kumar this Saturday for an interactive masterclass on optimizing technical resumes for modern ATS filters and building a strong career digital twin.',
      audience: 'ALL',
      priority: 'High',
      status: 'Published'
    }
  ];

  for (const ann of announcements) {
    await Announcement.findOneAndUpdate(
      { title: ann.title },
      { $set: ann },
      { upsert: true, new: true }
    );
  }
  console.log(`  ✓ Seeded ${announcements.length} Official Announcements`);

  // Notifications for student
  if (cheranUser) {
    const notifications = [
      {
        recipient: cheranUser._id,
        type: 'SUCCESS',
        title: 'Career Target Saved to Database',
        message: 'Your Career Target role has been saved as Full Stack Developer and synced with placement intelligence.',
        link: '/student/learning',
        read: false
      },
      {
        recipient: cheranUser._id,
        type: 'INFO',
        title: 'Application Shortlisted by Google',
        message: 'Congratulations! Your application for Full Stack Software Engineer at Google has advanced to Round 1 technical review.',
        link: '/student/applications',
        read: false
      },
      {
        recipient: cheranUser._id,
        type: 'MESSAGE',
        title: 'Mentorship Confirmed with Ravi Kumar',
        message: 'Ravi Kumar has confirmed your upcoming 1:1 mentorship session regarding Google SWE interview strategies.',
        link: '/student/alumni-mentors',
        read: false
      }
    ];

    for (const notif of notifications) {
      await Notification.findOneAndUpdate(
        { recipient: notif.recipient, title: notif.title },
        { $set: notif },
        { upsert: true, new: true }
      );
    }
    console.log(`  ✓ Seeded ${notifications.length} real Notifications for ${cheranUser.email}`);
  }

  // ==========================================
  // 12. SEED HIRING DRIVES & HACKATHONS
  // ==========================================
  console.log('\n🏁 Seeding Hiring Drives & Hackathons...');
  await HiringDrive.findOneAndUpdate(
    { name: 'Google Cloud Accelerate 2026', company: 'Google' },
    {
      $set: {
        name: 'Google Cloud Accelerate 2026',
        company: 'Google',
        status: 'Active',
        locations: ['Bangalore', 'Hyderabad'],
        applied: 142,
        assessed: 88,
        interviewed: 24,
        offered: 8,
        description: 'Elite hiring drive for Google Cloud Core Infrastructure and Workspace engineering teams.',
        createdBy: recruiterUser._id
      }
    },
    { upsert: true, new: true }
  );

  await HackathonEvent.findOneAndUpdate(
    { eventName: 'NEXORA Global AI & Web3 Hackathon 2026' },
    {
      $set: {
        eventName: 'NEXORA Global AI & Web3 Hackathon 2026',
        theme: 'Autonomous AI Agents & Real-Time Collaborative Ecosystems',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        organizer: placementOfficer._id,
        status: 'Upcoming'
      }
    },
    { upsert: true, new: true }
  );
  console.log('  ✓ Seeded Hiring Drives and Hackathons');

  console.log('\n======================================================');
  console.log('🎉 IDEMPOTENT DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('📊 Verified Collections Populated:');
  console.log('  - Users (Admin, Placement, Alumni, Students with hashed passwords)');
  console.log('  - CareerTarget (Saved & linked to authentic student IDs)');
  console.log('  - RoleSkillMap (Mapped skills and industry trends)');
  console.log('  - Skills & StudentSkills (Normalized skill matrix)');
  console.log('  - Jobs (Real job openings with approved statuses)');
  console.log('  - Applications (Linked to real jobs and students with ATS scores)');
  console.log('  - Assessments & Submissions (Questions, scoring, and evaluated results)');
  console.log('  - ResumeAnalysis (Full ATS scoring and suggestions)');
  console.log('  - AlumniConnection & MentorshipSession (1:1 confirmed sessions)');
  console.log('  - Bounties & Challenges (Open and rewarded)');
  console.log('  - Announcements & Notifications (Live interactive feed)');
  console.log('======================================================\n');

  process.exit(0);
}

seedMasterData().catch(err => {
  console.error('❌ Error during master database seeding:', err);
  process.exit(1);
});
