const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://cheranit23_db_user:cheran0308@cluster0.jwiz8pu.mongodb.net/Student-ecosystem?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@nexora.io' }, 
    { $set: { name: 'Super Admin' } }
  );
  console.log('Name added to admin');
  process.exit(0);
}).catch(console.error);
