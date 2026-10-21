import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { TeacherPrivateProfile } from '../models/TeacherPrivateProfile.js';
import { UserRole, AccountStatus, VerificationStatus, ContactVisibilityMode } from '../enums/index.js';
import { hashPassword } from '../utils/crypto.js';

const seedAdmin = async () => {
  const force = process.argv.includes('--force');

  console.log('🌱 Starting admin seed process...');
  await mongoose.connect(env.MONGODB_URI);

  const existingAdmin = await User.findOne({ roles: UserRole.ADMIN });
  if (existingAdmin && !force) {
    console.log(`ℹ️ An admin account already exists (${existingAdmin.email}).`);
    console.log('To override, run: npm run seed:admin -- --force');
    await mongoose.disconnect();
    process.exit(0);
  }

  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  const adminTeacherProfile = {
    isPublic: true,
    verificationStatus: VerificationStatus.VERIFIED,
    institution: 'University of Dhaka',
    department: 'Computer Science and Engineering',
    batchOrYear: '2020',
    experienceYears: 5,
    bio: 'System Administrator & Senior Verified Educator.',
    subjectsOffered: ['Mathematics', 'Physics', 'Computer Science'],
    preferredAreas: ['Dhanmondi', 'Gulshan', 'Uttara', 'Online'],
    expectedRateRange: '8,000 - 15,000 BDT',
    contactVisibilityMode: ContactVisibilityMode.AUTO_FOR_VERIFIED_GUARDIANS,
    slug: 'system-admin',
  };

  let adminUser;

  if (existingAdmin && force) {
    existingAdmin.email = email;
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.accountStatus = AccountStatus.ACTIVE;
    existingAdmin.isEmailVerified = true;
    if (!existingAdmin.roles.includes(UserRole.TEACHER)) {
      existingAdmin.roles.push(UserRole.TEACHER);
    }
    existingAdmin.teacherProfile = adminTeacherProfile;
    adminUser = await existingAdmin.save();
    console.log(`✅ Admin account updated successfully with verified profile: ${email}`);
  } else {
    adminUser = await User.create({
      name: 'System Administrator',
      email,
      passwordHash,
      roles: [UserRole.ADMIN, UserRole.TEACHER],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
      teacherProfile: adminTeacherProfile,
    });
    console.log(`✅ Admin account seeded successfully with verified profile: ${email}`);
  }

  // Ensure 1:1 TeacherPrivateProfile exists
  await TeacherPrivateProfile.findOneAndUpdate(
    { userId: adminUser._id },
    {
      userId: adminUser._id,
      whatsapp: '+8801700000000',
      alternatePhone: '+8801800000000',
      fullAddress: 'Dhaka, Bangladesh',
      verificationDocs: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          publicId: 'sample-admin-nid',
          docType: 'NATIONAL_ID',
          uploadedAt: new Date(),
        },
      ],
    },
    { upsert: true, new: true }
  );
  console.log(`✅ TeacherPrivateProfile synced for admin user (${adminUser._id})`);

  await mongoose.disconnect();
  console.log('🎉 Seed complete.');
};

seedAdmin().catch((err) => {
  console.error('❌ Error seeding admin:', err);
  process.exit(1);
});

