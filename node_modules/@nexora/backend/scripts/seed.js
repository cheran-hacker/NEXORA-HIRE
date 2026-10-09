import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Models
import { User } from '../src/models/User.js';
import { Job } from '../src/models/Job.js';
import { ShadowProgram } from '../src/models/ShadowProgram.js';
import { CapstoneProject } from '../src/models/CapstoneProject.js';
import { InnovationChallenge } from '../src/models/InnovationChallenge.js';
import { SkillBadge } from '../src/models/SkillBadge.js';
import { PeerReview } from '../src/models/PeerReview.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexora');
    console.log('✅ MongoDB Connected for Seeding');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const generateMockData = async () => {
  console.log('🌱 Starting Seed Generation...');

  // Clean existing specific collections we are seeding to avoid duplication
  await ShadowProgram.deleteMany({});
  await CapstoneProject.deleteMany({});
  await InnovationChallenge.deleteMany({});
  await SkillBadge.deleteMany({});
  await PeerReview.deleteMany({});
  
  let users = await User.find({ role: 'Student' }).limit(10);
  if (users.length === 0) {
    console.log('⚠️ No students found. Generating 10 mock students...');
    const newUsers = [];
    for(let i=0; i<10; i++) {
      newUsers.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: 'Student',
        department: 'Computer Science',
        skills: ['React', 'Node.js', 'Python']
      });
    }
    await User.insertMany(newUsers);
    users = await User.find({ role: 'Student' }).limit(10);
  }

  // 2. Seed Shadow Programs
  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Stripe', 'OpenAI', 'SpaceX'];
  const jobTitles = ['Senior Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Specialist'];
  
  const shadowPrograms = [];
  for(let i=0; i<15; i++) {
    shadowPrograms.push({
      alumniName: faker.person.fullName(),
      jobTitle: faker.helpers.arrayElement(jobTitles),
      company: faker.helpers.arrayElement(companies),
      microTasks: [
        faker.hacker.phrase(),
        faker.hacker.phrase(),
        faker.hacker.phrase()
      ],
      participants: []
    });
  }
  await ShadowProgram.insertMany(shadowPrograms);
  console.log(`✅ Seeded 15 Shadow Programs`);

  // 3. Seed Capstone Projects
  const capstones = [];
  for(let i=0; i<20; i++) {
    const goal = faker.number.int({ min: 1000, max: 20000 });
    capstones.push({
      title: faker.company.catchPhrase(),
      teamMembers: [faker.helpers.arrayElement(users)._id],
      pitch: faker.lorem.paragraph(),
      fundingGoal: goal,
      currentFunding: faker.number.int({ min: 0, max: goal }),
      equityOffered: faker.number.int({ min: 5, max: 25 }),
      investors: []
    });
  }
  await CapstoneProject.insertMany(capstones);
  console.log(`✅ Seeded 20 Capstone Projects`);

  // 4. Seed Innovation Challenges
  const challenges = [];
  for(let i=0; i<12; i++) {
    challenges.push({
      company: faker.helpers.arrayElement(companies),
      problemStatement: faker.company.catchPhrase() + '. ' + faker.lorem.sentences(2),
      bounty: `$${faker.number.int({ min: 1, max: 10 })},000`,
      facultyAdopters: [],
      submissions: []
    });
  }
  await InnovationChallenge.insertMany(challenges);
  console.log(`✅ Seeded 12 Innovation Challenges`);

  // 5. Seed Peer Reviews
  const reviews = [];
  for(let i=0; i<30; i++) {
    reviews.push({
      recipient: faker.helpers.arrayElement(users)._id,
      reviewer: faker.helpers.arrayElement(users)._id,
      sharedProject: faker.hacker.noun() + ' Dashboard',
      endorsementText: faker.lorem.sentences(2),
      rating: faker.number.int({ min: 3, max: 5 })
    });
  }
  await PeerReview.insertMany(reviews);
  console.log(`✅ Seeded 30 Peer Reviews`);

  console.log('🎉 Seed Generation Complete!');
  process.exit();
};

const run = async () => {
  await connectDB();
  await generateMockData();
};

run();
