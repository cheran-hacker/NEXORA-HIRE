import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline/promises';
import { env } from '../apps/backend/src/core/config/env.js';

const MONGODB_URI = env.mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const createAdmin = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const name = await rl.question('Admin Name: ');
  const email = await rl.question('Admin Email: ');
  const password = await rl.question('Admin Password (min 8 chars): ');

  const hashed = await bcrypt.hash(password, 12);

  const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    status: { type: String, default: 'active' }
  }, { timestamps: true });

  const User = mongoose.model('User', userSchema);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('⚠️ A user with this email already exists.');
    rl.close();
    await mongoose.disconnect();
    return;
  }

  await User.create({ name, email, password: hashed, role: 'admin' });
  console.log(`✅ Admin user "${name}" created successfully!`);

  rl.close();
  await mongoose.disconnect();
};

createAdmin().catch((err) => {
  console.error('❌ Create Admin failed:', err);
  process.exit(1);
});
