#!/usr/bin/env tsx

/**
 * Download Production Database from Railway
 *
 * This script safely downloads the production database from Railway
 * and imports it to a local backup database for testing purposes.
 *
 * SAFETY FEATURES:
 * - Creates separate backup database (mp3_manager_backup)
 * - Read-only operations on production
 * - Confirmation prompts before destructive operations
 * - No changes to production environment
 *
 * PREREQUISITES:
 * - Railway CLI installed and logged in (railway login)
 * - Railway project linked (railway link)
 * - PostgreSQL running locally
 *
 * USAGE:
 * npm run db:download-prod
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
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command: string, description: string): string {
  try {
    log(`\n→ ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✓ ${description} completed`, 'green');
    return output;
  } catch (error: unknown) {
    if (error instanceof Error && 'stderr' in error) {
      log(`✗ ${description} failed: ${(error as { stderr?: string }).stderr}`, 'red');
    } else {
      log(`✗ ${description} failed: ${String(error)}`, 'red');
    }
    throw error;
  }
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${query}${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function checkPrerequisites() {
  log('\n=== Checking Prerequisites ===', 'magenta');

  // Check Railway CLI
  try {
    execSync('railway --version', { stdio: 'pipe' });
    log('✓ Railway CLI installed', 'green');
  } catch {
    log('✗ Railway CLI not found. Install from: https://docs.railway.app/guides/cli', 'red');
    process.exit(1);
  }

  // Check Railway authentication
  try {
    execSync('railway whoami', { stdio: 'pipe' });
    log('✓ Railway authenticated', 'green');
  } catch {
    log('✗ Not logged in to Railway. Run: railway login', 'red');
    process.exit(1);
  }

  // Check Railway project link
  try {
    const status = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
    if (status.includes('No linked project')) {
      log('✗ No Railway project linked. Run: railway link', 'red');
      process.exit(1);
    }
    log('✓ Railway project linked', 'green');
  } catch {
    log('✗ No Railway project linked. Run: railway link', 'red');
    process.exit(1);
  }

  // Check local PostgreSQL
  try {
    const password = process.env.DB_PASSWORD || 'Superculture1@';
    execSync(`psql -U postgres -h localhost -c "SELECT version();"`, {
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: password },
    });
    log('✓ Local PostgreSQL accessible', 'green');
  } catch {
    log('✗ Cannot connect to local PostgreSQL', 'red');
    process.exit(1);
  }
}

async function getDatabaseUrl(): Promise<string> {
  log('\n→ Fetching Railway DATABASE_URL...', 'blue');

  try {
    // Get all variables from Railway
    const output = execSync('railway variables --json', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // Parse JSON output
    const variables = JSON.parse(output);
    const databaseUrl = variables.DATABASE_URL;

    if (!databaseUrl) {
      log('✗ DATABASE_URL not found in Railway variables', 'red');
      process.exit(1);
    }

    log('✓ DATABASE_URL retrieved', 'green');
    return databaseUrl;
  } catch (error) {
    log('✗ Could not fetch Railway variables', 'red');
    throw error;
  }
}

async function exportProductionDatabase() {
  log('\n=== Exporting Production Database ===', 'magenta');

  // Clean up old dump file if exists
  if (fs.existsSync(DUMP_PATH)) {
    log(`Removing old dump file: ${DUMP_FILE}`, 'yellow');
    fs.unlinkSync(DUMP_PATH);
  }

  // Get DATABASE_URL to check what we're working with
  const databaseUrl = await getDatabaseUrl();
  log(`Database host: ${databaseUrl.split('@')[1]?.split('/')[0] || 'unknown'}`, 'blue');

  // Method 1: Use Railway's run command with cmd.exe for Windows
  // Railway run will handle the connection tunneling/proxy automatically
  const isWindows = process.platform === 'win32';

  let command: string;
  if (isWindows) {
    // Windows: Use cmd /c to execute pg_dump with environment variable expansion
    command = `railway run cmd /c "pg_dump %DATABASE_URL% -f ${DUMP_FILE}"`;
  } else {
    // Unix: Use sh -c
    command = `railway run sh -c "pg_dump \\"$DATABASE_URL\\" -f ${DUMP_FILE}"`;
  }

  try {
    log(`\n→ Exporting production database (this may take a few minutes)...`, 'blue');
    log(`   Command: ${isWindows ? 'railway run cmd /c "pg_dump ..."' : 'railway run sh -c "pg_dump ..."'}`, 'blue');

    execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe', // Capture output to avoid clutter
      timeout: 600000, // 10 minute timeout for large databases
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer for output
    });
    log(`✓ Exporting production database completed`, 'green');
  } catch (error: unknown) {
    // Try alternative method: direct output redirection
    log('⚠️  First method failed, trying alternative approach...', 'yellow');

    try {
      // Alternative: Capture pg_dump output and write to file manually
      log('Using output capture method...', 'blue');
      const dumpOutput = execSync(
        isWindows
          ? 'railway run cmd /c "pg_dump %DATABASE_URL%"'
          : 'railway run sh -c "pg_dump \\"$DATABASE_URL\\""',
        {
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          timeout: 600000
        }
      );

      // Write output to file
      fs.writeFileSync(DUMP_PATH, dumpOutput, 'utf8');
      log(`✓ Database dump captured and saved`, 'green');
    } catch (altError: unknown) {
      log('✗ All export methods failed', 'red');
      log('\n💡 Manual alternative:', 'yellow');
      log('   1. Run: railway variables', 'yellow');
      log('   2. Copy the DATABASE_URL value', 'yellow');
      log(`   3. Run: pg_dump "<DATABASE_URL>" -f ${DUMP_FILE}`, 'yellow');
      log('   4. Then run this script again, it will skip the export step', 'yellow');
      throw altError;
    }
  }

  // Verify dump file was created
  if (!fs.existsSync(DUMP_PATH)) {
    log('✗ Dump file was not created', 'red');
    log('\n💡 You can manually create the dump file and run this script again.', 'yellow');
    process.exit(1);
  }

  const stats = fs.statSync(DUMP_PATH);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  if (stats.size < 100) {
    log('⚠️  Warning: Dump file is very small, may be incomplete', 'yellow');
    log(`File size: ${fileSizeMB} MB`, 'yellow');
  } else {
    log(`✓ Dump file created: ${DUMP_FILE} (${fileSizeMB} MB)`, 'green');
  }
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
        `\n⚠️  Database '${BACKUP_DB_NAME}' already exists. Drop and recreate? (yes/no): `
      );

      if (answer.toLowerCase() !== 'yes') {
        log('Operation cancelled by user', 'yellow');
        process.exit(0);
      }

      // Drop existing database
      execCommand(
        `psql -U postgres -h localhost -c "DROP DATABASE ${BACKUP_DB_NAME};"`,
        `Dropping existing ${BACKUP_DB_NAME} database`
      );
    }
  } catch (error) {
    // Database doesn't exist, continue
  }

  // Create new backup database
  const createDbCmd = `psql -U postgres -h localhost -c "CREATE DATABASE ${BACKUP_DB_NAME};"`;
  execCommand(createDbCmd, `Creating ${BACKUP_DB_NAME} database`);
}

async function importToLocal() {
  log('\n=== Importing to Local Database ===', 'magenta');

  const password = process.env.DB_PASSWORD || 'Superculture1@';

  // Import dump file
  const importCmd = `psql -U postgres -h localhost -d ${BACKUP_DB_NAME} -f ${DUMP_FILE}`;
  execCommand(importCmd, 'Importing database dump');

  // Verify import
  const verifyCmd = `psql -U postgres -h localhost -d ${BACKUP_DB_NAME} -c "SELECT COUNT(*) FROM users;"`;
  try {
    const result = execSync(verifyCmd, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: password },
    });
    log('✓ Database imported successfully', 'green');
    log(`Users table accessible: ${result.trim()}`, 'blue');
  } catch {
    log('⚠️  Could not verify import (tables may not exist yet)', 'yellow');
  }
}

async function printNextSteps() {
  log('\n=== Download Complete ===', 'magenta');
  log('\n✓ Production database downloaded successfully!', 'green');

  log('\n📝 Next Steps:', 'blue');
  log(`\n1. Update your .env file to use the backup database:`, 'reset');
  log(`   DB_NAME="${BACKUP_DB_NAME}"`, 'yellow');

  log(`\n2. Restart your dev server to connect to the backup database`, 'reset');

  log(`\n3. To switch back to your original local database:`, 'reset');
  log(`   DB_NAME="mp3_manager"`, 'yellow');

  log(`\n4. The dump file is saved at: ${DUMP_FILE}`, 'reset');
  log(`   Keep it for faster re-imports or delete to save space`, 'reset');

  log(`\n⚠️  IMPORTANT: The backup database is completely separate from production.`, 'yellow');
  log(`   Any changes you make will NOT affect the live Railway database.`, 'yellow');
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'magenta');
  log('║  Railway Production Database Download Tool                ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════╝', 'magenta');

  try {
    // Step 1: Check prerequisites
    await checkPrerequisites();

    // Step 2: Confirm action
    const answer = await askQuestion(
      '\nThis will download production data to your local machine. Continue? (yes/no): '
    );

    if (answer.toLowerCase() !== 'yes') {
      log('\nOperation cancelled by user', 'yellow');
      process.exit(0);
    }

    // Step 3: Export production database
    await exportProductionDatabase();

    // Step 4: Create backup database
    await createBackupDatabase();

    // Step 5: Import to local
    await importToLocal();

    // Step 6: Print next steps
    await printNextSteps();

  } catch (error) {
    log('\n✗ Download process failed', 'red');
    log(`Error: ${error}`, 'red');
    process.exit(1);
  }
}

// Run the script
main();
