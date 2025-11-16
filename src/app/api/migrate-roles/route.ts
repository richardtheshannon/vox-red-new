import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Migrate User Roles from UPPERCASE to lowercase
 * This API endpoint:
 * 1. Drops the old CHECK constraint (USER, ADMIN, MODERATOR)
 * 2. Updates all role values to lowercase
 * 3. Adds new CHECK constraint (admin, user)
 */
export async function POST() {
  try {
    console.log('🔄 Starting role migration...');

    // Step 1: Drop the old constraint
    console.log('Step 1: Dropping old CHECK constraint...');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    console.log('✅ Old constraint dropped');

    // Step 2: Update role values to lowercase
    console.log('Step 2: Converting role values to lowercase...');
    await query(`
      UPDATE users
      SET role = CASE
        WHEN role = 'ADMIN' THEN 'admin'
        WHEN role = 'USER' THEN 'user'
        WHEN role = 'MODERATOR' THEN 'user'
        ELSE LOWER(role)
      END
    `);
    console.log('✅ Role values converted');

    // Step 3: Add new constraint with lowercase values
    console.log('Step 3: Adding new CHECK constraint...');
    await query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'user'))
    `);
    console.log('✅ New constraint added');

    // Step 4: Verify the migration
    const users = await query<any>(
      'SELECT id, name, email, role FROM users ORDER BY created_at'
    );

    console.log('✅ Migration completed successfully!');

    return NextResponse.json({
      status: 'success',
      message: 'Role migration completed successfully',
      users,
      migrated: users.length,
    });
  } catch (error) {
    console.error('❌ Error during migration:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to migrate roles',
      },
      { status: 500 }
    );
  }
}

/**
 * Preview what the migration will do
 */
export async function GET() {
  try {
    const users = await query<any>(
      'SELECT id, name, email, role FROM users ORDER BY created_at'
    );

    const preview = users.map((u: any) => ({
      ...u,
      currentRole: u.role,
      newRole:
        u.role === 'ADMIN'
          ? 'admin'
          : u.role === 'USER'
          ? 'user'
          : u.role === 'MODERATOR'
          ? 'user'
          : u.role.toLowerCase(),
    }));

    return NextResponse.json({
      status: 'success',
      message: 'Migration preview - no changes made yet',
      preview,
      instruction: 'Send a POST request to /api/migrate-roles to execute migration',
    });
  } catch (error) {
    console.error('Error previewing migration:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to preview migration',
      },
      { status: 500 }
    );
  }
}
