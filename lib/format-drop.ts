/**
 * Format a release_at datetime into user-friendly drop format
 * Example: "Aug 19, 12:30 PM PT"
 */
export function formatDrop(releaseAt: string | null | undefined): string {
  if (!releaseAt) return ''
  
  try {
    const date = new Date(releaseAt)
    
    // Format in local timezone
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }
    
    return date.toLocaleString('en-US', options)
  } catch (error) {
    console.error('Error formatting drop date:', error)
    return ''
  }
}

/**
 * Check if a drop date is in the future
 */
export function isUpcomingDrop(releaseAt: string | null | undefined): boolean {
  if (!releaseAt) return false
  
  try {
    const date = new Date(releaseAt)
    return date.getTime() > Date.now()
  } catch (error) {
    return false
  }
}

/**
 * Get time until drop in a human-readable format
 */
export function getTimeUntilDrop(releaseAt: string | null | undefined): string {
  if (!releaseAt) return ''
  
  try {
    const date = new Date(releaseAt)
    const now = Date.now()
    const diff = date.getTime() - now
    
    if (diff <= 0) return 'Available now'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  } catch (error) {
    return ''
  }
}