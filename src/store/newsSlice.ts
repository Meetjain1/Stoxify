import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NewsItem, NewsResponse } from '../types';
import { apiService } from '../services/apiService';

interface NewsState {
  articles: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedCategory: string;
  categories: string[];
}

const initialState: NewsState = {
  articles: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedCategory: 'all',
  categories: [
    'all',
    'financial_markets',
    'economy_fiscal',
    'technology',
    'earnings',
    'ipo',
    'mergers_and_acquisitions',
    'blockchain',
    'energy_transportation',
    'manufacturing',
  ],
};

export const fetchMarketNews = createAsyncThunk(
  'news/fetchMarketNews',
  async (params: { topics?: string[]; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { topics, limit = 50 } = params;
      const response = await apiService.getMarketNews(topics, limit);
      
      if (response.usingMockData) {
        
      }
      
      return response.feed || [];
    } catch (error) {
      return rejectWithValue('Failed to fetch market news');
    }
  }
);

export const fetchTickerNews = createAsyncThunk(
  'news/fetchTickerNews',
  async (params: { tickers: string[]; limit?: number }, { rejectWithValue }) => {
    try {
      const { tickers, limit = 50 } = params;
      const response = await apiService.getTickerNews(tickers, limit);
      return response.feed || [];
    } catch (error) {
      return rejectWithValue('Failed to fetch ticker news');
    }
  }
);

export const refreshNews = createAsyncThunk(
  'news/refreshNews',
  async (category: string, { rejectWithValue }) => {
    try {
      const topics = category === 'all' ? undefined : [category];
      const response = await apiService.getMarketNews(topics, 50);
      return response.feed || [];
    } catch (error) {
      return rejectWithValue('Failed to refresh news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    clearNews: (state) => {
      state.articles = [];
      state.lastUpdated = null;
    },
    addArticle: (state, action: PayloadAction<NewsItem>) => {
      const exists = state.articles.find(article => article.url === action.payload.url);
      if (!exists) {
        state.articles.unshift(action.payload);
      }
    },
    removeArticle: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter(article => article.url !== action.payload);
    },
    sortArticles: (state, action: PayloadAction<'date' | 'relevance' | 'sentiment'>) => {
      const sortBy = action.payload;
      state.articles.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.time_published).getTime() - new Date(a.time_published).getTime();
          case 'sentiment':
            return b.overall_sentiment_score - a.overall_sentiment_score;
          case 'relevance':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMarketNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTickerNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickerNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchTickerNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(refreshNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSelectedCategory,
  clearNews,
  addArticle,
  removeArticle,
  sortArticles,
} = newsSlice.actions;

export default newsSlice.reducer;
