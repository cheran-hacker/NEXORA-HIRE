import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { User } from '../src/models/User.js';
import { CareerTarget } from '../src/models/CareerTarget.js';

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const student = await User.findOne({ email: 'cheran.it23@bitsathy.ac.in' });
  if (!student) {
    console.error('❌ Student cheran.it23@bitsathy.ac.in not found');
    process.exit(1);
  }

  console.log(`\n👨‍🎓 Testing student: ${student.name} (${student.email})`);
  console.log('Initial User.studentProfile.targetCareerRole:', student.studentProfile?.targetCareerRole);

  const initialCT = await CareerTarget.findOne({ studentId: student._id });
  console.log('Initial CareerTarget collection record:', initialCT ? initialCT.targetRole : 'None');

  // Test updating career target to a new target
  const testRole = 'AI Systems & Cloud Architect';
  console.log(`\n🔄 Updating career target to "${testRole}"...`);

  await CareerTarget.findOneAndUpdate(
    { studentId: student._id },
    { $set: { targetRole: testRole } },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(student._id, {
    $set: {
      'studentProfile.targetCareerRole': testRole,
      'studentProfile.careerTarget': testRole,
      'studentProfile.preferredRoles': testRole
    }
  });

  // Query fresh from MongoDB
  const freshCT = await CareerTarget.findOne({ studentId: student._id });
  const freshStudent = await User.findById(student._id);

  console.log('Fresh query CareerTarget.targetRole:', freshCT?.targetRole);
  console.log('Fresh query User.studentProfile.targetCareerRole:', freshStudent?.studentProfile?.targetCareerRole);
  console.log('Fresh query User.studentProfile.careerTarget:', freshStudent?.studentProfile?.careerTarget);

  if (freshCT?.targetRole === testRole && freshStudent?.studentProfile?.targetCareerRole === testRole) {
    console.log('✅ SUCCESS: Career target persisted in BOTH CareerTarget collection and User.studentProfile!');
  } else {
    console.error('❌ FAILURE: Career target did not persist accurately.');
    process.exit(1);
  }

  // Restore back to original target
  const finalRole = 'Full Stack Developer';
  await CareerTarget.findOneAndUpdate(
    { studentId: student._id },
    { $set: { targetRole: finalRole } }
  );
  await User.findByIdAndUpdate(student._id, {
    $set: {
      'studentProfile.targetCareerRole': finalRole,
      'studentProfile.careerTarget': finalRole,
      'studentProfile.preferredRoles': finalRole
    }
  });

  console.log(`\n🎯 Restored target role back to "${finalRole}". Test complete.`);
  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
