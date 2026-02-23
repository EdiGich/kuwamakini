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