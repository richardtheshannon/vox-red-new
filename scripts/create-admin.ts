/**
 * Create Admin User Script
 * Creates a new admin user with specified credentials
 */

import { createUser } from '../src/lib/queries/users';

async function createAdmin() {
  console.log('🔧 Creating New Admin User\n');

  // New admin credentials
  const adminData = {
    name: 'Test Admin',
    email: 'test@admin.com',
    password: 'admin123',
    role: 'admin' as const,
  };

  try {
    console.log('Creating admin user...');
    console.log(`  Name: ${adminData.name}`);
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log(`  Role: ${adminData.role}\n`);

    const newUser = await createUser(adminData);

    console.log('✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login Credentials');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login URL: http://localhost:3000/login\n');
    console.log('User Details:');
    console.log(`  ID: ${newUser.id}`);
    console.log(`  Name: ${newUser.name}`);
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Role: ${newUser.role}`);
    console.log(`  Created: ${newUser.created_at}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);

    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      console.error('\n⚠️  A user with this email already exists.');
      console.error('   Try using a different email or delete the existing user first.\n');
    }

    process.exit(1);
  }
}

createAdmin();
