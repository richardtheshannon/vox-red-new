/**
 * Migration: Add row_background_image_url to slide_rows
 *
 * Adds optional row-level background image that overrides individual slide backgrounds.
 * When set, this image will be used for ALL slides in the row instead of their individual image_url values.
 */

import { Pool } from 'pg';

async function addRowBackgroundImage() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Starting migration: add-row-background-image...');

    // Add row_background_image_url column to slide_rows table
    await pool.query(`
      ALTER TABLE slide_rows
      ADD COLUMN IF NOT EXISTS row_background_image_url TEXT NULL;
    `);

    console.log('✅ Successfully added row_background_image_url column to slide_rows');
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
  addRowBackgroundImage()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default addRowBackgroundImage;
