/**
 * Fix User Roles to Lowercase
 * This script converts all UPPERCASE roles to lowercase for consistency
 */

import { query } from '../src/lib/db';

async function fixUserRoles() {
  console.log('🔧 Fixing User Roles to Lowercase\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check current roles
    console.log('Checking current roles...\n');
    const currentUsers = await query<any>(
      'SELECT id, name, email, role FROM users ORDER BY created_at'
    );

    if (currentUsers.length === 0) {
      console.log('❌ No users found in database\n');
      return;
    }

    console.log(`Found ${currentUsers.length} user(s):\n`);

    currentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Current role: "${user.role}"`);

      if (user.role === user.role.toLowerCase()) {
        console.log(`   ✅ Already lowercase\n`);
      } else {
        console.log(`   ⚠️  Will change to: "${user.role.toLowerCase()}"\n`);
      }
    });

    // Update all roles to lowercase
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Updating all roles to lowercase...\n');

    const result = await query(
      'UPDATE users SET role = LOWER(role) RETURNING id, name, email, role'
    );

    console.log(`✅ Updated ${result.length} user(s):\n`);

    result.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: "${user.role}"`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All roles have been converted to lowercase\n');
    console.log('You can now log in and access /admin successfully!\n');

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    process.exit(1);
  }
}

fixUserRoles();
