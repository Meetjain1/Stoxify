import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Stock, ApiResponse, AppError } from '../types';
import { apiService } from '../services/apiService';

interface StocksState {
  stocks: Stock[];
  popularStocks: Stock[];
  selectedStock: Stock | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: StocksState = {
  stocks: [],
  popularStocks: [],
  selectedStock: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchStock = createAsyncThunk(
  'stocks/fetchStock',
  async (symbol: string, { rejectWithValue }) => {
    try {
      const stock = await apiService.getStockQuote(symbol);
      return stock;
    } catch (error) {
      return rejectWithValue((error as AppError).message);
    }
  }
);

export const fetchMultipleStocks = createAsyncThunk(
  'stocks/fetchMultipleStocks',
  async (symbols: string[], { rejectWithValue }) => {
    try {
      const stocks = await apiService.getMultipleStockQuotes(symbols);
      return stocks;
    } catch (error) {
      return rejectWithValue((error as AppError).message);
    }
  }
);

export const fetchPopularStocks = createAsyncThunk(
  'stocks/fetchPopularStocks',
  async (_, { rejectWithValue }) => {
    try {
      const symbols = apiService.getPopularStocks();
      const stocks = await apiService.getMultipleStockQuotes(symbols.slice(0, 10));
      
      if ((stocks as any).usingMockData) {
        
      }
      
      return Array.isArray(stocks) ? stocks : stocks as Stock[];
    } catch (error) {
      return rejectWithValue((error as AppError).message);
    }
  }
);

export const searchStocks = createAsyncThunk(
  'stocks/searchStocks',
  async (query: string, { rejectWithValue }) => {
    try {
      const results = await apiService.searchStocks(query);
      return results;
    } catch (error) {
      return rejectWithValue((error as AppError).message);
    }
  }
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    setSelectedStock: (state, action: PayloadAction<Stock | null>) => {
      state.selectedStock = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStock: (state, action: PayloadAction<Stock>) => {
      const index = state.stocks.findIndex(stock => stock.symbol === action.payload.symbol);
      if (index !== -1) {
        state.stocks[index] = action.payload;
      } else {
        state.stocks.push(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    removeStock: (state, action: PayloadAction<string>) => {
      state.stocks = state.stocks.filter(stock => stock.symbol !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStock.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStock = action.payload;
        
        const index = state.stocks.findIndex(stock => stock.symbol === action.payload.symbol);
        if (index !== -1) {
          state.stocks[index] = action.payload;
        } else {
          state.stocks.push(action.payload);
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMultipleStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMultipleStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMultipleStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPopularStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.popularStocks = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPopularStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedStock, clearError, updateStock, removeStock } = stocksSlice.actions;
export default stocksSlice.reducer;
