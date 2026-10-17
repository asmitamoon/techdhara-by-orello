require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin user already exists!');
      console.log('-----------------------------------');
      console.log('Email:', existingSuperAdmin.email);
      console.log('Role:', existingSuperAdmin.role);
      console.log('Status:', existingSuperAdmin.status);
      console.log('-----------------------------------');
      console.log('💡 If you need to create another Super Admin, delete the existing one first.');
      process.exit(0);
    }

    const superAdminUser = new User({
      email: superAdminEmail,
      passwordHash: superAdminPassword,
      isEmailUser: true,
      isEmailVerified: true,
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      fullName: 'Super Admin',
      registrationComplete: true
    });

    await superAdminUser.save();

    console.log('✅ Super Admin user created successfully!');
    console.log('==========================================');
    console.log('Email:', superAdminUser.email);
    console.log('Password:', superAdminPassword);
    console.log('Role:', superAdminUser.role);
    console.log('Status:', superAdminUser.status);
    console.log('==========================================');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('💡 Super Admin has all permissions by default.');
    console.log('💡 Use Super Admin account to create regular admins with specific permissions.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Super Admin user:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
