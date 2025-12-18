import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple file-based lock mechanism for scheduler
 * Prevents multiple instances from running cron jobs simultaneously
 * Lock expires after 1 hour (in case of crash)
 */

const lockFile = path.join(__dirname, '../../data/.scheduler.lock');
const lockDir = path.dirname(lockFile);

// Ensure data directory exists
if (!fs.existsSync(lockDir)) {
  fs.mkdirSync(lockDir, { recursive: true });
}

/**
 * Try to acquire a lock
 * @returns true if lock was acquired, false if lock already exists
 */
export async function acquireLock(): Promise<boolean> {
  try {
    if (fs.existsSync(lockFile)) {
      const lockTime = fs.statSync(lockFile).mtime;
      const age = Date.now() - lockTime.getTime();
      
      // Lock expires after 1 hour (in case of crash)
      if (age > 60 * 60 * 1000) {
        console.log('Removing expired lock file');
        fs.unlinkSync(lockFile);
      } else {
        return false; // Lock exists and is valid
      }
    }
    
    // Create lock file with current timestamp
    fs.writeFileSync(lockFile, Date.now().toString(), { flag: 'wx' });
    return true;
  } catch (error) {
    // Lock file creation failed (likely already exists)
    return false;
  }
}

/**
 * Release the lock
 */
export function releaseLock(): void {
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }
  } catch (error) {
    console.error('Error releasing lock:', error);
  }
}

/**
 * Check if lock exists (without acquiring)
 */
export function isLocked(): boolean {
  try {
    if (fs.existsSync(lockFile)) {
      const lockTime = fs.statSync(lockFile).mtime;
      const age = Date.now() - lockTime.getTime();
      
      // Lock expired
      if (age > 60 * 60 * 1000) {
        return false;
      }
      
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

