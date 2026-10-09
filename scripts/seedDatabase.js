import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../apps/backend/src/core/config/env.js';

const MONGODB_URI = env.mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({});

  const password = await bcrypt.hash('Admin@123', 12);

  const users = [
    { name: 'Super Admin', email: 'admin@nexora.io', password, role: 'Admin' },
    { name: 'Alex Recruiter', email: 'recruiter@nexora.io', password, role: 'Recruiter' },
    { name: 'Ram Kumar', email: 'student@nexora.io', password, role: 'Student' },
    { name: 'Placement Officer', email: 'placement@nexora.io', password, role: 'Placement' },
    { name: 'Alumni User', email: 'alumni@nexora.io', password, role: 'Alumni' }
  ];

  await User.insertMany(users);
  console.log(`✅ Seeded ${users.length} default users`);
  console.log('📋 Default password for all: Admin@123');

  await mongoose.disconnect();
  console.log('✅ Done. Database disconnected.');
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
