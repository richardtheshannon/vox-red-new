import { Pool, PoolClient } from 'pg'

// Function to get database configuration (evaluated at runtime, not import time)
function getDbConfig() {
  const config = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 10, // Reduced for Railway limits
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 20000, // Increased timeout for Railway (20 seconds)
        statement_timeout: 45000, // Increased statement timeout for Railway (45 seconds)
        query_timeout: 45000, // Increased query timeout for Railway (45 seconds)
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // SSL for Railway
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'mp3_manager',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
        statement_timeout: 45000,
        query_timeout: 45000,
        ssl: false,
      }

  // Database configuration ready

  return config
}

// Lazy pool creation
let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool(getDbConfig())

    // Handle pool errors
    _pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }
  return _pool
}

// Export the pool with lazy initialization
export const pool = { connect: () => getPool().connect() }

// Helper function to execute queries
export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

// Helper function to execute queries and return a single row
export async function queryOne<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows.length > 0 ? rows[0] : null
}

// Helper function to execute queries and return count
export async function queryCount(text: string, params?: unknown[]): Promise<number> {
  const result = await queryOne<{ count: string }>(text, params)
  return result ? parseInt(result.count, 10) : 0
}

// Transaction helper
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Health check function with detailed logging
export async function healthCheck(): Promise<boolean> {
  try {
    console.log('Starting database health check...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

    const result = await query('SELECT 1 as health')
    console.log('Health check query result:', result)
    return true
  } catch (error) {
    console.error('Database health check failed:')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set')
    return false
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  if (_pool) {
    await _pool.end()
    _pool = null
  }
}