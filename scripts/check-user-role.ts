/**
 * Check User Role Diagnostic Script
 * This script checks what roles are stored in the database
 */

import { getAllUsers } from '../src/lib/queries/users';

async function checkUserRoles() {
  console.log('🔍 Checking User Roles in Database\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Fetch all users
    const users = await getAllUsers();

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('   Please visit http://localhost:3000/setup to create first admin\n');
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Name:  ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role:  "${user.role}" (${typeof user.role})`);
      console.log(`  ID:    ${user.id}`);
      console.log(`  Created: ${user.created_at}`);

      // Check if role is correct format
      if (user.role === 'admin') {
        console.log(`  ✅ Role is correct (lowercase 'admin')`);
      } else if (user.role === 'ADMIN') {
        console.log(`  ⚠️  Role is UPPERCASE - should be lowercase 'admin'`);
        console.log(`  Fix with: UPDATE users SET role = 'admin' WHERE id = '${user.id}';`);
      } else if (user.role === 'user') {
        console.log(`  ℹ️  Role is 'user' (not admin) - cannot access /admin panel`);
      } else if (user.role === 'USER') {
        console.log(`  ⚠️  Role is UPPERCASE - should be lowercase 'user'`);
        console.log(`  Fix with: UPDATE users SET role = 'user' WHERE id = '${user.id}';`);
      } else {
        console.log(`  ❌ Unknown role: "${user.role}"`);
      }
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Summary:\n');
    console.log('Expected role format for admin access: "admin" (lowercase)');
    console.log('Admin layout checks: session.user.role !== "admin"\n');

    const hasCorrectAdmin = users.some(u => u.role === 'admin');
    const hasUppercaseAdmin = users.some(u => u.role === 'ADMIN');

    if (hasCorrectAdmin) {
      console.log('✅ At least one user has correct "admin" role');
    } else if (hasUppercaseAdmin) {
      console.log('⚠️  Users have UPPERCASE "ADMIN" role - needs fixing');
      console.log('\nTo fix all users:');
      console.log('Run this SQL command:');
      console.log('  UPDATE users SET role = LOWER(role);');
    } else {
      console.log('❌ No admin users found');
      console.log('   Create admin via /setup or update existing user role');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error checking user roles:', error);
    process.exit(1);
  }
}

checkUserRoles();
