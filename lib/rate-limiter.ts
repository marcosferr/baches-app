// A simple in-memory rate limiter
// In production, use Redis or a similar distributed store

interface RateLimiterOptions {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests in the interval
}

interface RequestRecord {
  count: number
  resetAt: number
}

export class RateLimiter {
  private interval: number
  private maxRequests: number
  private requests: Map<string, RequestRecord>

  constructor(options: RateLimiterOptions) {
    this.interval = options.interval
    this.maxRequests = options.maxRequests
    this.requests = new Map()

    // Clean up expired records every minute
    setInterval(() => this.cleanup(), 60000)
  }

  async check(key: string): Promise<boolean> {
    const now = Date.now()
    const record = this.requests.get(key) || { count: 0, resetAt: now + this.interval }

    // Reset counter if the interval has passed
    if (now > record.resetAt) {
      record.count = 0
      record.resetAt = now + this.interval
    }

    // Check if limit is reached
    if (record.count >= this.maxRequests) {
      return true // Rate limited
    }

    // Increment request count
    record.count += 1
    this.requests.set(key, record)

    return false // Not rate limited
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetAt) {
        this.requests.delete(key)
      }
    }
  }
}

