// New authentication service that works with the wishlist system

export interface AuthUser {
  id: string
  email: string
  name?: string
  email_verified: boolean
  marketing_opt_in: boolean
  roles?: string[]
}

export interface SignUpData {
  email: string
  password: string
  name?: string
  marketing_opt_in?: boolean
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  private user: AuthUser | null = null
  private listeners: Array<(user: AuthUser | null) => void> = []

  // Subscribe to auth state changes
  subscribe(listener: (user: AuthUser | null) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user))
  }

  // Sign up
  async signUp(data: SignUpData): Promise<AuthUser> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to sign up')
    }

    const { user } = await response.json()
    this.user = user
    this.notifyListeners()
    return user
  }

  // Sign in
  async signIn(data: SignInData): Promise<AuthUser> {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to sign in')
    }

    const { user } = await response.json()
    this.user = user
    this.notifyListeners()
    return user
  }

  // Sign out
  async signOut(): Promise<void> {
    await fetch('/api/auth/signout', {
      method: 'POST',
    })

    this.user = null
    this.notifyListeners()
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.user
  }

  // Initialize - fetch current user from server
  async initialize(): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const { user } = await response.json()
        this.user = user
        this.notifyListeners()
        return user
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
    
    this.user = null
    this.notifyListeners()
    return null
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.user !== null
  }

  // Wishlist operations
  async toggleWishlist(productId: string): Promise<boolean> {
    const response = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    })

    if (!response.ok) {
      throw new Error('Failed to update wishlist')
    }

    const { saved } = await response.json()
    return saved
  }

  async getWishlist(): Promise<string[]> {
    const response = await fetch('/api/wishlist')

    if (!response.ok) {
      throw new Error('Failed to get wishlist')
    }

    const { wishlist } = await response.json()
    return wishlist
  }

  // Subscribe to notifications
  async subscribeToProduct(productId: string, source: 'wishlist' | 'notify_me' = 'wishlist'): Promise<void> {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId, source }),
    })

    if (!response.ok) {
      throw new Error('Failed to subscribe')
    }
  }
}

// Create singleton instance
export const authService = new AuthService()

// Initialize on module load (but don't await it to avoid blocking)
if (typeof window !== 'undefined') {
  authService.initialize().catch(error => {
    console.warn('Auth initialization failed:', error)
  })
}