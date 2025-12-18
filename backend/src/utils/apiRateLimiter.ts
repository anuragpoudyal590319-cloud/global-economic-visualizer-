/**
 * Simple rate limiter for external API calls
 * Prevents hitting rate limits on World Bank, Exchange Rate APIs, etc.
 */

class APIRateLimiter {
  private lastCall: number = 0;
  private minDelay: number;
  private name: string;

  constructor(name: string, minDelayMs: number) {
    this.name = name;
    this.minDelay = minDelayMs;
  }

  /**
   * Wait if necessary to respect rate limit
   */
  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastCall = Date.now();
  }

  /**
   * Get current status
   */
  getStatus() {
    const timeSinceLastCall = Date.now() - this.lastCall;
    return {
      name: this.name,
      minDelay: this.minDelay,
      timeSinceLastCall,
      canCallNow: timeSinceLastCall >= this.minDelay,
    };
  }
}

// Export rate limiters for different APIs
export const worldBankLimiter = new APIRateLimiter('World Bank', 1000); // 1 request per second
export const exchangeRateLimiter = new APIRateLimiter('Exchange Rate', 500); // 2 requests per second
export const geminiLimiter = new APIRateLimiter('Gemini AI', 2000); // 1 request per 2 seconds

