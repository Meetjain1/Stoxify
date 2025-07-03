import { configureStore } from '@reduxjs/toolkit';
import stocksReducer from './stocksSlice';
import portfolioReducer from './portfolioSlice';
import watchlistsReducer from './watchlistSlice';
import newsReducer from './newsSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    stocks: stocksReducer,
    portfolio: portfolioReducer,
    watchlists: watchlistsReducer,
    news: newsReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
