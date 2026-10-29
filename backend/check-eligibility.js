import mongoose from 'mongoose';
import { Job } from './src/models/Job.js';
import { User } from './src/models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexora';

mongoose.connect(MONGO_URI).then(async () => {
  // Check the job (find first open job)
  const job = await Job.findOne({ status: 'Open' });
  if (!job) {
    console.log('NO OPEN JOBS FOUND');
    process.exit(1);
  }
  console.log('--- JOB ---');
  console.log('ID:', job._id);
  console.log('Title:', job.title);
  console.log('eligibleBatches:', JSON.stringify(job.eligibleBatches));
  console.log('eligibleBranches:', JSON.stringify(job.eligibleBranches));
  console.log('minimumCGPA:', job.minimumCGPA);

  // Find some students to check their profiles
  const students = await User.find({ role: 'Student' }).select('name email studentProfile').limit(5);
  console.log('\n--- STUDENT PROFILES (first 5) ---');
  students.forEach(s => {
    console.log(`\nStudent: ${s.name} (${s.email})`);
    console.log('  batchYear:', s.studentProfile?.batchYear, '  type:', typeof s.studentProfile?.batchYear);
    console.log('  branch:', s.studentProfile?.branch);
    console.log('  cgpa:', s.studentProfile?.cgpa);
    console.log('  resumeUrl:', s.studentProfile?.resumeUrl ? 'SET' : 'NOT SET');
  });

  process.exit(0);
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});
