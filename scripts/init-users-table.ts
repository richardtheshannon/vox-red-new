import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { pool, closeDatabase } from '../src/lib/db'

const createUsersTable = `
-- User Authentication and Management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Apply updated_at trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initializeUsersTables() {
  try {
    console.log('🔄 Initializing users table...')

    const client = await pool.connect()
    try {
      // Execute the CREATE TABLE script
      await client.query(createUsersTable)
      console.log('✅ Users table created successfully')
      console.log('   - users (with email index, role index)')
      console.log('   - Triggers applied')
    } finally {
      client.release()
    }

    console.log('🎉 Users table initialization completed!')
  } catch (error) {
    console.error('❌ Users table initialization failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeUsersTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { initializeUsersTables }
