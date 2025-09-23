/**
 * Time formatting utilities for relative time display
 * 时间格式化工具 - 用于相对时间显示
 */

/**
 * Format a date to relative time string (e.g., "2h ago", "3d ago")
 * 将日期格式化为相对时间字符串（如："2小时前"、"3天前"）
 */
export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  // Handle invalid dates
  if (isNaN(targetDate.getTime())) {
    return locale.startsWith('zh') ? '时间未知' : 'Unknown time';
  }

  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Future dates
  if (diffInMs < 0) {
    return locale.startsWith('zh') ? '刚刚' : 'Just now';
  }

  // Chinese locale
  if (locale.startsWith('zh')) {
    if (diffInSeconds < 60) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInHours < 24) return `${diffInHours}小时前`;
    if (diffInDays < 7) return `${diffInDays}天前`;
    if (diffInWeeks < 4) return `${diffInWeeks}周前`;
    if (diffInMonths < 12) return `${diffInMonths}个月前`;
    return `${diffInYears}年前`;
  }

  // English locale (default)
  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${diffInYears}y ago`;
}

/**
 * Format a date to a more detailed relative time (e.g., "2 hours ago", "3 days ago")
 * 将日期格式化为更详细的相对时间（如："2 hours ago"、"3 days ago"）
 */
export function formatDetailedRelativeTime(date: Date | string, locale: string = 'en'): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  // Handle invalid dates
  if (isNaN(targetDate.getTime())) {
    return locale.startsWith('zh') ? '时间未知' : 'Unknown time';
  }

  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  // Future dates
  if (diffInMs < 0) {
    return locale.startsWith('zh') ? '刚刚' : 'Just now';
  }

  // Chinese locale
  if (locale.startsWith('zh')) {
    if (diffInSeconds < 60) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes} 分钟前`;
    if (diffInHours < 24) return `${diffInHours} 小时前`;
    if (diffInDays < 7) return `${diffInDays} 天前`;
    if (diffInWeeks < 4) return `${diffInWeeks} 周前`;
    if (diffInMonths < 12) return `${diffInMonths} 个月前`;
    return targetDate.toLocaleDateString('zh-CN');
  }

  // English locale (default)
  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes === 1) return '1 minute ago';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInWeeks === 1) return '1 week ago';
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  if (diffInMonths === 1) return '1 month ago';
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  // For dates older than a year, show the actual date
  return targetDate.toLocaleDateString('en-US');
}

/**
 * Get the appropriate time formatter based on context
 * 根据上下文获取合适的时间格式化器
 */
export function getTimeFormatter(detailed: boolean = false) {
  return detailed ? formatDetailedRelativeTime : formatRelativeTime;
}