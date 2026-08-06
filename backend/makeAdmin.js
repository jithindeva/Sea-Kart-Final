require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/seakart';

mongoose.connect(MONGO_URI).then(async () => {
  await mongoose.connection.db.collection('users').updateMany({}, { $set: { isAdmin: true } });
  console.log('All users made admins for testing!');
  process.exit(0);
}).catch(err => {
  console.error('Error making admin:', err);
  process.exit(1);
});
