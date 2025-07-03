import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Watchlist, WatchlistItem } from '../types';
import { storageService } from '../services/storageService';

export interface WatchlistState {
  watchlists: Watchlist[];
  activeWatchlistId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WatchlistState = {
  watchlists: [],
  activeWatchlistId: null,
  loading: false,
  error: null,
};

const loadWatchlists = createAsyncThunk(
  'watchlists/loadWatchlists',
  async (_, { rejectWithValue }) => {
    try {
      const watchlists = await storageService.getWatchlists();
      return watchlists || [];
    } catch (error) {
      return rejectWithValue('Failed to load watchlists');
    }
  }
);

const createWatchlist = createAsyncThunk(
  'watchlists/createWatchlist',
  async (payload: { name: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { watchlists: WatchlistState };
      const newWatchlist: Watchlist = {
        id: Date.now().toString(),
        name: payload.name,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const watchlists = [...state.watchlists.watchlists, newWatchlist];
      await storageService.saveWatchlists(watchlists);
      return watchlists;
    } catch (error) {
      return rejectWithValue('Failed to create watchlist');
    }
  }
);

const updateWatchlistName = createAsyncThunk(
  'watchlists/updateWatchlistName',
  async (payload: { id: string; name: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { watchlists: WatchlistState };
      const watchlists = state.watchlists.watchlists.map(w =>
        w.id === payload.id ? { ...w, name: payload.name, updatedAt: new Date().toISOString() } : w
      );
      await storageService.saveWatchlists(watchlists);
      return watchlists;
    } catch (error) {
      return rejectWithValue('Failed to update watchlist name');
    }
  }
);

const deleteWatchlist = createAsyncThunk(
  'watchlists/deleteWatchlist',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { watchlists: WatchlistState };
      const watchlists = state.watchlists.watchlists.filter(w => w.id !== id);
      await storageService.saveWatchlists(watchlists);
      return watchlists;
    } catch (error) {
      return rejectWithValue('Failed to delete watchlist');
    }
  }
);

const removeFromWatchlist = createAsyncThunk(
  'watchlists/removeFromWatchlist',
  async (payload: { watchlistId: string; symbol: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { watchlists: WatchlistState };
      const watchlists = state.watchlists.watchlists.map(w =>
        w.id === payload.watchlistId
          ? { ...w, items: w.items.filter(item => item.symbol !== payload.symbol), updatedAt: new Date().toISOString() }
          : w
      );
      await storageService.saveWatchlists(watchlists);
      return watchlists;
    } catch (error) {
      return rejectWithValue('Failed to remove from watchlist');
    }
  }
);

const addToWatchlist = createAsyncThunk(
  'watchlists/addToWatchlist',
  async (payload: { watchlistId: string; item: WatchlistItem }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { watchlists: WatchlistState };
      const watchlists = state.watchlists.watchlists.map(w =>
        w.id === payload.watchlistId
          ? {
              ...w,
              items: w.items.some(i => i.symbol === payload.item.symbol)
                ? w.items
                : [...w.items, payload.item],
              updatedAt: new Date().toISOString(),
            }
          : w
      );
      await storageService.saveWatchlists(watchlists);
      return watchlists;
    } catch (error) {
      return rejectWithValue('Failed to add to watchlist');
    }
  }
);

const setActiveWatchlist = createAsyncThunk(
  'watchlists/setActiveWatchlist',
  async (id: string) => id
);

const watchlistSlice = createSlice({
  name: 'watchlists',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWatchlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadWatchlists.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlists = action.payload;
        if (!state.activeWatchlistId && action.payload.length > 0) {
          state.activeWatchlistId = action.payload[0].id;
        }
      })
      .addCase(loadWatchlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createWatchlist.fulfilled, (state, action) => {
        state.watchlists = action.payload;
        state.activeWatchlistId = action.payload[action.payload.length - 1]?.id || null;
      })
      .addCase(updateWatchlistName.fulfilled, (state, action) => {
        state.watchlists = action.payload;
      })
      .addCase(deleteWatchlist.fulfilled, (state, action) => {
        state.watchlists = action.payload;
        if (!state.watchlists.some(w => w.id === state.activeWatchlistId)) {
          state.activeWatchlistId = state.watchlists[0]?.id || null;
        }
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlists = action.payload;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.watchlists = action.payload;
      })
      .addCase(setActiveWatchlist.fulfilled, (state, action) => {
        state.activeWatchlistId = action.payload;
      });
  },
});

export default watchlistSlice.reducer;
export {
  loadWatchlists,
  createWatchlist,
  updateWatchlistName,
  deleteWatchlist,
  removeFromWatchlist,
  addToWatchlist,
  setActiveWatchlist,
};
// export type { WatchlistState };
