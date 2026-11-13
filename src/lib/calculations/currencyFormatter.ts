/**
 * Currency and Number Formatting Helpers for Indian Rupees (INR)
 */

export function formatINR(amount: number, options?: { compact?: boolean; hideSymbol?: boolean }): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return options?.hideSymbol ? '0' : '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (options?.compact) {
    if (absAmount >= 10000000) {
      // Crores
      const val = (absAmount / 10000000).toFixed(2);
      return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${parseFloat(val)} Cr`;
    }
    if (absAmount >= 100000) {
      // Lakhs
      const val = (absAmount / 100000).toFixed(2);
      return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${parseFloat(val)} L`;
    }
    if (absAmount >= 1000) {
      // Thousands
      const val = (absAmount / 1000).toFixed(1);
      return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${parseFloat(val)} k`;
    }
  }

  // Standard Indian Number Format
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${formatted}`;
}

export function formatPercentage(val: number, decimals = 1): string {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(decimals)}%`;
}

export function formatDateIndian(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
