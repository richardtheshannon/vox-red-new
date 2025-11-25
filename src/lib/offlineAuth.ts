// Offline Authentication Manager - Handles secure credential caching for offline login

/**
 * Offline session data stored in localStorage
 */
export interface OfflineAuthData {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  credentialHash: string; // PBKDF2 hash of email+password
  salt: string; // Random salt for hashing
  cachedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (30 days)
}

/**
 * Session data format compatible with NextAuth
 */
export interface OfflineSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  };
  expires: string; // ISO timestamp
}

const OFFLINE_AUTH_KEY = 'offline-auth-data';
const HASH_ITERATIONS = 100000; // PBKDF2 iterations (strong security)
const SESSION_DURATION_DAYS = 30; // Match NextAuth session duration

/**
 * Generate a cryptographically secure random salt
 */
async function generateSalt(): Promise<string> {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash credentials using PBKDF2 (Web Crypto API)
 * @param email - User email
 * @param password - User password
 * @param salt - Salt for hashing
 * @returns Base64 encoded hash
 */
async function hashCredentials(email: string, password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${email.toLowerCase().trim()}:${password}`);
  const saltBuffer = encoder.encode(salt);

  // Import key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: HASH_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  // Convert to base64
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return btoa(String.fromCharCode(...hashArray));
}

/**
 * Store authentication data for offline use
 * Called after successful online login
 */
export async function storeOfflineAuthData(
  userId: string,
  name: string,
  email: string,
  role: 'admin' | 'user',
  password: string
): Promise<void> {
  try {
    const salt = await generateSalt();
    const credentialHash = await hashCredentials(email, password, salt);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const authData: OfflineAuthData = {
      userId,
      name,
      email: email.toLowerCase().trim(),
      role,
      credentialHash,
      salt,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(authData));
    console.log('[OfflineAuth] Stored offline auth data for user:', email);
  } catch (err) {
    console.error('[OfflineAuth] Failed to store auth data:', err);
    throw err;
  }
}

/**
 * Verify credentials against cached offline data
 * @returns User data if valid, null if invalid
 */
export async function verifyOfflineCredentials(
  email: string,
  password: string
): Promise<OfflineSession | null> {
  try {
    const authDataStr = localStorage.getItem(OFFLINE_AUTH_KEY);
    if (!authDataStr) {
      console.log('[OfflineAuth] No offline auth data found');
      return null;
    }

    const authData: OfflineAuthData = JSON.parse(authDataStr);

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(authData.expiresAt);
    if (now > expiresAt) {
      console.log('[OfflineAuth] Cached credentials expired');
      clearOfflineAuthData();
      return null;
    }

    // Check email match
    if (authData.email !== email.toLowerCase().trim()) {
      console.log('[OfflineAuth] Email mismatch');
      return null;
    }

    // Verify password hash
    const inputHash = await hashCredentials(email, password, authData.salt);
    if (inputHash !== authData.credentialHash) {
      console.log('[OfflineAuth] Password verification failed');
      return null;
    }

    // Create offline session
    const session: OfflineSession = {
      user: {
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role
      },
      expires: authData.expiresAt
    };

    console.log('[OfflineAuth] Credentials verified successfully for:', email);
    return session;
  } catch (err) {
    console.error('[OfflineAuth] Error verifying credentials:', err);
    return null;
  }
}

/**
 * Get cached offline auth data (without password verification)
 * Used for session restoration on mount
 */
export function getOfflineAuthData(): OfflineAuthData | null {
  try {
    const authDataStr = localStorage.getItem(OFFLINE_AUTH_KEY);
    if (!authDataStr) {
      return null;
    }

    const authData: OfflineAuthData = JSON.parse(authDataStr);

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(authData.expiresAt);
    if (now > expiresAt) {
      console.log('[OfflineAuth] Cached session expired');
      clearOfflineAuthData();
      return null;
    }

    return authData;
  } catch (err) {
    console.error('[OfflineAuth] Error reading auth data:', err);
    return null;
  }
}

/**
 * Create an offline session from cached auth data
 * Used when restoring session on mount (no password required)
 */
export function createOfflineSession(authData: OfflineAuthData): OfflineSession {
  return {
    user: {
      id: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role
    },
    expires: authData.expiresAt
  };
}

/**
 * Clear offline authentication data
 * Called on logout or when credentials expire
 */
export function clearOfflineAuthData(): void {
  localStorage.removeItem(OFFLINE_AUTH_KEY);
  console.log('[OfflineAuth] Cleared offline auth data');
}

/**
 * Check if offline auth data exists and is valid
 */
export function hasValidOfflineAuth(): boolean {
  const authData = getOfflineAuthData();
  return authData !== null;
}

/**
 * Get user email from cached auth data (for UI display)
 */
export function getOfflineCachedEmail(): string | null {
  const authData = getOfflineAuthData();
  return authData ? authData.email : null;
}
