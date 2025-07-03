export const API_CONFIG = {
  BASE_URL: 'https://www.alphavantage.co/query',
  DEFAULT_FUNCTION: 'GLOBAL_QUOTE',
  TIME_SERIES_FUNCTION: 'TIME_SERIES_DAILY',
  SEARCH_FUNCTION: 'SYMBOL_SEARCH',
  NEWS_FUNCTION: 'NEWS_SENTIMENT',
  TOP_GAINERS_LOSERS_FUNCTION: 'TOP_GAINERS_LOSERS',
};

export const APP_CONSTANTS = {
  APP_NAME: 'Stoxify',
  VERSION: '1.0.0',
  CURRENCY: 'USD',
  DEFAULT_TIMEOUT: 10000,
  REFRESH_INTERVAL: 30000,
};

export const LIGHT_COLORS = {
  PRIMARY: '#2563EB',
  SECONDARY: '#F59E0B',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  BACKGROUND: '#F8FAFC',
  SURFACE: '#FFFFFF',
  CARD: '#FFFFFF',
  HEADER: '#2563EB',
  TEXT_PRIMARY: '#1E293B',
  TEXT_SECONDARY: '#64748B',
  TEXT_DISABLED: '#94A3B8',
  TEXT_ON_PRIMARY: '#FFFFFF',
  GAIN: '#10B981',
  LOSS: '#EF4444',
  NEUTRAL: '#6B7280',
  GRADIENT_START: '#2563EB',
  GRADIENT_END: '#3B82F6',
  BORDER: '#E2E8F0',
  DIVIDER: '#F1F5F9',
};

export const DARK_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#FBBF24',
  SUCCESS: '#34D399',
  ERROR: '#F87171',
  WARNING: '#FBBF24',
  INFO: '#60A5FA',
  BACKGROUND: '#0F172A',
  SURFACE: '#1E293B',
  CARD: '#334155',
  HEADER: '#3B82F6',
  TEXT_PRIMARY: '#F8FAFC',
  TEXT_SECONDARY: '#CBD5E1',
  TEXT_DISABLED: '#64748B',
  TEXT_ON_PRIMARY: '#FFFFFF',
  GAIN: '#34D399',
  LOSS: '#F87171',
  NEUTRAL: '#94A3B8',
  GRADIENT_START: '#3B82F6',
  GRADIENT_END: '#60A5FA',
  BORDER: '#334155',
  DIVIDER: '#1E293B',
};

export const COLORS = LIGHT_COLORS;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

export const FONT_SIZES = {
  XS: 10,
  SM: 12,
  MD: 14,
  LG: 16,
  XL: 18,
  XXL: 20,
  XXXL: 24,
  LARGE: 28,
  HUGE: 32,
};

export const SCREEN = {
  WIDTH: 100,
  HEIGHT: 100,
};

export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

export const STORAGE_KEYS = {
  USER_DATA: '@stoxify_user',
  PORTFOLIO: '@stoxify_portfolio',
  WATCHLIST: '@stoxify_watchlist',
  WATCHLISTS: '@stoxify_watchlists',
  SETTINGS: '@stoxify_settings',
  API_KEY: '@stoxify_api_key',
  THEME: '@stoxify_theme',
  AVATAR: '@stoxify_avatar',
  TIMEZONE: '@stoxify_timezone',
  ONBOARDING_COMPLETED: '@stoxify_onboarding',
  HAS_SEEN_ONBOARDING: '@stoxify_has_seen_onboarding',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const AVATAR_OPTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const ONBOARDING_STEPS = [
  {
    iconName: 'trending-up-outline' as const,
    title: 'Track Stocks & ETFs',
    description: 'Monitor real-time prices, charts, and analytics for your favorite stocks and ETFs with live market data.',
    color: '#10B981'
  },
  {
    iconName: 'star-outline' as const,
    title: 'Personalized Watchlists',
    description: 'Create and manage multiple custom watchlists to organize and track the stocks you care about most.',
    color: '#F59E0B'
  },
  {
    iconName: 'briefcase-outline' as const,
    title: 'Portfolio Management',
    description: 'Manage your investments with comprehensive portfolio tracking, performance analytics, and insights.',
    color: '#8B5CF6'
  },
  {
    iconName: 'newspaper-outline' as const,
    title: 'Market News & Analysis',
    description: 'Stay informed with the latest market news, sentiment analysis, and expert insights for better decisions.',
    color: '#EC4899'
  },
  {
    iconName: 'sparkles-outline' as const,
    title: 'Ready to Start!',
    description: 'You\'re all set to begin your investment journey. Let\'s customize your profile and start exploring the markets.',
    color: '#3B82F6'
  },
];

export const CHART_CONFIG = {
  backgroundGradientFrom: COLORS.BACKGROUND,
  backgroundGradientTo: COLORS.BACKGROUND,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 2,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: COLORS.PRIMARY,
  },
};

export const DEFAULT_STOCKS = [
  'AAPL',
  'GOOGL',
  'MSFT',
  'AMZN',
  'TSLA',
  'META',
  'NVDA',
  'AMD',
  'NFLX',
  'ORCL',
];

export const NEWS_CATEGORIES = [
  'blockchain',
  'earnings',
  'ipo',
  'mergers_and_acquisitions',
  'financial_markets',
  'economy_fiscal',
  'economy_monetary',
  'economy_macro',
  'energy_transportation',
  'finance',
  'life_sciences',
  'manufacturing',
  'real_estate',
  'retail_wholesale',
  'technology',
];

export const TIME_FRAMES = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
];

export const TIMEZONE_OPTIONS = [
  { label: 'Eastern Time (US)', value: 'America/New_York' },
  { label: 'Central Time (US)', value: 'America/Chicago' },
  { label: 'Mountain Time (US)', value: 'America/Denver' },
  { label: 'Pacific Time (US)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Frankfurt', value: 'Europe/Berlin' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Hong Kong', value: 'Asia/Hong_Kong' },
  { label: 'Sydney', value: 'Australia/Sydney' },
  { label: 'Mumbai', value: 'Asia/Kolkata' },
];

export const MARKET_HOURS = {
  'America/New_York': { open: 9.5, close: 16 },
  'America/Chicago': { open: 8.5, close: 15 },
  'America/Denver': { open: 7.5, close: 14 },
  'America/Los_Angeles': { open: 6.5, close: 13 },
  'Europe/London': { open: 8, close: 16.5 },
  'Europe/Berlin': { open: 9, close: 17.5 },
  'Asia/Tokyo': { open: 9, close: 15 },
  'Asia/Hong_Kong': { open: 9.5, close: 16 },
  'Australia/Sydney': { open: 10, close: 16 },
  'Asia/Kolkata': { open: 9.25, close: 15.5 },
};

export const DEFAULT_TIMEZONE = 'America/New_York';

export const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Price', value: 'price' },
  { label: 'Change', value: 'change' },
  { label: 'Volume', value: 'volume' },
];

export const MARKET_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  PRE_MARKET: 'pre_market',
  AFTER_HOURS: 'after_hours',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  API_ERROR: 'Failed to fetch data. Please try again later.',
  INVALID_SYMBOL: 'Invalid stock symbol. Please check and try again.',
  NO_DATA: 'No data available for this symbol.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};
