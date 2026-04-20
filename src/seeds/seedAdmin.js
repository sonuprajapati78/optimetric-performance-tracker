const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Employee = require('../models/Employee');
const config = require('../config');

async function seedAdmin() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = new Employee({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      department: 'Operations',
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');

    // Create a test employee
    const testEmployeePassword = await bcrypt.hash('employee123', salt);
    const testEmployee = new Employee({
      name: 'John Doe',
      email: 'john@test.com',
      password: testEmployeePassword,
      department: 'Sales',
      role: 'employee',
      isActive: true,
    });

    await testEmployee.save();
    console.log('\n✅ Test employee created successfully!');
    console.log('📧 Email: john@test.com');
    console.log('🔑 Password: employee123');

    console.log('\n🎉 Seeding completed!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
