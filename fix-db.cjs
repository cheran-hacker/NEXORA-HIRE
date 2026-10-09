const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://cheranit23_db_user:cheran0308@cluster0.jwiz8pu.mongodb.net/Student-ecosystem?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB Atlas');
  
  // Hash the password properly using bcryptjs (which matches backend authController)
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  // Fix roles and status to match backend schema (capitalized Admin)
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@nexora.io' }, 
    { $set: { password: hashedPassword, role: 'Admin', status: 'Active' } },
    { upsert: true } // Create if doesn't exist just in case
  );

  console.log('Update result:', result);
  console.log('Fixed admin@nexora.io');
  process.exit(0);
}).catch(console.error);
