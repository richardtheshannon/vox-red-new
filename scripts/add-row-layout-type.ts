/**
 * Migration: Add row_layout_type to slide_rows
 *
 * Adds optional row-level layout type that overrides individual slide layouts.
 * When set, this layout will be used for ALL slides in the row instead of their individual layout_type values.
 */

import { Pool } from 'pg';

async function addRowLayoutType() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Starting migration: add-row-layout-type...');

    // Add row_layout_type column to slide_rows table with CHECK constraint
    await pool.query(`
      ALTER TABLE slide_rows
      ADD COLUMN IF NOT EXISTS row_layout_type TEXT NULL
      CHECK (row_layout_type IN ('STANDARD', 'OVERFLOW', 'MINIMAL') OR row_layout_type IS NULL);
    `);

    console.log('✅ Successfully added row_layout_type column to slide_rows with CHECK constraint');
    console.log('Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  addRowLayoutType()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default addRowLayoutType;
