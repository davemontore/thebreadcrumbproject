// Simple authentication system for the journal app
export class SimpleAuth {
  private static readonly AUTH_KEY = 'journal_auth'
  private static readonly PASSWORD_KEY = 'journal_password_hash'
  private static readonly SESSION_KEY = 'journal_session'

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const session = localStorage.getItem(this.SESSION_KEY)
    if (!session) return false

    try {
      const sessionData = JSON.parse(session)
      const now = Date.now()
      
      // Session expires after 24 hours
      if (now - sessionData.timestamp > 24 * 60 * 60 * 1000) {
        this.logout()
        return false
      }
      
      return true
    } catch {
      this.logout()
      return false
    }
  }

  // Check if password is set up
  static isPasswordSet(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(this.PASSWORD_KEY)
  }

  // Set up password (first time use)
  static async setupPassword(password: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    try {
      const hash = await this.hashPassword(password)
      localStorage.setItem(this.PASSWORD_KEY, hash)
      this.createSession()
      return true
    } catch (error) {
      console.error('Error setting up password:', error)
      return false
    }
  }

  // Login with password
  static async authenticate(password: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    try {
      const storedHash = localStorage.getItem(this.PASSWORD_KEY)
      if (!storedHash) return false

      const inputHash = await this.hashPassword(password)
      
      if (inputHash === storedHash) {
        this.createSession()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error during login:', error)
      return false
    }
  }

  // Logout
  static logout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.SESSION_KEY)
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    try {
      // Verify current password
      const storedHash = localStorage.getItem(this.PASSWORD_KEY)
      if (!storedHash) return false

      const currentHash = await this.hashPassword(currentPassword)
      if (currentHash !== storedHash) return false

      // Set new password
      const newHash = await this.hashPassword(newPassword)
      localStorage.setItem(this.PASSWORD_KEY, newHash)
      
      return true
    } catch (error) {
      console.error('Error changing password:', error)
      return false
    }
  }

  // Private methods
  private static createSession(): void {
    if (typeof window === 'undefined') return
    
    const sessionData = {
      timestamp: Date.now(),
      authenticated: true
    }
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
  }

  private static async hashPassword(password: string): Promise<string> {
    // Use Web Crypto API for secure hashing
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
} 