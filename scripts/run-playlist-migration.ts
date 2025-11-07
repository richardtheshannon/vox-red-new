import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mp3_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Superculture1@',
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Starting playlist delay migration...');

    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'slide_rows' AND column_name = 'playlist_delay_seconds'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding playlist_delay_seconds column...');
      await client.query(`
        ALTER TABLE slide_rows
        ADD COLUMN playlist_delay_seconds INTEGER DEFAULT 0 NOT NULL
      `);
      console.log('✓ Column added successfully');
    } else {
      console.log('✓ Column playlist_delay_seconds already exists');
    }

    // Check if constraint exists
    const checkConstraint = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'slide_rows' AND constraint_name = 'slide_rows_playlist_delay_seconds_range'
    `);

    if (checkConstraint.rows.length === 0) {
      console.log('Adding range constraint...');
      await client.query(`
        ALTER TABLE slide_rows
        ADD CONSTRAINT slide_rows_playlist_delay_seconds_range
        CHECK (playlist_delay_seconds >= 0 AND playlist_delay_seconds <= 45)
      `);
      console.log('✓ Constraint added successfully');
    } else {
      console.log('✓ Constraint already exists');
    }

    console.log('\n✓ Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
