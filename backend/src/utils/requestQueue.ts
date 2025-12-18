/**
 * Simple in-memory request queue with concurrency control
 * Used to limit concurrent AI analysis requests to prevent API abuse
 */

class RequestQueue {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add a request to the queue
   * @param fn Function to execute
   * @returns Promise that resolves when the function completes
   */
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        resolve,
        reject,
      });
      this.process();
    });
  }

  /**
   * Process the queue, respecting maxConcurrent limit
   */
  private async process() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing++;
    const task = this.queue.shift()!;

    try {
      await task.fn();
    } catch (error) {
      // Error already handled in task.fn
      console.error('Request queue error:', error);
    } finally {
      this.processing--;
      // Process next task
      setImmediate(() => this.process());
    }
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Export singleton instance for AI analysis
export const aiRequestQueue = new RequestQueue(3); // Max 3 concurrent AI requests

