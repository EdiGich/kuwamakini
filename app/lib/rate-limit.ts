type RateLimitEntry = {
  count: number
  timestamp: number
}

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 3

const ipStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = ipStore.get(ip)

  if (!entry) {
    ipStore.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
    ipStore.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (entry.count >= MAX_REQUESTS) {
    return false
  }

  entry.count += 1
  return true
}

const contactIpStore = new Map<string, RateLimitEntry>()
const CONTACT_RATE_LIMIT_WINDOW = 12 * 60 * 60 * 1000 // 12 hours
const CONTACT_MAX_REQUESTS = 2

export function checkContactRateLimit(ip: string) {
  const now = Date.now()
  const entry = contactIpStore.get(ip)

  if (!entry) {
    contactIpStore.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (now - entry.timestamp > CONTACT_RATE_LIMIT_WINDOW) {
    contactIpStore.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (entry.count >= CONTACT_MAX_REQUESTS) {
    return false
  }

  entry.count += 1
  return true
}