import mongoose from 'mongoose';
import { env } from '../../../backend/src/config/env.js';
import { User } from '../../../backend/src/models/User.js';
import { TeacherPrivateProfile } from '../../../backend/src/models/TeacherPrivateProfile.js';
import { verifyPassword } from '../../../backend/src/utils/crypto.js';

async function verify() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() }).select('+passwordHash');
  if (!admin) {
    throw new Error('Admin not found in DB!');
  }

  const isPasswordValid = await verifyPassword(admin.passwordHash!, env.ADMIN_PASSWORD);
  console.log('Admin User Verified:');
  console.log(' - Email:', admin.email);
  console.log(' - Roles:', admin.roles);
  console.log(' - Account Status:', admin.accountStatus);
  console.log(' - Email Verified:', admin.isEmailVerified);
  console.log(' - Password Verified:', isPasswordValid);
  console.log(' - Teacher Verification Status:', admin.teacherProfile?.verificationStatus);
  console.log(' - Teacher Institution:', admin.teacherProfile?.institution);

  const privateProfile = await TeacherPrivateProfile.findOne({ userId: admin._id });
  console.log(' - TeacherPrivateProfile Present:', !!privateProfile);
  console.log(' - Private WhatsApp:', privateProfile?.whatsapp);

  await mongoose.disconnect();
  console.log('Verification test completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
