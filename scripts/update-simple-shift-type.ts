/**
 * Update "Simple Shift" row type from CUSTOM to SIMPLESHIFT
 * Run with: npx tsx scripts/update-simple-shift-type.ts
 */

import { query } from '../src/lib/db';

async function updateSimpleShiftType() {
  try {
    console.log('Connected to database');

    // Find rows with title "Simple Shift" or similar
    const findResult = await query<{ id: string; title: string; row_type: string }>(
      `SELECT id, title, row_type FROM slide_rows WHERE LOWER(title) LIKE '%simple%shift%'`
    );

    console.log(`\nFound ${findResult.length} row(s) matching "Simple Shift":`);
    findResult.forEach((row) => {
      console.log(`  - ID: ${row.id}`);
      console.log(`    Title: ${row.title}`);
      console.log(`    Current Type: ${row.row_type}`);
    });

    if (findResult.length === 0) {
      console.log('\n⚠️  No rows found with "Simple Shift" in the title.');
      console.log('Please check your database or update the WHERE clause in this script.');
      return;
    }

    // Update the row type to SIMPLESHIFT
    const updateResult = await query<{ id: string; title: string; row_type: string }>(
      `UPDATE slide_rows
       SET row_type = 'SIMPLESHIFT'
       WHERE LOWER(title) LIKE '%simple%shift%'
       RETURNING id, title, row_type`
    );

    console.log(`\n✅ Updated ${updateResult.length} row(s) to SIMPLESHIFT:`);
    updateResult.forEach((row) => {
      console.log(`  - ${row.title} (${row.id}) -> ${row.row_type}`);
    });

    console.log('\n🎉 Migration complete! Refresh your browser to see the changes.');

  } catch (error) {
    console.error('❌ Error updating Simple Shift type:', error);
    throw error;
  }
}

updateSimpleShiftType();
