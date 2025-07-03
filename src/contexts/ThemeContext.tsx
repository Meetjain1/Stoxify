import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, STORAGE_KEYS, LIGHT_COLORS, DARK_COLORS } from '../constants';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof LIGHT_COLORS;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  const getSystemTheme = (): 'light' | 'dark' => {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  };

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme) {
        if (savedTheme === THEMES.SYSTEM) {
          setThemeState(getSystemTheme());
        } else {
          setThemeState(savedTheme as 'light' | 'dark');
        }
      } else {
        setThemeState(getSystemTheme());
      }
    } catch (error) {
      setThemeState('light');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async (newTheme: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      
    }
  };

  const setTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    await saveTheme(newTheme);
    
    if (newTheme === 'system') {
      setThemeState(getSystemTheme());
    } else {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(STORAGE_KEYS.THEME).then((savedTheme) => {
        if (savedTheme === THEMES.SYSTEM) {
          setThemeState(colorScheme === 'dark' ? 'dark' : 'light');
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const value: ThemeContextType = {
    theme,
    colors,
    toggleTheme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
