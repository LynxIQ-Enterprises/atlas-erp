// South African localization utilities
// Currency: ZAR (R)
// Date format: YYYY-MM-DD
// Time format: 24-hour
// Timezone: Africa/Johannesburg

import { format, parseISO } from 'date-fns';

const SA_LOCALE = 'en-ZA';
const SA_TIMEZONE = 'Africa/Johannesburg';

/**
 * Format currency in ZAR (South African Rand)
 */
export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  const formatter = new Intl.NumberFormat(SA_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Format compact currency (e.g., R 1.2k, R 45.5M)
 */
export function formatCompactCurrency(amount: number, currency: string = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : currency;
  if (amount >= 1000000) {
    return `${symbol} ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol} ${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, currency);
}

/**
 * Format date in SA format (YYYY-MM-DD)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Format date for display (e.g., 28 Dec 2025)
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

/**
 * Format datetime in SA format (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm');
}

/**
 * Format time in 24-hour format
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

/**
 * Get current date in SA timezone
 */
export function getCurrentDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: SA_TIMEZONE }));
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = getCurrentDate();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDisplayDate(d);
}

/**
 * Format number with SA formatting
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(SA_LOCALE).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}
