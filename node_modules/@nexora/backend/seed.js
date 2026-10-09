import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import { Job } from './src/models/Job.js';
import { Post } from './src/models/Post.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Post.deleteMany();
    console.log('🗑️ Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const adminPassword = await bcrypt.hash('cheran@2006', salt);
    const admin = await User.create({
      name: 'NEXORA Admin', email: 'cheran@it', password: adminPassword, role: 'Admin', status: 'Active'
    });

    const alumni = await User.create({
      name: 'Ravi Kumar', email: 'ravi.k@alumni.edu', password, role: 'Alumni', status: 'Active',
      alumniProfile: { college: 'IIT Bombay', company: 'Google', designation: 'SDE-2', expertise: ['System Design', 'React'], rating: 4.8, available: true }
    });

    const student = await User.create({
      name: 'Sneha Patel', email: 'sneha@student.edu', password, role: 'Student', status: 'Active',
      studentProfile: { college: 'IIT Bombay', branch: 'Computer Science', batchYear: 2026, cgpa: 9.2, skills: ['React', 'Node.js', 'Python'], readinessScore: 85 }
    });

    const placementOfficer = await User.create({
      name: 'Placement Head', email: 'head@placement.edu', password, role: 'Placement', status: 'Active'
    });

    console.log('👥 Created Users (Admin, Alumni, Student, Placement)');

    // 2. Create Jobs
    const job1 = await Job.create({
      title: 'Frontend Engineer (React)', company: 'Google', recruiterId: placementOfficer._id, type: 'Full-Time', location: 'Bangalore, Hybrid',
      description: 'Join Google to build next-generation web applications using React and modern JavaScript.',
      requirements: ['BS in Computer Science', 'Strong in JS and React', 'Understanding of web performance'],
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS'], salary: { min: 2500000, max: 4000000, currency: 'INR' },
      experience: '0-2 years', eligibleBatches: [2025, 2026], status: 'Open'
    });

    const job2 = await Job.create({
      title: 'Software Engineering Intern', company: 'Google', recruiterId: placementOfficer._id, type: 'Internship', location: 'Remote',
      description: 'Summer 2026 internship focusing on core backend infrastructure.',
      requirements: ['Currently pursuing CS degree', 'Strong Data Structures & Algorithms'],
      skills: ['C++', 'Java', 'Python', 'Go'], salary: { min: 100000, max: 150000, currency: 'INR' },
      experience: 'Fresher', eligibleBatches: [2026], status: 'Open'
    });

    console.log('💼 Created Jobs');

    // 3. Create Posts
    await Post.create({
      author: alumni._id,
      title: 'How I cracked Google as a fresher',
      content: 'Focus heavily on Data Structures and Algorithms. Specifically, master Dynamic Programming and Graphs. Practice on LeetCode daily!',
      tags: ['Interview Prep', 'Google', 'Success Story']
    });

    await Post.create({
      author: student._id,
      title: 'Looking for a Hackathon Team!',
      content: 'I am a frontend developer (React/Tailwind) looking for a backend developer to join me for the upcoming Web3 Builders Jam.',
      tags: ['Hackathon', 'Team Building']
    });

    console.log('📝 Created Community Posts');
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
