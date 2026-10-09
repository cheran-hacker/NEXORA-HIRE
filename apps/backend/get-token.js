import mongoose from 'mongoose';
import { AlumniInvitation } from './src/models/AlumniInvitation.js';

mongoose.connect('mongodb://127.0.0.1:27017/nexora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const inv = await AlumniInvitation.findOne({ status: 'INVITATION_SENT' });
  if (inv) {
    console.log("TOKEN: " + inv.token);
  } else {
    console.log("NO TOKEN FOUND");
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
