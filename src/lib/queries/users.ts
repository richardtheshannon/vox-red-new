import { query, queryOne, queryCount } from '@/lib/db'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// TypeScript interfaces
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  created_at: Date
  updated_at: Date
}

export interface UserWithPassword extends User {
  password_hash: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: 'admin' | 'user'
}

// Get all users (exclude password_hash for security)
export async function getAllUsers(): Promise<User[]> {
  const sql = 'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
  return await query<User>(sql)
}

// Get user by ID (exclude password_hash)
export async function getUserById(id: string): Promise<User | null> {
  const sql = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1'
  return await queryOne<User>(sql, [id])
}

// Get user by email (includes password_hash for authentication)
export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const sql = 'SELECT * FROM users WHERE email = $1'
  return await queryOne<UserWithPassword>(sql, [email])
}

// Create new user with bcrypt hashed password
// Updated: 2025-11-17 - Set username to NULL for legacy production DB schema compatibility
export async function createUser(data: CreateUserData): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

  // Convert role to uppercase for production CHECK constraint compatibility
  // Production DB requires uppercase roles ('ADMIN', 'USER', 'MODERATOR')

  // Try with username column first (for production DB with legacy schema)
  // Set username to NULL to avoid UNIQUE constraint issues
  try {
    const sqlWithUsername = `
      INSERT INTO users (name, email, password_hash, role, username)
      VALUES ($1, $2, $3, $4, NULL)
      RETURNING id, name, email, role, created_at, updated_at
    `

    const user = await queryOne<User>(sqlWithUsername, [
      data.name,
      data.email,
      hashedPassword,
      data.role.toUpperCase(),
    ])

    if (!user) throw new Error('Failed to create user')
    return user
  } catch (error) {
    // If username column doesn't exist, try without it
    if (error instanceof Error && error.message.includes('column "username" of relation "users" does not exist')) {
      const sqlWithoutUsername = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
      `

      const user = await queryOne<User>(sqlWithoutUsername, [
        data.name,
        data.email,
        hashedPassword,
        data.role.toUpperCase(),
      ])

      if (!user) throw new Error('Failed to create user')
      return user
    }
    // Re-throw if it's a different error
    throw error
  }
}

// Update user (name, email, role only - password updated via separate function)
export async function updateUser(id: string, data: UpdateUserData): Promise<User | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  // Build dynamic SET clause
  if (data.name !== undefined) {
    fields.push(`name = $${paramCount++}`)
    values.push(data.name)
  }
  if (data.email !== undefined) {
    fields.push(`email = $${paramCount++}`)
    values.push(data.email)
  }
  if (data.role !== undefined) {
    fields.push(`role = $${paramCount++}`)
    values.push(data.role)
  }

  if (fields.length === 0) {
    return getUserById(id) // No updates, return existing user
  }

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, created_at, updated_at`
  values.push(id)

  return await queryOne<User>(sql, values)
}

// Update user password (separate function for security)
export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

  const sql = 'UPDATE users SET password_hash = $1 WHERE id = $2'
  await query(sql, [hashedPassword, id])
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [id])
}

// Get total user count (for setup page check)
export async function getUserCount(): Promise<number> {
  return await queryCount('SELECT COUNT(*) as count FROM users')
}
