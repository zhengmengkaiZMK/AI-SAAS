/**
 * 使用次数跟踪服务
 * 用于跟踪未登录用户和已登录用户的搜索使用次数
 */

const GUEST_USAGE_KEY = 'pain_point_guest_usage';
const GUEST_LIMIT = 3;

interface GuestUsage {
  count: number;
  lastReset: string; // ISO date string (date only, not datetime)
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // 只取日期部分
}

/**
 * 检查是否需要重置（跨天）
 */
function shouldReset(lastReset: string): boolean {
  return lastReset !== getTodayDateString();
}

/**
 * 游客模式：获取当前使用次数
 */
export function getGuestUsageCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = localStorage.getItem(GUEST_USAGE_KEY);
    if (!stored) return 0;

    const usage: GuestUsage = JSON.parse(stored);

    // 如果跨天了，重置计数
    if (shouldReset(usage.lastReset)) {
      resetGuestUsage();
      return 0;
    }

    return usage.count;
  } catch (error) {
    console.error('[UsageTracker] Error reading guest usage:', error);
    return 0;
  }
}

/**
 * 游客模式：增加使用次数
 */
export function incrementGuestUsage(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const currentCount = getGuestUsageCount();
    const newCount = currentCount + 1;

    const usage: GuestUsage = {
      count: newCount,
      lastReset: getTodayDateString(),
    };

    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
    return newCount;
  } catch (error) {
    console.error('[UsageTracker] Error incrementing guest usage:', error);
    return 0;
  }
}

/**
 * 游客模式：重置使用次数
 */
export function resetGuestUsage(): void {
  if (typeof window === 'undefined') return;

  try {
    const usage: GuestUsage = {
      count: 0,
      lastReset: getTodayDateString(),
    };
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('[UsageTracker] Error resetting guest usage:', error);
  }
}

/**
 * 游客模式：检查是否还有配额
 */
export function hasGuestQuota(): boolean {
  return getGuestUsageCount() < GUEST_LIMIT;
}

/**
 * 游客模式：获取剩余次数
 */
export function getRemainingGuestQuota(): number {
  return Math.max(0, GUEST_LIMIT - getGuestUsageCount());
}

/**
 * 清除游客使用记录（用户登录后）
 */
export function clearGuestUsage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_USAGE_KEY);
  } catch (error) {
    console.error('[UsageTracker] Error clearing guest usage:', error);
  }
}
