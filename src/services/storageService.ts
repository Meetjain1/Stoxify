import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User, Portfolio, WatchlistItem } from '../types';

class StorageService {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    throw error;
  }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw error;
    }
  }

  async saveUser(user: User): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, user);
  }

  async getUser(): Promise<User | null> {
    return await this.getItem<User>(STORAGE_KEYS.USER_DATA);
  }

  async removeUser(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  async savePortfolio(portfolio: Portfolio): Promise<void> {
    await this.setItem(STORAGE_KEYS.PORTFOLIO, portfolio);
  }

  async getPortfolio(): Promise<Portfolio | null> {
    return await this.getItem<Portfolio>(STORAGE_KEYS.PORTFOLIO);
  }

  async removePortfolio(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.PORTFOLIO);
  }

  async saveWatchlist(watchlist: WatchlistItem[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.WATCHLIST, watchlist);
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    const watchlist = await this.getItem<WatchlistItem[]>(STORAGE_KEYS.WATCHLIST);
    return watchlist || [];
  }

  async addToWatchlist(item: WatchlistItem): Promise<void> {
    const watchlist = await this.getWatchlist();
    const exists = watchlist.find(w => w.symbol === item.symbol);
    
    if (!exists) {
      watchlist.push(item);
      await this.saveWatchlist(watchlist);
    }
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    const watchlist = await this.getWatchlist();
    const filtered = watchlist.filter(item => item.symbol !== symbol);
    await this.saveWatchlist(filtered);
  }

  async isInWatchlist(symbol: string): Promise<boolean> {
    const watchlist = await this.getWatchlist();
    return watchlist.some(item => item.symbol === symbol);
  }

  async saveWatchlists(watchlists: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.WATCHLISTS, watchlists);
  }

  async getWatchlists(): Promise<any[] | null> {
    return await this.getItem<any[]>(STORAGE_KEYS.WATCHLISTS);
  }

  async saveSettings(settings: Record<string, any>): Promise<void> {
    await this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings(): Promise<Record<string, any>> {
    const settings = await this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS);
    return settings || {};
  }

  async updateSetting(key: string, value: any): Promise<void> {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.saveSettings(settings);
  }

  async saveApiKey(apiKey: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }

  async getApiKey(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.API_KEY);
  }

  async removeApiKey(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.API_KEY);
  }

  async exportData(): Promise<string> {
    try {
      const user = await this.getUser();
      const portfolio = await this.getPortfolio();
      const watchlist = await this.getWatchlist();
      const settings = await this.getSettings();

      const exportData = {
        user,
        portfolio,
        watchlist,
        settings,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw error;
    }
  }

  async importData(dataString: string): Promise<void> {
    try {
      const data = JSON.parse(dataString);

      if (data.user) await this.saveUser(data.user);
      if (data.portfolio) await this.savePortfolio(data.portfolio);
      if (data.watchlist) await this.saveWatchlist(data.watchlist);
      if (data.settings) await this.saveSettings(data.settings);
    } catch (error) {
      throw error;
    }
  }

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      return [];
    }
  }
}

export const storageService = new StorageService();
