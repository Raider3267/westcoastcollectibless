// User authentication utilities
export interface User {
  id: string
  email: string
  name?: string
  tier: 'basic' | 'early_access' | 'collectors_club'
  joined_date: string
  wishlist: string[] // Array of product IDs
  alerts: ProductAlert[]
  collection_photos?: CollectionPhoto[]
}

export interface ProductAlert {
  id: string
  product_id: string
  user_id: string
  alert_type: 'restock' | 'price_drop' | 'new_drop'
  created_at: string
  is_active: boolean
}

export interface CollectionPhoto {
  id: string
  user_id: string
  image_url: string
  caption?: string
  products_featured: string[] // Array of product IDs
  created_at: string
  likes: number
}

export interface VIPTier {
  id: string
  name: string
  benefits: string[]
  early_access_hours: number
  discount_percentage: number
  exclusive_access: boolean
  price_monthly?: number
  price_yearly?: number
  badge_color: string
  description: string
  featured_benefits: string[]
}

export const VIP_TIERS: VIPTier[] = [
  {
    id: 'basic',
    name: 'Collector',
    description: 'Perfect for casual collectors who want to stay in the loop',
    benefits: [
      'Email alerts for new drops',
      'Personal wishlist',
      'Community access',
      'Standard customer support',
      'Drop calendar access'
    ],
    featured_benefits: ['Free to join', 'Basic alerts', 'Wishlist'],
    early_access_hours: 0,
    discount_percentage: 0,
    exclusive_access: false,
    badge_color: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
    price_monthly: 0,
    price_yearly: 0
  },
  {
    id: 'early_access',
    name: 'Early Access',
    description: 'Get ahead of the crowd with exclusive early access to all drops',
    benefits: [
      '24-hour early access to all drops',
      '5% discount on all purchases',
      'Priority email alerts',
      'Exclusive drop previews',
      'Advanced drop notifications',
      'Priority customer support',
      'Early access badge'
    ],
    featured_benefits: ['24hr early access', '5% discount', 'Priority alerts'],
    early_access_hours: 24,
    discount_percentage: 5,
    exclusive_access: false,
    badge_color: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    price_monthly: 9.99,
    price_yearly: 99.99
  },
  {
    id: 'collectors_club',
    name: "Collector's Club",
    description: 'The ultimate experience for serious collectors with exclusive perks',
    benefits: [
      '48-hour early access to all drops',
      '10% discount on all purchases',
      'Exclusive member-only items',
      'VIP customer support',
      'Free shipping on all orders',
      'Monthly exclusive collectible',
      'Access to limited vault items',
      'Collector networking events',
      'Premium badge & profile flair'
    ],
    featured_benefits: ['48hr early access', '10% discount', 'Exclusive items', 'Free shipping'],
    early_access_hours: 48,
    discount_percentage: 10,
    exclusive_access: true,
    badge_color: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    price_monthly: 19.99,
    price_yearly: 199.99
  }
]

// Local storage key for demo purposes
const USER_STORAGE_KEY = 'wcc_current_user'
const USERS_STORAGE_KEY = 'wcc_users'

export class AuthService {
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userData = localStorage.getItem(USER_STORAGE_KEY)
    return userData ? JSON.parse(userData) : null
  }

  static setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return
    
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  static async signUp(email: string, password: string, name?: string): Promise<User> {
    // Demo implementation - in real app, this would call your backend
    const users = this.getUsers()
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists')
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      tier: 'basic',
      joined_date: new Date().toISOString(),
      wishlist: [],
      alerts: [],
      collection_photos: []
    }

    users.push(newUser)
    this.saveUsers(users)
    this.setCurrentUser(newUser)
    
    return newUser
  }

  static async signIn(email: string, password: string): Promise<User> {
    // Demo implementation
    const users = this.getUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    this.setCurrentUser(user)
    return user
  }

  static signOut(): void {
    this.setCurrentUser(null)
  }

  static addToWishlist(productId: string): void {
    const user = this.getCurrentUser()
    if (!user) return

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId)
      this.setCurrentUser(user)
      this.updateUserInStorage(user)
    }
  }

  static removeFromWishlist(productId: string): void {
    const user = this.getCurrentUser()
    if (!user) return

    user.wishlist = user.wishlist.filter(id => id !== productId)
    this.setCurrentUser(user)
    this.updateUserInStorage(user)
  }

  static isInWishlist(productId: string): boolean {
    const user = this.getCurrentUser()
    return user ? user.wishlist.includes(productId) : false
  }

  static createAlert(productId: string, alertType: ProductAlert['alert_type']): void {
    const user = this.getCurrentUser()
    if (!user) return

    const alert: ProductAlert = {
      id: `alert-${Date.now()}`,
      product_id: productId,
      user_id: user.id,
      alert_type: alertType,
      created_at: new Date().toISOString(),
      is_active: true
    }

    user.alerts.push(alert)
    this.setCurrentUser(user)
    this.updateUserInStorage(user)
  }

  private static getUsers(): User[] {
    if (typeof window === 'undefined') return []
    
    const usersData = localStorage.getItem(USERS_STORAGE_KEY)
    return usersData ? JSON.parse(usersData) : []
  }

  private static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  private static updateUserInStorage(updatedUser: User): void {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users[index] = updatedUser
      this.saveUsers(users)
    }
  }
}