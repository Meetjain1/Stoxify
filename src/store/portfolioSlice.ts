import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Portfolio, PortfolioItem, Stock } from '../types';
import { storageService } from '../services/storageService';

interface PortfolioState {
  portfolio: Portfolio;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialPortfolio: Portfolio = {
  totalValue: 0,
  totalGain: 0,
  totalGainPercent: 0,
  items: [],
};

const initialState: PortfolioState = {
  portfolio: initialPortfolio,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const loadPortfolio = createAsyncThunk(
  'portfolio/loadPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const portfolio = await storageService.getPortfolio();
      return portfolio || initialPortfolio;
    } catch (error) {
      return rejectWithValue('Failed to load portfolio');
    }
  }
);

export const savePortfolio = createAsyncThunk(
  'portfolio/savePortfolio',
  async (portfolio: Portfolio, { rejectWithValue }) => {
    try {
      await storageService.savePortfolio(portfolio);
      return portfolio;
    } catch (error) {
      return rejectWithValue('Failed to save portfolio');
    }
  }
);

export const addToPortfolio = createAsyncThunk(
  'portfolio/addToPortfolio',
  async (item: Omit<PortfolioItem, 'id' | 'totalValue' | 'gain' | 'gainPercent'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const portfolio = { ...state.portfolio.portfolio, items: Array.isArray(state.portfolio.portfolio.items) ? [...state.portfolio.portfolio.items] : [] };
      
      const newItem: PortfolioItem = {
        ...item,
        id: Date.now().toString(),
        totalValue: isFinite(item.quantity * item.currentPrice) ? item.quantity * item.currentPrice : 0,
        gain: isFinite((item.currentPrice - item.averagePrice) * item.quantity) ? (item.currentPrice - item.averagePrice) * item.quantity : 0,
        gainPercent: isFinite(item.averagePrice) && item.averagePrice > 0 && 
                     isFinite((item.currentPrice - item.averagePrice) / item.averagePrice * 100) ? 
                     (item.currentPrice - item.averagePrice) / item.averagePrice * 100 : 0,
      };

      const existingIndex = portfolio.items.findIndex(i => i.symbol === item.symbol);
      if (existingIndex !== -1) {
        const existing = { ...portfolio.items[existingIndex] };
        const totalQuantity = existing.quantity + item.quantity;
        const totalValue = (existing.quantity * existing.averagePrice) + (item.quantity * item.averagePrice);
        
        portfolio.items[existingIndex] = {
          ...existing,
          quantity: totalQuantity,
          averagePrice: totalValue / totalQuantity,
          currentPrice: item.currentPrice,
          totalValue: isFinite(totalQuantity * item.currentPrice) ? totalQuantity * item.currentPrice : 0,
          gain: isFinite((item.currentPrice - (totalValue / totalQuantity)) * totalQuantity) ? 
                (item.currentPrice - (totalValue / totalQuantity)) * totalQuantity : 0,
          gainPercent: isFinite(totalValue / totalQuantity) && (totalValue / totalQuantity) > 0 &&
                       isFinite((item.currentPrice - (totalValue / totalQuantity)) / (totalValue / totalQuantity) * 100) ?
                       (item.currentPrice - (totalValue / totalQuantity)) / (totalValue / totalQuantity) * 100 : 0,
        };
      } else {
        portfolio.items.push(newItem);
      }

      portfolio.totalValue = portfolio.items.reduce((sum, item) => {
        const value = isNaN(item.totalValue) || !isFinite(item.totalValue) ? 0 : item.totalValue;
        return sum + value;
      }, 0);
      portfolio.totalGain = portfolio.items.reduce((sum, item) => {
        const gain = isNaN(item.gain) || !isFinite(item.gain) ? 0 : item.gain;
        return sum + gain;
      }, 0);
      const baseCost = portfolio.totalValue - portfolio.totalGain;
      portfolio.totalGainPercent = baseCost > 0 ? (portfolio.totalGain / baseCost) * 100 : 0;
      
      if (isNaN(portfolio.totalGainPercent) || !isFinite(portfolio.totalGainPercent)) {
        portfolio.totalGainPercent = 0;
      }

      await storageService.savePortfolio(portfolio);
      
      return portfolio;
    } catch (error) {
      return rejectWithValue('Failed to add to portfolio: ' + (error as Error).message);
    }
  }
);

export const removeFromPortfolio = createAsyncThunk(
  'portfolio/removeFromPortfolio',
  async (itemId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const portfolio = { ...state.portfolio.portfolio };
      
      portfolio.items = portfolio.items.filter(item => item.id !== itemId);

      portfolio.totalValue = portfolio.items.reduce((sum, item) => {
        const value = isNaN(item.totalValue) || !isFinite(item.totalValue) ? 0 : item.totalValue;
        return sum + value;
      }, 0);
      portfolio.totalGain = portfolio.items.reduce((sum, item) => {
        const gain = isNaN(item.gain) || !isFinite(item.gain) ? 0 : item.gain;
        return sum + gain;
      }, 0);
      const baseCost = portfolio.totalValue - portfolio.totalGain;
      portfolio.totalGainPercent = baseCost > 0 ? (portfolio.totalGain / baseCost) * 100 : 0;
      
      if (isNaN(portfolio.totalGainPercent) || !isFinite(portfolio.totalGainPercent)) {
        portfolio.totalGainPercent = 0;
      }

      await storageService.savePortfolio(portfolio);
      return portfolio;
    } catch (error) {
      return rejectWithValue('Failed to remove from portfolio');
    }
  }
);

export const updatePortfolioPrices = createAsyncThunk(
  'portfolio/updatePortfolioPrices',
  async (stocks: Stock[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const portfolio = { ...state.portfolio.portfolio };
      
      portfolio.items = portfolio.items.map(item => {
        const stock = stocks.find(s => s.symbol === item.symbol);
        if (stock) {
          const gainPercent = isNaN(((stock.price - item.averagePrice) / item.averagePrice) * 100) ||
                             !isFinite(((stock.price - item.averagePrice) / item.averagePrice) * 100) ? 0 :
                             ((stock.price - item.averagePrice) / item.averagePrice) * 100;
          
          const updatedItem = {
            ...item,
            currentPrice: stock.price,
            totalValue: item.quantity * stock.price,
            gain: (stock.price - item.averagePrice) * item.quantity,
            gainPercent,
          };
          return updatedItem;
        }
        return item;
      });

      portfolio.totalValue = portfolio.items.reduce((sum, item) => {
        const value = isNaN(item.totalValue) || !isFinite(item.totalValue) ? 0 : item.totalValue;
        return sum + value;
      }, 0);
      portfolio.totalGain = portfolio.items.reduce((sum, item) => {
        const gain = isNaN(item.gain) || !isFinite(item.gain) ? 0 : item.gain;
        return sum + gain;
      }, 0);
      const baseCost = portfolio.totalValue - portfolio.totalGain;
      portfolio.totalGainPercent = baseCost > 0 ? (portfolio.totalGain / baseCost) * 100 : 0;
      
      if (isNaN(portfolio.totalGainPercent) || !isFinite(portfolio.totalGainPercent)) {
        portfolio.totalGainPercent = 0;
      }

      await storageService.savePortfolio(portfolio);
      return portfolio;
    } catch (error) {
      return rejectWithValue('Failed to update portfolio prices');
    }
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPortfolio: (state) => {
      state.portfolio = initialPortfolio;
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(savePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(savePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addToPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addToPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(removeFromPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeFromPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updatePortfolioPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePortfolioPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updatePortfolioPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
