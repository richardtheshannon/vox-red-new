#!/usr/bin/env tsx

/**
 * Simple Production Database Download Script
 *
 * This script helps you download your Railway production database
 * using the PUBLIC database URL from Railway's dashboard.
 *
 * USAGE:
 * 1. Get your PUBLIC_URL from Railway dashboard
 * 2. Run: npm run db:download-prod-simple
 * 3. Paste the PUBLIC_URL when prompted
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const BACKUP_DB_NAME = 'mp3_manager_backup';
const DUMP_FILE = 'railway-prod-dump.sql';
const DUMP_PATH = path.join(process.cwd(), DUMP_FILE);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function getPublicDatabaseUrl(): Promise<string> {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  How to Get Your Railway PUBLIC Database URL                ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');

  log('\n📋 Steps:', 'blue');
  log('1. Go to: https://railway.app/dashboard', 'reset');
  log('2. Select your project: VOX-RED-NEW or vox-red', 'reset');
  log('3. Click on your PostgreSQL database service', 'reset');
  log('4. Go to "Connect" or "Variables" tab', 'reset');
  log('5. Look for "PUBLIC_URL" or "Database Public URL"', 'reset');
  log('   (It looks like: postgresql://postgres:xxx@yamabiko.proxy.rlwy.net:59122/railway)', 'yellow');
  log('6. Copy the entire URL\n', 'reset');

  log('⚠️  IMPORTANT: Use the PUBLIC URL, NOT the PRIVATE URL!', 'yellow');
  log('   ✗ PRIVATE: postgres.railway.internal (won\'t work)', 'red');
  log('   ✓ PUBLIC: xxxxxx.proxy.rlwy.net (will work)\n', 'green');

  const databaseUrl = await askQuestion(
    `${colors.cyan}Paste your PUBLIC DATABASE_URL here: ${colors.reset}`
  );

  if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
    log('\n✗ Invalid DATABASE_URL. Must start with "postgresql://"', 'red');
    process.exit(1);
  }

  if (databaseUrl.includes('railway.internal')) {
    log('\n✗ Error: You provided the PRIVATE URL', 'red');
    log('Please use the PUBLIC URL instead (contains .proxy.rlwy.net)', 'yellow');
    process.exit(1);
  }

  log('\n✓ DATABASE_URL looks valid!', 'green');
  return databaseUrl;
}

async function exportDatabase(databaseUrl: string) {
  log('\n=== Exporting Production Database ===', 'magenta');

  // Clean up old dump file if exists
  if (fs.existsSync(DUMP_PATH)) {
    log(`Removing old dump file: ${DUMP_FILE}`, 'yellow');
    fs.unlinkSync(DUMP_PATH);
  }

  const host = databaseUrl.split('@')[1]?.split('/')[0] || 'unknown';
  log(`Connecting to: ${host}`, 'blue');

  try {
    log('\n→ Exporting database (this may take a few minutes)...', 'blue');
    log('   Please wait, do not interrupt...', 'yellow');

    // Use pg_dump directly with the public URL
    execSync(`pg_dump "${databaseUrl}" -f ${DUMP_FILE}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 600000, // 10 minute timeout
      maxBuffer: 100 * 1024 * 1024 // 100MB buffer
    });

    log('✓ Export completed successfully!', 'green');
  } catch (error: unknown) {
    log('✗ Export failed', 'red');

    if (error instanceof Error && 'stderr' in error) {
      const stderr = (error as { stderr?: string }).stderr || '';
      log(`Error: ${stderr}`, 'red');

      if (stderr.includes('could not translate host name')) {
        log('\n💡 The URL still contains an internal hostname.', 'yellow');
        log('   Make sure you copied the PUBLIC_URL, not PRIVATE_URL', 'yellow');
      } else if (stderr.includes('password authentication failed')) {
        log('\n💡 Authentication failed. The URL might be incorrect or expired.', 'yellow');
        log('   Get a fresh URL from Railway dashboard.', 'yellow');
      }
    }
    throw error;
  }

  // Verify dump file
  if (!fs.existsSync(DUMP_PATH)) {
    log('✗ Dump file was not created', 'red');
    process.exit(1);
  }

  const stats = fs.statSync(DUMP_PATH);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  if (stats.size < 100) {
    log('⚠️  Warning: Dump file is very small, may be incomplete', 'yellow');
  }

  log(`✓ Dump file created: ${DUMP_FILE} (${fileSizeMB} MB)`, 'green');
}

async function createBackupDatabase() {
  log('\n=== Setting Up Local Backup Database ===', 'magenta');

  const password = process.env.DB_PASSWORD || 'Superculture1@';

  // Check if backup database exists
  try {
    const checkDb = `psql -U postgres -h localhost -lqt`;
    const result = execSync(checkDb, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: password },
    });

    if (result.includes(BACKUP_DB_NAME)) {
      const answer = await askQuestion(
        `\n${colors.yellow}⚠️  Database '${BACKUP_DB_NAME}' already exists. Drop and recreate? (yes/no): ${colors.reset}`
      );

      if (answer.toLowerCase() !== 'yes') {
        log('Operation cancelled by user', 'yellow');
        process.exit(0);
      }

      log(`→ Dropping existing ${BACKUP_DB_NAME} database...`, 'blue');
      execSync(`psql -U postgres -h localhost -c "DROP DATABASE ${BACKUP_DB_NAME};"`, {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: password },
      });
      log(`✓ Dropped existing database`, 'green');
    }
  } catch (error) {
    // Database doesn't exist, continue
  }

  // Create new backup database
  log(`→ Creating ${BACKUP_DB_NAME} database...`, 'blue');
  execSync(`psql -U postgres -h localhost -c "CREATE DATABASE ${BACKUP_DB_NAME};"`, {
    stdio: 'pipe',
    env: { ...process.env, PGPASSWORD: password },
  });
  log(`✓ Created ${BACKUP_DB_NAME} database`, 'green');
}

async function importToLocal() {
  log('\n=== Importing to Local Database ===', 'magenta');

  const password = process.env.DB_PASSWORD || 'Superculture1@';

  log(`→ Importing database dump...`, 'blue');
  log(`   This may take a few minutes for large databases...`, 'yellow');

  execSync(`psql -U postgres -h localhost -d ${BACKUP_DB_NAME} -f ${DUMP_FILE}`, {
    stdio: 'pipe',
    env: { ...process.env, PGPASSWORD: password },
  });

  log(`✓ Import completed`, 'green');

  // Verify import
  try {
    const result = execSync(
      `psql -U postgres -h localhost -d ${BACKUP_DB_NAME} -c "SELECT COUNT(*) FROM users;"`,
      {
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: password },
      }
    );
    log('✓ Database verified successfully', 'green');
  } catch {
    log('⚠️  Could not verify import (tables may still be loading)', 'yellow');
  }
}

async function printNextSteps() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'green');
  log('║  ✓ Production Database Downloaded Successfully!              ║', 'green');
  log('╚═══════════════════════════════════════════════════════════════╝', 'green');

  log('\n📝 Next Steps:', 'cyan');

  log('\n1. Update your .env file:', 'blue');
  log('   Change this line:', 'reset');
  log(`   ${colors.red}DB_NAME="mp3_manager"${colors.reset}`, 'reset');
  log('   To:', 'reset');
  log(`   ${colors.green}DB_NAME="${BACKUP_DB_NAME}"${colors.reset}`, 'reset');

  log('\n2. Restart your dev server:', 'blue');
  log('   Press Ctrl+C in your terminal running npm run dev', 'reset');
  log('   Then run: npm run dev', 'reset');

  log('\n3. Test your app at: http://localhost:3000', 'blue');
  log('   You\'re now using production data locally!', 'reset');

  log('\n4. To switch back to your local dev database:', 'blue');
  log(`   Change .env back to: DB_NAME="mp3_manager"`, 'reset');
  log('   Restart dev server', 'reset');

  log(`\n💾 Dump file saved as: ${colors.yellow}${DUMP_FILE}${colors.reset}`, 'reset');
  log('   Keep it for faster re-imports or delete to save space', 'reset');

  log(`\n⚠️  REMEMBER: Changes to ${colors.yellow}${BACKUP_DB_NAME}${colors.reset} won't affect production!`, 'yellow');
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'magenta');
  log('║  Simple Railway Production Database Download                ║', 'magenta');
  log('╚═══════════════════════════════════════════════════════════════╝', 'magenta');

  try {
    // Check if dump file already exists
    if (fs.existsSync(DUMP_PATH)) {
      const answer = await askQuestion(
        `\n${colors.yellow}Found existing dump file: ${DUMP_FILE}\nUse existing file? (yes/no): ${colors.reset}`
      );

      if (answer.toLowerCase() === 'yes') {
        log('✓ Using existing dump file', 'green');
      } else {
        // Get DATABASE_URL and export
        const databaseUrl = await getPublicDatabaseUrl();
        await exportDatabase(databaseUrl);
      }
    } else {
      // Get DATABASE_URL and export
      const databaseUrl = await getPublicDatabaseUrl();
      await exportDatabase(databaseUrl);
    }

    // Create backup database
    await createBackupDatabase();

    // Import to local
    await importToLocal();

    // Print next steps
    await printNextSteps();

  } catch (error) {
    log('\n✗ Download process failed', 'red');
    log(`Error: ${error}`, 'red');
    process.exit(1);
  }
}

// Run the script
main();
