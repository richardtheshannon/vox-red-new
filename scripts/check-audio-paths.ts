import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mp3_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function checkAudioPaths() {
  const client = await pool.connect();

  try {
    console.log('\n=== Checking Audio Paths in Database ===\n');

    // Get all slides with audio URLs
    const result = await client.query(
      'SELECT id, title, audio_url FROM slides WHERE audio_url IS NOT NULL AND audio_url != \'\' ORDER BY id LIMIT 10'
    );

    console.log(`Found ${result.rows.length} slides with audio URLs\n`);

    for (const row of result.rows) {
      console.log(`\nSlide ID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`Audio URL: ${row.audio_url}`);

      // Check if file exists
      if (row.audio_url) {
        // Remove leading slash if present
        const urlPath = row.audio_url.startsWith('/') ? row.audio_url.substring(1) : row.audio_url;
        const publicPath = path.join(process.cwd(), 'public', urlPath);

        console.log(`Checking path: ${publicPath}`);

        if (fs.existsSync(publicPath)) {
          const stats = fs.statSync(publicPath);
          console.log(`✓ File exists (${(stats.size / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`✗ File NOT FOUND`);
        }
      }
    }

    console.log('\n=== Checking public/media directory ===\n');

    // Check what files actually exist in public/media
    const mediaDir = path.join(process.cwd(), 'public', 'media');
    if (fs.existsSync(mediaDir)) {
      const files = fs.readdirSync(mediaDir, { recursive: true });
      console.log('Files in public/media:');
      files.forEach((file: string | Buffer) => {
        const fileName = file.toString();
        const filePath = path.join(mediaDir, fileName);
        if (fs.statSync(filePath).isFile() && fileName.match(/\.(mp3|wav|ogg)$/i)) {
          console.log(`  - ${fileName}`);
        }
      });
    } else {
      console.log('public/media directory does not exist!');
    }

  } catch (error) {
    console.error('Error checking audio paths:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAudioPaths();
