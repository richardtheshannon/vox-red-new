import { Pool, PoolClient } from 'pg'

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mp3_manager',
  max: 10, // Reduced for Railway limits
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 20000, // Increased timeout for Railway (20 seconds)
  statement_timeout: 45000, // Increased statement timeout for Railway (45 seconds)
  query_timeout: 45000, // Increased query timeout for Railway (45 seconds)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // SSL for Railway
}

// Create connection pool
const pool = new Pool(dbConfig)

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// Export the pool for direct use
export { pool }

// Helper function to execute queries
export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect()
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
  const client = await pool.connect()
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
  await pool.end()
}