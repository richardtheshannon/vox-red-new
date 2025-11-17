/**
 * Run migration to add SIMPLESHIFT to row_type check constraint
 * Run with: npx tsx scripts/run-simpleshift-migration.ts
 */

import { query } from '../src/lib/db';

async function runMigration() {
  try {
    console.log('🚀 Starting SIMPLESHIFT migration...');

    // Drop the existing check constraint
    console.log('\n1. Dropping old check constraint...');
    await query(`ALTER TABLE slide_rows DROP CONSTRAINT IF EXISTS slide_rows_row_type_check`);
    console.log('✅ Old constraint dropped');

    // Add new check constraint with SIMPLESHIFT included
    console.log('\n2. Adding new check constraint with SIMPLESHIFT...');
    await query(`
      ALTER TABLE slide_rows ADD CONSTRAINT slide_rows_row_type_check
      CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM', 'QUICKSLIDE', 'SIMPLESHIFT'))
    `);
    console.log('✅ New constraint added');

    console.log('\n🎉 Migration complete! SIMPLESHIFT is now a valid row type.');
    console.log('\nNext step: Visit http://localhost:3000/api/admin/update-simple-shift-type to update your row.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

runMigration();
