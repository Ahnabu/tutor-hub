import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { UserRole, AccountStatus } from '../enums/index.js';
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

  if (existingAdmin && force) {
    existingAdmin.email = email;
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.accountStatus = AccountStatus.ACTIVE;
    existingAdmin.isEmailVerified = true;
    await existingAdmin.save();
    console.log(`✅ Admin account updated successfully: ${email}`);
  } else {
    await User.create({
      name: 'System Administrator',
      email,
      passwordHash,
      roles: [UserRole.ADMIN],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
    });
    console.log(`✅ Admin account seeded successfully: ${email}`);
  }

  await mongoose.disconnect();
  console.log('🎉 Seed complete.');
};

seedAdmin().catch((err) => {
  console.error('❌ Error seeding admin:', err);
  process.exit(1);
});
