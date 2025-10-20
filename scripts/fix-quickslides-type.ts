import { query } from '../src/lib/db';

/**
 * Fix Quick Slides row_type from ROUTINE to QUICKSLIDE
 */
async function fixQuickSlidesRowType() {
  try {
    console.log('Checking for Quick Slides row with incorrect row_type...');

    // Find the Quick Slides row
    const rows = await query<{ id: string; title: string; row_type: string }>(
      "SELECT id, title, row_type FROM slide_rows WHERE title = 'Quick Slides'"
    );

    if (rows.length === 0) {
      console.log('❌ No "Quick Slides" row found');
      return;
    }

    const quickSlidesRow = rows[0];
    console.log(`Found row: ${quickSlidesRow.title} (${quickSlidesRow.row_type})`);

    if (quickSlidesRow.row_type === 'QUICKSLIDE') {
      console.log('✅ Row type is already correct (QUICKSLIDE)');
      return;
    }

    // Update the row_type to QUICKSLIDE
    console.log(`Updating row type from ${quickSlidesRow.row_type} to QUICKSLIDE...`);
    await query(
      "UPDATE slide_rows SET row_type = 'QUICKSLIDE' WHERE id = $1",
      [quickSlidesRow.id]
    );

    console.log('✅ Successfully updated Quick Slides row_type to QUICKSLIDE');

    // Verify the update
    const updatedRows = await query<{ title: string; row_type: string }>(
      "SELECT title, row_type FROM slide_rows WHERE id = $1",
      [quickSlidesRow.id]
    );

    if (updatedRows.length > 0) {
      console.log(`Verified: ${updatedRows[0].title} - ${updatedRows[0].row_type}`);
    }

  } catch (error) {
    console.error('❌ Error fixing Quick Slides row type:', error);
    throw error;
  }
}

// Run the fix
fixQuickSlidesRowType()
  .then(() => {
    console.log('\n✅ Fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });
