import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { MARKET_HOURS, DEFAULT_TIMEZONE } from '../constants';

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (!isFinite(value) || isNaN(value) || value === null || value === undefined) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (!isFinite(value) || isNaN(value) || value === null || value === undefined) {
    return '0.00%';
  }
  
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toString();
};

export const formatDate = (date: string | Date, formatStr: string = 'PPP'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const getChangeColor = (change: number): string => {
  if (change > 0) return '#4CAF50';
  if (change < 0) return '#F44336';
  return '#9E9E9E';
};

export const getChangeIcon = (change: number): string => {
  if (change > 0) return '↗';
  if (change < 0) return '↘';
  return '→';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateStockSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z]{1,5}$/;
  return symbolRegex.test(symbol.toUpperCase());
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const calculatePortfolioPerformance = (
  items: Array<{
    quantity: number;
    averagePrice: number;
    currentPrice: number;
  }>
): {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
} => {
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.averagePrice), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
  };
};

export const parseAlphaVantageDate = (dateString: string): Date => {
  return parseISO(dateString);
};

export const formatStockPrice = (price: number): string => {
  if (price < 1) {
    return price.toFixed(4);
  }
  return price.toFixed(2);
};

export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 0;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

export const calculateMovingAverage = (prices: number[], period: number): number[] => {
  const result: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  
  return result;
};

export const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * Math.sqrt(252);
};

export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
};

export const isMarketOpen = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  if (day === 0 || day === 6) return false;
  
  return hour >= 9 && hour < 16;
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const generateChartColors = (count: number): string[] => {
  const colors = [
    '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0',
    '#607D8B', '#795548', '#009688', '#FFEB3B', '#E91E63',
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
};

export const getCurrentTimeInTimezone = (timezone: string = DEFAULT_TIMEZONE): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
};

export const getMarketStatus = (timezone: string = DEFAULT_TIMEZONE): 'open' | 'closed' | 'pre_market' | 'after_hours' => {
  const now = getCurrentTimeInTimezone(timezone);
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentDay = now.getDay();
  
  if (currentDay === 0 || currentDay === 6) {
    return 'closed';
  }
  
  const marketHours = MARKET_HOURS[timezone as keyof typeof MARKET_HOURS] || MARKET_HOURS[DEFAULT_TIMEZONE];
  
  if (currentHour < marketHours.open - 2) {
    return 'closed';
  } else if (currentHour < marketHours.open) {
    return 'pre_market';
  } else if (currentHour >= marketHours.open && currentHour < marketHours.close) {
    return 'open';
  } else if (currentHour >= marketHours.close && currentHour < marketHours.close + 2) {
    return 'after_hours';
  } else {
    return 'closed';
  }
};

export const getGreeting = (timezone: string = DEFAULT_TIMEZONE): string => {
  const now = getCurrentTimeInTimezone(timezone);
  const hour = now.getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

export const getMarketStatusMessage = (timezone: string = DEFAULT_TIMEZONE): string => {
  const status = getMarketStatus(timezone);
  const marketHours = MARKET_HOURS[timezone as keyof typeof MARKET_HOURS] || MARKET_HOURS[DEFAULT_TIMEZONE];
  
  switch (status) {
    case 'open':
      const closeTime = formatTime(marketHours.close);
      return `Market Open • Closes at ${closeTime}`;
    case 'closed':
      const openTime = formatTime(marketHours.open);
      return `Market Closed • Opens at ${openTime}`;
    case 'pre_market':
      const preOpenTime = formatTime(marketHours.open);
      return `Pre-Market • Opens at ${preOpenTime}`;
    case 'after_hours':
      return `After Hours Trading`;
    default:
      return 'Market Closed';
  }
};

const formatTime = (hour: number): string => {
  const hours = Math.floor(hour);
  const minutes = Math.round((hour - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHour}:${displayMinutes} ${period}`;
};