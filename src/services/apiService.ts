import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../constants';
import {
  Stock,
  StockQuote,
  StockTimeSeries,
  NewsResponse,
  SearchResponse,
  AppError,
} from '../types';
import { getMockStock, getMockStocks } from './mockData';

class ApiService {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.apiKey = '';
    this.timeout = 10000;
    this.loadApiKeyFromStorage();
  }

  private async loadApiKeyFromStorage() {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const { STORAGE_KEYS } = await import('../constants');
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (apiKey && this.isValidApiKeyFormat(apiKey)) {
        this.apiKey = apiKey;
      }
    } catch (e) {
      
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  removeApiKey() {
    this.apiKey = '';
  }

  hasValidApiKey(): boolean {
    return !!(this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'demo' && this.isValidApiKeyFormat(this.apiKey));
  }

  private isValidApiKeyFormat(apiKey: string): boolean {
    return typeof apiKey === 'string' && /^[A-Z0-9]{16}$/.test(apiKey);
  }

  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    if (!this.hasValidApiKey()) {
      throw new Error('Invalid or missing API key. Please add a valid Alpha Vantage API key in your profile.');
    }
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          ...params,
          apikey: this.apiKey,
        },
        timeout: this.timeout,
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        throw new Error('API call frequency limit reached. Please try again later.');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.');
        }
        if (!error.response) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
      }
      throw error;
    }
  }

  async refreshApiKeyFromStorage() {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const { STORAGE_KEYS } = await import('../constants');
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (apiKey && this.isValidApiKeyFormat(apiKey)) {
        this.apiKey = apiKey;
      }
    } catch (e) {
    }
  }

  async getStockQuote(symbol: string): Promise<Stock> {
    await this.refreshApiKeyFromStorage();
    
    if (this.hasValidApiKey()) {
      try {
        const response = await this.makeRequest<{ 'Global Quote': StockQuote }>({
          function: API_CONFIG.DEFAULT_FUNCTION,
          symbol: symbol.toUpperCase(),
        });

        const quote = response['Global Quote'];
        
        if (!quote || !quote['01. symbol']) {
          throw new Error(ERROR_MESSAGES.INVALID_SYMBOL);
        }

        return this.transformQuoteToStock(quote);
      } catch (error) {
        const mockStock = getMockStock(symbol.toUpperCase());
        if (mockStock) {
          return mockStock;
        }
        throw this.handleError(error);
      }
    } else {
      const mockStock = getMockStock(symbol.toUpperCase());
      if (mockStock) {
        return mockStock;
      }
      throw new Error(`Stock symbol ${symbol} not found in demo data. Please add a valid API key in Profile to access real market data.`);
    }
  }

  async getMultipleStockQuotes(symbols: string[]): Promise<Stock[] & { usingMockData?: boolean }> {
    await this.refreshApiKeyFromStorage();
    if (this.hasValidApiKey()) {
      try {
        const stockPromises = symbols.map(symbol => this.getStockQuote(symbol));
        const stocks = await Promise.all(stockPromises);
        return stocks as Stock[] & { usingMockData?: boolean };
      } catch (error) {
        
      }
    }

    const mockStocks = getMockStocks(symbols);
    return { ...mockStocks, usingMockData: true } as Stock[] & { usingMockData?: boolean };
  }

  async getStockTimeSeries(symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<StockTimeSeries> {
    await this.refreshApiKeyFromStorage();
    try {
      const response = await this.makeRequest<StockTimeSeries>({
        function: API_CONFIG.TIME_SERIES_FUNCTION,
        symbol: symbol.toUpperCase(),
        outputsize: outputSize,
      });

      if (!response['Time Series (Daily)']) {
        throw new Error(ERROR_MESSAGES.NO_DATA);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchStocks(keywords: string): Promise<SearchResponse> {
    await this.refreshApiKeyFromStorage();
    
    if (this.hasValidApiKey()) {
      try {
        const response = await this.makeRequest<SearchResponse>({
          function: API_CONFIG.SEARCH_FUNCTION,
          keywords: keywords,
        });

        if (response.bestMatches && response.bestMatches.length > 0) {
          return response;
        }
      } catch (error) {
        // If API fails, return error to indicate no results found
        throw new Error(`No results found for "${keywords}". Please check the symbol or try a different search term.`);
      }
    }

    // For demo without API key, provide better search experience
    const mockSearchResults = [
      {
        "1. symbol": "AAPL",
        "2. name": "Apple Inc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "1.0000"
      },
      {
        "1. symbol": "GOOGL",
        "2. name": "Alphabet Inc Class A",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.9000"
      },
      {
        "1. symbol": "MSFT",
        "2. name": "Microsoft Corporation",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.8500"
      },
      {
        "1. symbol": "TSLA",
        "2. name": "Tesla Inc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.8000"
      },
      {
        "1. symbol": "AMZN",
        "2. name": "Amazon.com Inc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.7500"
      },
      {
        "1. symbol": "META",
        "2. name": "Meta Platforms Inc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.7000"
      },
      {
        "1. symbol": "NVDA",
        "2. name": "NVIDIA Corporation",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.6500"
      },
      {
        "1. symbol": "NFLX",
        "2. name": "Netflix Inc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.6000"
      },
      {
        "1. symbol": "JPM",
        "2. name": "JPMorgan Chase & Co",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.5500"
      },
      {
        "1. symbol": "V",
        "2. name": "Visa Inc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.5000"
      },
      {
        "1. symbol": "JNJ",
        "2. name": "Johnson & Johnson",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.4500"
      },
      {
        "1. symbol": "PG",
        "2. name": "Procter & Gamble Co",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.4000"
      }
    ];

    const filteredResults = mockSearchResults.filter(result => 
      result["1. symbol"].toLowerCase().includes(keywords.toLowerCase()) ||
      result["2. name"].toLowerCase().includes(keywords.toLowerCase())
    );

    if (filteredResults.length === 0) {
      throw new Error(`No demo stocks found for "${keywords}". Add your Alpha Vantage API key in Profile to search all available stocks.`);
    }

    return { bestMatches: filteredResults };
  }

  async getMarketNews(topics?: string[], limit: number = 50): Promise<NewsResponse & { usingMockData?: boolean }> {
    await this.refreshApiKeyFromStorage();
    
    if (this.hasValidApiKey()) {
      try {
        const response = await this.makeRequest<NewsResponse>({
          function: API_CONFIG.NEWS_FUNCTION,
          topics: topics?.join(',') || 'financial_markets',
          limit: limit.toString(),
          sort: 'LATEST',
        });
        return response;
      } catch (error) {
        // If real API fails, still provide mock data but indicate the error
        console.warn('Failed to fetch real news data:', error);
      }
    }

    const mockFeed = [
      {
        title: "Demo: Tech Stocks Show Strong Performance (Mock Data)",
        url: "https://stoxify.app/demo-news-1",
        time_published: "20250703T150000",
        authors: ["Stoxify Demo"],
        summary: "This is demo data. Technology stocks continue to show strong performance in today's trading session. Add your Alpha Vantage API key in Profile to see real news.",
        banner_image: "https://via.placeholder.com/400x200/2563EB/FFFFFF?text=Stoxify+Demo",
        source: "Stoxify Demo",
        category_within_source: "Technology",
        source_domain: "stoxify.app",
        topics: [
          {
            topic: "Technology",
            relevance_score: "0.9"
          }
        ],
        overall_sentiment_score: 0.25,
        overall_sentiment_label: "Somewhat-Bullish",
        ticker_sentiment: [
          {
            ticker: "AAPL",
            relevance_score: "0.8",
            ticker_sentiment_score: "0.3",
            ticker_sentiment_label: "Somewhat-Bullish"
          }
        ]
      },
      {
        title: "Demo: Economic Indicators Point to Steady Growth (Mock Data)",
        url: "https://stoxify.app/demo-news-2",
        time_published: "20250703T140000",
        authors: ["Stoxify Demo"],
        summary: "This is demo data. Recent economic indicators suggest steady growth trajectory. Configure your API key in Settings to access real market news and data.",
        banner_image: "https://via.placeholder.com/400x200/059669/FFFFFF?text=Stoxify+Demo",
        source: "Stoxify Demo",
        category_within_source: "Economy",
        source_domain: "stoxify.app",
        topics: [
          {
            topic: "Economy",
            relevance_score: "0.95"
          }
        ],
        overall_sentiment_score: 0.4,
        overall_sentiment_label: "Bullish",
        ticker_sentiment: []
      },
      {
        title: "Demo: How to Enable Real Data in Stoxify",
        url: "https://stoxify.app/demo-setup",
        time_published: "20250703T130000",
        authors: ["Stoxify Team"],
        summary: "To access real market data and news, get a free API key from Alpha Vantage and add it in Profile > API Settings. This demo shows mock data to demonstrate app functionality.",
        banner_image: "https://via.placeholder.com/400x200/7C3AED/FFFFFF?text=Stoxify+Setup",
        source: "Stoxify Guide",
        category_within_source: "Setup",
        source_domain: "stoxify.app",
        topics: [
          {
            topic: "Technology",
            relevance_score: "0.8"
          }
        ],
        overall_sentiment_score: 0.1,
        overall_sentiment_label: "Neutral",
        ticker_sentiment: []
      },
      {
        title: "Demo: Market Analysis Shows Mixed Signals (Mock Data)",
        url: "https://stoxify.app/demo-news-4",
        time_published: "20250703T120000",
        authors: ["Stoxify Demo"],
        summary: "This is demo data. Current market analysis reveals mixed signals across different sectors. Enable real data by adding your API key in Profile settings.",
        banner_image: "https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Stoxify+Demo",
        source: "Stoxify Demo",
        category_within_source: "Market Analysis",
        source_domain: "stoxify.app",
        topics: [
          {
            topic: "Markets",
            relevance_score: "0.85"
          }
        ],
        overall_sentiment_score: -0.1,
        overall_sentiment_label: "Somewhat-Bearish",
        ticker_sentiment: []
      }
    ];
    return {
      items: "20",
      sentiment_score_definition: "x <= -0.35: Bearish; -0.35 < x <= -0.15: Somewhat-Bearish; -0.15 < x < 0.15: Neutral; 0.15 <= x < 0.35: Somewhat_Bullish; x >= 0.35: Bullish",
      relevance_score_definition: "0 < x <= 1, with a higher score indicating higher relevance.",
      usingMockData: true,
      feed: mockFeed
    };
  }

  async getTickerNews(tickers: string[], limit: number = 50): Promise<NewsResponse> {
    await this.refreshApiKeyFromStorage();
    try {
      const response = await this.makeRequest<NewsResponse>({
        function: API_CONFIG.NEWS_FUNCTION,
        tickers: tickers.join(','),
        limit: limit.toString(),
        sort: 'LATEST',
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private transformQuoteToStock(quote: StockQuote): Stock {
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol: quote['01. symbol'],
      name: quote['01. symbol'],
      price,
      change,
      changePercent,
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
    };
  }

  private handleError(error: any): AppError {
    if (error instanceof Error) {
      return {
        message: error.message,
        details: error,
      };
    }
    return {
      message: ERROR_MESSAGES.GENERIC_ERROR,
      details: error,
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.getStockQuote('AAPL');
      return true;
    } catch (error) {
      return false;
    }
  }

  getPopularStocks(): string[] {
    return [
      'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
      'META', 'NVDA', 'AMD', 'NFLX', 'ORCL',
      'CRM', 'ADBE', 'PYPL', 'INTC', 'IBM',
    ];
  }

  getMarketIndices(): string[] {
    return ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'];
  }

  async getTopMovers(): Promise<{ gainers: Stock[]; losers: Stock[] }> {
    await this.refreshApiKeyFromStorage();
    
    if (this.hasValidApiKey()) {
      try {
        const response = await this.makeRequest<{ top_gainers: any[]; top_losers: any[] }>({
          function: API_CONFIG.TOP_GAINERS_LOSERS_FUNCTION,
        });

        if (response.top_gainers && response.top_losers) {
          const gainers: Stock[] = response.top_gainers.slice(0, 5).map((item: any) => ({
            symbol: item.ticker,
            name: item.ticker,
            price: parseFloat(item.price),
            change: parseFloat(item.change_amount),
            changePercent: parseFloat(item.change_percentage.replace('%', '')),
            volume: parseInt(item.volume),
            high: parseFloat(item.price),
            low: parseFloat(item.price),
            open: parseFloat(item.price),
            previousClose: parseFloat(item.price) - parseFloat(item.change_amount),
          }));

          const losers: Stock[] = response.top_losers.slice(0, 5).map((item: any) => ({
            symbol: item.ticker,
            name: item.ticker,
            price: parseFloat(item.price),
            change: parseFloat(item.change_amount),
            changePercent: parseFloat(item.change_percentage.replace('%', '')),
            volume: parseInt(item.volume),
            high: parseFloat(item.price),
            low: parseFloat(item.price),
            open: parseFloat(item.price),
            previousClose: parseFloat(item.price) - parseFloat(item.change_amount),
          }));

          return { gainers, losers };
        }
      } catch (error) {
        
      }
    }

    const gainers: Stock[] = [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 432.50,
        change: 25.80,
        changePercent: 6.35,
        volume: 42500000,
        high: 435.20,
        low: 405.30,
        open: 408.70,
        previousClose: 406.70,
      },
      {
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        price: 156.75,
        change: 8.45,
        changePercent: 5.70,
        volume: 31200000,
        high: 158.90,
        low: 147.30,
        open: 148.30,
        previousClose: 148.30,
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc',
        price: 178.25,
        change: 7.35,
        changePercent: 4.30,
        volume: 28900000,
        high: 180.50,
        low: 170.90,
        open: 170.90,
        previousClose: 170.90,
      },
      {
        symbol: 'META',
        name: 'Meta Platforms Inc',
        price: 512.30,
        change: 18.75,
        changePercent: 3.80,
        volume: 19800000,
        high: 515.20,
        low: 493.55,
        open: 493.55,
        previousClose: 493.55,
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc',
        price: 167.89,
        change: 5.23,
        changePercent: 3.21,
        volume: 15600000,
        high: 169.50,
        low: 162.66,
        open: 162.66,
        previousClose: 162.66,
      },
    ];

    const losers: Stock[] = [
      {
        symbol: 'NFLX',
        name: 'Netflix Inc',
        price: 456.20,
        change: -28.90,
        changePercent: -5.96,
        volume: 18700000,
        high: 485.10,
        low: 456.20,
        open: 485.10,
        previousClose: 485.10,
      },
      {
        symbol: 'PYPL',
        name: 'PayPal Holdings Inc',
        price: 78.45,
        change: -4.12,
        changePercent: -4.99,
        volume: 22300000,
        high: 82.57,
        low: 78.45,
        open: 82.57,
        previousClose: 82.57,
      },
      {
        symbol: 'INTC',
        name: 'Intel Corporation',
        price: 23.15,
        change: -1.05,
        changePercent: -4.34,
        volume: 67800000,
        high: 24.20,
        low: 23.15,
        open: 24.20,
        previousClose: 24.20,
      },
      {
        symbol: 'IBM',
        name: 'International Business Machines',
        price: 204.35,
        change: -8.25,
        changePercent: -3.88,
        volume: 4200000,
        high: 212.60,
        low: 204.35,
        open: 212.60,
        previousClose: 212.60,
      },
      {
        symbol: 'CRM',
        name: 'Salesforce Inc',
        price: 298.70,
        change: -10.50,
        changePercent: -3.40,
        volume: 8900000,
        high: 309.20,
        low: 298.70,
        open: 309.20,
        previousClose: 309.20,
      },
    ];

    return { gainers, losers };
  }
}

export const apiService = new ApiService();
