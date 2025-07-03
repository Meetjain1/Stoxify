import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { WatchlistState } from '../watchlistSlice';

const defaultWatchlistState: WatchlistState = {
  watchlists: [],
  activeWatchlistId: null,
  loading: false,
  error: null,
};

const selectWatchlistsBase = (state: RootState): WatchlistState => {
  const stateValue = state.watchlists;
  if (!stateValue || typeof stateValue !== 'object') {
    return defaultWatchlistState;
  }
  return stateValue;
};

export const selectWatchlists = createSelector(
  selectWatchlistsBase,
  (state) => state.watchlists
);

export const selectActiveWatchlistId = createSelector(
  selectWatchlistsBase,
  (state) => state.activeWatchlistId
);

export const selectWatchlistLoading = createSelector(
  selectWatchlistsBase,
  (state) => state.loading
);

export const selectWatchlistError = createSelector(
  selectWatchlistsBase,
  (state) => state.error
);

export const selectActiveWatchlist = createSelector(
  [selectWatchlists, selectActiveWatchlistId],
  (watchlists, activeId) => watchlists.find(w => w.id === activeId) || null
);

export const selectActiveWatchlistItems = createSelector(
  [selectActiveWatchlist],
  (activeWatchlist) => activeWatchlist?.items || []
);

export const selectWatchlistFullState = createSelector(
  [selectWatchlists, selectActiveWatchlistId, selectWatchlistLoading, selectWatchlistError],
  (watchlists, activeWatchlistId, loading, error) => ({
    watchlists,
    activeWatchlistId,
    loading,
    error
  })
);
