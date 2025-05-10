import { connectToDatabase } from '../src/lib/mongodb';
import User from '../src/models/user';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config();

async function createAdminUser() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const name = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];
    
    if (!name || !email || !password) {
      console.error('Usage: pnpm tsx scripts/create-admin.ts "Admin Name" "admin@example.com" "password"');
      process.exit(1);
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists.`);
      process.exit(0);
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });
    
    console.log(`Admin user created successfully: ${admin.name} (${admin.email})`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
