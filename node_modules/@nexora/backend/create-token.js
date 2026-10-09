import mongoose from 'mongoose';
import { AlumniInvitation } from './src/models/AlumniInvitation.js';

mongoose.connect('mongodb://127.0.0.1:27017/nexora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const inv = new AlumniInvitation({
    email: 'john.doe@example.com',
    name: 'John Doe',
    department: 'Computer Science',
    batch: '2023',
    token: 'testtoken123',
    status: 'INVITATION_SENT',
    expireAt: new Date(Date.now() + 86400000),
    invitedBy: new mongoose.Types.ObjectId()
  });
  await inv.save();
  console.log("TOKEN: testtoken123");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
