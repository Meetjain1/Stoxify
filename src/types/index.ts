export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface StockTimeSeriesData {
  [date: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  };
}

export interface StockTimeSeries {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
  'Time Series (Daily)': StockTimeSeriesData;
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
  purchaseDate: string;
}

export interface Portfolio {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  items: PortfolioItem[];
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedDate: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
}

export interface NewsResponse {
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
  feed: NewsItem[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  accountBalance: number;
  joinedDate: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  ProfileSetup: undefined;
  StockDetail: { symbol: string; name: string };
  StockList: { type: 'gainers' | 'losers' };
  Portfolio: undefined;
  Watchlist: undefined;
  News: undefined;
  Profile: undefined;
  Search: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Portfolio: undefined;
  Watchlist: undefined;
  News: undefined;
  Profile: undefined;
};

export interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface SearchResponse {
  bestMatches: SearchResult[];
}

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export type SortOption = 'name' | 'price' | 'change' | 'volume';
export type SortDirection = 'asc' | 'desc';
export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface FilterOptions {
  sortBy: SortOption;
  sortDirection: SortDirection;
  timeFrame: TimeFrame;
}
