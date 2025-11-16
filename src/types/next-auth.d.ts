import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extend the built-in session.user type
   */
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'admin' | 'user'
    }
  }

  /**
   * Extend the built-in user type
   */
  interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT token type
   */
  interface JWT {
    id: string
    role: 'admin' | 'user'
  }
}
