import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../store';
import { RootStackParamList, MainTabParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { STORAGE_KEYS } from '../constants';

import HomeScreen from '../screens/HomeScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import NewsScreen from '../screens/NewsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewStockDetailScreen from '../screens/NewStockDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import SearchScreen from '../screens/SearchScreen';
import StockListScreen from '../screens/StockListScreen';
import UserProfileSetup from '../components/UserProfileSetup';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Watchlist') {
            iconName = focused ? 'star' : 'star-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.PRIMARY,
        tabBarInactiveTintColor: colors.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: colors.SURFACE,
          borderTopColor: colors.BORDER,
          borderTopWidth: 0.5,
          paddingVertical: 8,
          paddingBottom: 40,
          height: 100,
          shadowColor: colors.TEXT_PRIMARY,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.SURFACE,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.BORDER,
        },
        headerTintColor: colors.TEXT_PRIMARY,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Watchlist" 
        component={WatchlistScreen}
        options={{
          title: 'Watchlists',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfileSetup = async () => {
      try {
        const needsProfileSetup = isAuthenticated && (!user?.name || !user?.email);

        if (needsProfileSetup) {
          setShowProfileSetup(true);
        } else {
          setShowProfileSetup(false);
        }
      } catch (error) {
        setShowProfileSetup(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileSetup();
  }, [isAuthenticated, user]);

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.SURFACE,
            elevation: 3,
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            borderBottomWidth: 0,
          },
          headerTintColor: colors.TEXT_PRIMARY,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : showProfileSetup ? (
          <Stack.Screen 
            name="ProfileSetup" 
            options={{ headerShown: false }}
          >
            {() => <UserProfileSetup onComplete={handleProfileSetupComplete} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="StockDetail" 
              component={NewStockDetailScreen}
              options={({ route }) => ({ 
                title: route.params.name || route.params.symbol,
              })}
            />
            <Stack.Screen 
              name="StockList" 
              component={StockListScreen}
              options={({ route }) => ({ 
                title: route.params.type === 'gainers' ? 'Top Gainers' : 'Top Losers',
              })}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{ 
                title: 'Search Stocks',
              }}
            />
            <Stack.Screen 
              name="Portfolio" 
              component={PortfolioScreen}
              options={{ title: 'Portfolio' }}
            />
            <Stack.Screen 
              name="News" 
              component={NewsScreen}
              options={{ title: 'Market News' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
