/**
 * Migration: Add GOALS to row_type check constraint
 * Date: 2025-11-20
 * Description: Allows 'GOALS' as a valid row_type value for Goals feature
 */

import { query, closeDatabase } from '../src/lib/db';

export async function addGoalsType() {
  console.log('🔧 Adding GOALS to row_type check constraint...');

  try {
    // Drop the existing check constraint (safe - will be recreated immediately)
    await query(`ALTER TABLE slide_rows DROP CONSTRAINT IF EXISTS slide_rows_row_type_check`);
    console.log('  ✓ Dropped old constraint');

    // Add new check constraint with GOALS included
    await query(`
      ALTER TABLE slide_rows ADD CONSTRAINT slide_rows_row_type_check
      CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT', 'IMGSLIDES', 'SERVICE', 'GOALS'))
    `);
    console.log('  ✓ Added new constraint with GOALS');

    console.log('✅ GOALS row type migration complete');
  } catch (error) {
    // If constraint already exists with GOALS, this is fine
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('ℹ️  GOALS constraint already exists, skipping');
    } else {
      throw error;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  addGoalsType()
    .then(() => closeDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      closeDatabase().then(() => process.exit(1));
    });
}
