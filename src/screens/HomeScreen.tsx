import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootState, AppDispatch } from '../store';
import { fetchPopularStocks, setSelectedStock } from '../store/stocksSlice';
import { loadPortfolio } from '../store/portfolioSlice';
import {
  loadWatchlists,
  setActiveWatchlist,
  createWatchlist,
  updateWatchlistName,
  deleteWatchlist,
  removeFromWatchlist,
  addToWatchlist
} from '../store/watchlistSlice';
import {
  selectWatchlists,
  selectWatchlistLoading,
  selectWatchlistError,
  selectActiveWatchlist,
  selectActiveWatchlistItems
} from '../store/selectors/watchlistSelectors';
import { fetchMarketNews } from '../store/newsSlice';
import { RootStackParamList } from '../types';
import { SPACING, FONT_SIZES, STORAGE_KEYS, DEFAULT_TIMEZONE } from '../constants';
import { formatCurrency, formatPercentage, getGreeting, getMarketStatus, getMarketStatusMessage } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import StockItem from '../components/StockItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import WatchlistSelectorModal from '../components/WatchlistSelectorModal';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [selectedStockForWatchlist, setSelectedStockForWatchlist] = useState<any>(null);
  const [userTimezone, setUserTimezone] = useState(DEFAULT_TIMEZONE);
  const reduxTimezone = useSelector((state: RootState) => state.user?.timezone);
  
  let { popularStocks, loading, error } = useSelector((state: RootState) => state.stocks);
  if (!Array.isArray(popularStocks)) {
    popularStocks = [];
  }
  const { portfolio } = useSelector((state: RootState) => state.portfolio);
  const { user } = useSelector((state: RootState) => state.user);
  
  const watchlists = useSelector(selectWatchlists);
  const watchlistLoading = useSelector(selectWatchlistLoading);
  const watchlistError = useSelector(selectWatchlistError);
  const currentWatchlist = useSelector(selectActiveWatchlist);
  const watchlistItems = useSelector(selectActiveWatchlistItems);

  const portfolioValue = useMemo(() => {
    if (!portfolio.items || !Array.isArray(portfolio.items)) return 0;
    const total = portfolio.items.reduce((total: number, item: any) => {
      const value = item.currentPrice * item.quantity;
      return total + (isFinite(value) && !isNaN(value) ? value : 0);
    }, 0);
    return isFinite(total) && !isNaN(total) ? total : 0;
  }, [portfolio.items]);

  const portfolioGain = useMemo(() => {
    if (!portfolio.items || !Array.isArray(portfolio.items)) return 0;
    const totalCost = portfolio.items.reduce((total: number, item: any) => {
      const cost = item.averagePrice * item.quantity;
      return total + (isFinite(cost) && !isNaN(cost) ? cost : 0);
    }, 0);
    const gain = portfolioValue - totalCost;
    return isFinite(gain) && !isNaN(gain) ? gain : 0;
  }, [portfolio.items, portfolioValue]);

  const portfolioGainPercent = useMemo(() => {
    if (!portfolio.items || !Array.isArray(portfolio.items) || portfolio.items.length === 0) return 0;
    const totalCost = portfolio.items.reduce((total: number, item: any) => {
      const cost = item.averagePrice * item.quantity;
      return total + (isFinite(cost) && !isNaN(cost) ? cost : 0);
    }, 0);
    if (totalCost <= 0) return 0;
    const percent = (portfolioGain / totalCost) * 100;
    return isFinite(percent) && !isNaN(percent) ? percent : 0;
  }, [portfolioGain, portfolio.items]);

  const loadInitialData = useCallback(async () => {
    try {
      dispatch(fetchPopularStocks());
      dispatch(loadPortfolio());
      dispatch(loadWatchlists());
      dispatch(fetchMarketNews({}));
    } catch (error) {
      
    }
  }, [dispatch]);

  useEffect(() => {
    loadInitialData();
    if (reduxTimezone) {
      setUserTimezone(reduxTimezone);
    } else {
      AsyncStorage.getItem(STORAGE_KEYS.TIMEZONE).then(tz => {
        if (tz) setUserTimezone(tz);
      });
    }
  }, [loadInitialData, reduxTimezone]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchPopularStocks()),
        dispatch(fetchMarketNews({})),
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStockPress = (stock: any) => {
    dispatch(setSelectedStock(stock));
    navigation.navigate('StockDetail', { symbol: stock.symbol, name: stock.name });
  };

  const handleBookmark = async (stock: any) => {
    try {
      const isCurrentlyInWatchlist = watchlistItems.some(item => item.symbol === stock.symbol);
      
      if (isCurrentlyInWatchlist) {
        const activeWatchlistId = currentWatchlist?.id || 'default';
        dispatch(removeFromWatchlist({ watchlistId: activeWatchlistId, symbol: stock.symbol }));
        Alert.alert('Removed', `${stock.symbol} removed from watchlist`);
      } else {
        setSelectedStockForWatchlist(stock);
        setShowWatchlistModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update watchlist');
    }
  };

  const handleWatchlistModalSuccess = (watchlistName: string) => {
    Alert.alert('Added', `${selectedStockForWatchlist?.symbol} added to ${watchlistName}`);
    setSelectedStockForWatchlist(null);
  };

  const handleViewAllGainers = () => {
    navigation.navigate('StockList', { type: 'gainers' });
  };

  const handleViewAllLosers = () => {
    navigation.navigate('StockList', { type: 'losers' });
  };

  const isInWatchlist = (stock: any) => {
    return watchlistItems.some(item => item.symbol === stock.symbol);
  };

  const renderHeader = () => {
    const marketStatus = getMarketStatus(userTimezone);
    const greeting = getGreeting(userTimezone);
    const marketStatusMessage = getMarketStatusMessage(userTimezone);

    return (
      <View style={[styles.headerContainer, { backgroundColor: colors.BACKGROUND }]}>
        {/* App Title Section - Only render ONCE at the very top */}
        <LinearGradient colors={[colors.PRIMARY, colors.GRADIENT_END]} style={styles.titleSection}>
          <SafeAreaView>
            <View style={styles.headerRow}>
              <View style={styles.leftHeaderSection}>
                <Image source={require('../../assets/icon.png')} style={styles.appIcon} />
                <Text style={[styles.appTitle, { color: colors.TEXT_ON_PRIMARY }]}>Stoxify</Text>
              </View>
              <View style={styles.centerHeaderSection}>
                {/* This ensures the logo and title are centered */}
              </View>
              <View style={styles.rightHeaderSection}>
                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.headerButton}>
                  <Ionicons name="search" size={28} color={colors.TEXT_ON_PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <Ionicons name="person-circle" size={32} color={colors.TEXT_ON_PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* User Greeting Section */}
        <View style={[styles.greetingSection, { backgroundColor: colors.SURFACE }]}>
          <View style={styles.greetingContent}>
            <View>
              <Text style={[styles.greeting, { color: colors.TEXT_PRIMARY }]}>
                {greeting}
              </Text>
              <Text style={[styles.userName, { color: colors.TEXT_SECONDARY }]}>
                {user?.name || 'Demo User'}
              </Text>
            </View>

            {/* Market Status */}
            <View style={styles.marketStatus}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: marketStatus === 'open' ? colors.SUCCESS : colors.ERROR }
              ]} />
              <Text style={[styles.statusText, { color: colors.TEXT_PRIMARY }]}>
                {marketStatusMessage}
              </Text>
            </View>
          </View>
        </View>

        {/* Portfolio Summary Section */}
        <View style={[styles.portfolioSection, { backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.BORDER }]}>
          <View style={styles.portfolioContent}>
            <Text style={[styles.portfolioLabel, { color: colors.TEXT_SECONDARY }]}>
              Portfolio Value
            </Text>
            <Text style={[styles.portfolioValue, { color: colors.TEXT_PRIMARY }]}>
              {formatCurrency(portfolioValue)}
            </Text>
            <View style={styles.gainContainer}>
              <Text style={[
                styles.gainText, 
                { color: portfolioGainPercent >= 0 ? colors.SUCCESS : colors.ERROR }
              ]}>
                {portfolioGainPercent >= 0 ? '+' : ''}{formatCurrency(portfolioGain)} ({formatPercentage(portfolioGainPercent)})
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStockCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{ backgroundColor: colors.SURFACE, borderRadius: 16, padding: 16, marginBottom: 16, flex: 1, marginHorizontal: 8, shadowColor: colors.PRIMARY, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
      onPress={() => handleStockPress(item)}
    >
      <View style={{ paddingRight: 30 }}>
        <Text style={{ color: colors.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 14 }}>{item.symbol}</Text>
        <Text style={{ color: colors.PRIMARY, fontWeight: 'bold', fontSize: 18, marginVertical: 8 }}>{formatCurrency(item.price)}</Text>
        <Text style={{ color: item.changePercent >= 0 ? colors.SUCCESS : colors.ERROR, fontSize: 12 }}>
          {item.changePercent >= 0 ? '+' : ''}{formatPercentage(item.changePercent)}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          handleBookmark(item);
        }} 
        style={{ position: 'absolute', top: 12, right: 12, padding: 4 }}
      >
        <Ionicons name={isInWatchlist(item) ? 'bookmark' : 'bookmark-outline'} size={20} color={colors.PRIMARY} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const sections = [
    { type: 'HEADER' },
    { type: 'QUICK_ACTIONS' },
    { type: 'GAINERS', data: (popularStocks || []).filter(s => s && s.change > 0).slice(0, 4) },
    { type: 'LOSERS', data: (popularStocks || []).filter(s => s && s.change < 0).slice(0, 4) },
    { type: 'BOTTOM_SPACER' },
  ];

  const renderSection = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'HEADER':
        return renderHeader();
      case 'QUICK_ACTIONS':
        return (
          <View style={[styles.section, { backgroundColor: colors.BACKGROUND }]}>
            <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY, marginBottom: 8 }]}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.CARD }]} onPress={() => navigation.navigate('Portfolio')}>
                <Ionicons name="briefcase" size={24} color={colors.PRIMARY} />
                <Text style={[styles.quickActionText, { color: colors.TEXT_PRIMARY }]}>Portfolio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.CARD }]} onPress={() => navigation.navigate('News')}>
                <Ionicons name="newspaper" size={24} color={colors.SUCCESS} />
                <Text style={[styles.quickActionText, { color: colors.TEXT_PRIMARY }]}>News</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.CARD }]} onPress={() => navigation.navigate('Profile')}>
                <Ionicons name="person" size={24} color={colors.SECONDARY} />
                <Text style={[styles.quickActionText, { color: colors.TEXT_PRIMARY }]}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'GAINERS':
        return (
          <View style={[styles.section, { backgroundColor: colors.BACKGROUND }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Top Gainers</Text>
              <TouchableOpacity onPress={handleViewAllGainers}>
                <Text style={{ color: colors.PRIMARY, fontWeight: 'bold', fontSize: 16 }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={item.data}
              renderItem={renderStockCard}
              keyExtractor={item => item.symbol}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingBottom: 8 }}
              scrollEnabled={false}
            />
          </View>
        );
      case 'LOSERS':
        return (
          <View style={[styles.section, { backgroundColor: colors.BACKGROUND }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Top Losers</Text>
              <TouchableOpacity onPress={handleViewAllLosers}>
                <Text style={{ color: colors.PRIMARY, fontWeight: 'bold', fontSize: 16 }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={item.data}
              renderItem={renderStockCard}
              keyExtractor={item => item.symbol}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingBottom: 32 }}
              scrollEnabled={false}
            />
          </View>
        );
      case 'BOTTOM_SPACER':
        return <View style={{ height: 20 }} />;
      default:
        return null;
    }
  };

  if (loading && popularStocks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        {renderHeader()}
        <LoadingSpinner />
      </View>
    );
  }

  if (error && popularStocks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        {renderHeader()}
        <ErrorDisplay error={error} onRetry={() => dispatch(fetchPopularStocks())} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(_, idx) => String(idx)}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 20 }} // Reduced from 30
      />
      
      <WatchlistSelectorModal
        visible={showWatchlistModal}
        onClose={() => {
          setShowWatchlistModal(false);
          setSelectedStockForWatchlist(null);
        }}
        stock={selectedStockForWatchlist}
        onSuccess={handleWatchlistModalSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: SPACING.MD,
  },
  titleSection: {
    paddingVertical: SPACING.XS, // Reduced from MD
    paddingBottom: SPACING.SM, // Reduced from LG
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8, // Reduced from 16
    minHeight: 50, // Reduced from 60
  },
  leftHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerHeaderSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  appIcon: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  headerButton: {
    marginRight: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  greetingSection: {
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.LG,
    marginHorizontal: SPACING.MD,
    marginVertical: SPACING.SM,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greetingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioSection: {
    marginHorizontal: SPACING.MD,
    marginVertical: SPACING.SM,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  portfolioContent: {
    padding: SPACING.LG,
    alignItems: 'center',
  },
  header: {
    paddingBottom: SPACING.XL,
  },
  headerContent: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.MD,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.LG,
  },
  greeting: {
    fontSize: FONT_SIZES.MD,
    opacity: 0.9,
  },
  userName: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: SPACING.SM,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  marketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.SM,
  },
  statusText: {
    fontSize: FONT_SIZES.SM,
    opacity: 0.9,
  },
  portfolioSummary: {
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: FONT_SIZES.MD,
    opacity: 0.9,
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: FONT_SIZES.HUGE,
    fontWeight: 'bold',
  },
  gainContainer: {
    marginTop: 4,
  },
  gainText: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
  },
  quickActionsContainer: {
    marginBottom: SPACING.XL,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.XL,
    paddingHorizontal: SPACING.LG,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginBottom: SPACING.MD,
  },
});

export default HomeScreen;
