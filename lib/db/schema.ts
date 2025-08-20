// Database schema types for the wishlist system

export interface User {
  id: string
  name?: string | null
  email: string
  password_hash: string
  email_verified_at?: Date | null
  marketing_opt_in: boolean
  terms_accepted_at: Date
  created_at: Date
  updated_at: Date
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: Date
}

export interface NotificationSubscription {
  id: string
  user_id: string
  product_id: string
  source: 'wishlist' | 'notify_me' | 'admin_add'
  created_at: Date
}

// For future multi-list support (keeping as TODO for now)
export interface SavedList {
  id: string
  user_id: string
  name: string
  created_at: Date
}

export interface SavedListItem {
  id: string
  saved_list_id: string
  product_id: string
  created_at: Date
}

// Session type for auth
export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}