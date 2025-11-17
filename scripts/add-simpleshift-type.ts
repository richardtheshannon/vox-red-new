/**
 * Migration: Add SIMPLESHIFT to row_type check constraint
 * Date: 2025-11-17
 * Description: Allows 'SIMPLESHIFT' as a valid row_type value for Simple Shifts feature
 */

import { query, closeDatabase } from '../src/lib/db';

export async function addSimpleshiftType() {
  console.log('🔧 Adding SIMPLESHIFT to row_type check constraint...');

  try {
    // Drop the existing check constraint (safe - will be recreated immediately)
    await query(`ALTER TABLE slide_rows DROP CONSTRAINT IF EXISTS slide_rows_row_type_check`);
    console.log('  ✓ Dropped old constraint');

    // Add new check constraint with SIMPLESHIFT included
    await query(`
      ALTER TABLE slide_rows ADD CONSTRAINT slide_rows_row_type_check
      CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT'))
    `);
    console.log('  ✓ Added new constraint with SIMPLESHIFT');

    console.log('✅ SIMPLESHIFT row type migration complete');
  } catch (error) {
    // If constraint already exists with SIMPLESHIFT, this is fine
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('ℹ️  SIMPLESHIFT constraint already exists, skipping');
    } else {
      throw error;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  addSimpleshiftType()
    .then(() => closeDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      closeDatabase().then(() => process.exit(1));
    });
}
