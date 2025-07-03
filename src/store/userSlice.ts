import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { STORAGE_KEYS } from '../constants';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  apiKey: string | null;
  timezone: string;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  apiKey: null,
  timezone: 'UTC',
};

const createDemoUser = (): User => ({
  id: 'demo-user-' + Date.now(),
  email: 'demo@stoxify.com',
  name: 'Demo User',
  accountBalance: 10000,
  joinedDate: new Date().toISOString(),
});

export const loadUser = createAsyncThunk(
  'user/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await storageService.getUser();
      const apiKey = await storageService.getApiKey();
      const timezone = await AsyncStorage.getItem(STORAGE_KEYS.TIMEZONE);
      
      if (apiKey) {
        apiService.setApiKey(apiKey);
      }
      
      return {
        user: user || createDemoUser(),
        apiKey,
        timezone: timezone || undefined,
      };
    } catch (error) {
      return rejectWithValue('Failed to load user data');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = createDemoUser();
      user.email = credentials.email;
      
      await storageService.saveUser(user);
      return user;
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = createDemoUser();
      user.email = userData.email;
      user.name = userData.name;
      
      await storageService.saveUser(user);
      return user;
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await storageService.removeUser();
      
      await AsyncStorage.removeItem(STORAGE_KEYS.WATCHLISTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
      await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
      
      await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (updates: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const currentUser = state.user.user;
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      const updatedUser = { ...currentUser, ...updates };
      await storageService.saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      return rejectWithValue('Failed to update user');
    }
  }
);

export const setApiKey = createAsyncThunk(
  'user/setApiKey',
  async (apiKey: string, { rejectWithValue }) => {
    try {
      await storageService.saveApiKey(apiKey);
      apiService.setApiKey(apiKey);
      return apiKey;
    } catch (error) {
      return rejectWithValue('Failed to save API key');
    }
  }
);

export const removeApiKey = createAsyncThunk(
  'user/removeApiKey',
  async (_, { rejectWithValue }) => {
    try {
      await storageService.removeApiKey();
      apiService.setApiKey('demo');
      return null;
    } catch (error) {
      return rejectWithValue('Failed to remove API key');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateAccountBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.accountBalance = action.payload;
      }
    },
    resetUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.apiKey = null;
      state.timezone = 'UTC';
    },
    setTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.apiKey = action.payload.apiKey;
        state.timezone = action.payload.timezone || 'UTC';
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.apiKey = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(setApiKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setApiKey.fulfilled, (state, action) => {
        state.loading = false;
        state.apiKey = action.payload;
      })
      .addCase(setApiKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(removeApiKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeApiKey.fulfilled, (state) => {
        state.loading = false;
        state.apiKey = null;
      })
      .addCase(removeApiKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateAccountBalance, resetUser, setTimezone } = userSlice.actions;
export default userSlice.reducer;
