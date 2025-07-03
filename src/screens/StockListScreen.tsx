import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../store';
import { RootStackParamList, Stock } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants';
import { formatCurrency, formatPercentage } from '../utils';
import { apiService } from '../services/apiService';

type StockListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockList'>;
type StockListScreenRouteProp = RouteProp<RootStackParamList, 'StockList'>;

interface StockListScreenProps {}

const StockListScreen: React.FC<StockListScreenProps> = () => {
  const navigation = useNavigation<StockListScreenNavigationProp>();
  const route = useRoute<StockListScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  const { type } = route.params;
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const title = type === 'gainers' ? 'Top Gainers' : 'Top Losers';

  useEffect(() => {
    loadStocks();
  }, [type]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const mockData = await apiService.getTopMovers();
      const stockList = type === 'gainers' ? mockData.gainers : mockData.losers;
      setStocks(stockList);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStocks();
    setRefreshing(false);
  };

  const handleStockPress = (stock: Stock) => {
    navigation.navigate('StockDetail', { 
      symbol: stock.symbol, 
      name: stock.name || stock.symbol 
    });
  };

  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity
      style={[styles.stockItem, { backgroundColor: colors.SURFACE, borderBottomColor: colors.BORDER }]}
      onPress={() => handleStockPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.stockInfo}>
        <View style={styles.stockHeader}>
          <Text style={[styles.symbol, { color: colors.TEXT_PRIMARY }]}>
            {item.symbol}
          </Text>
          <Text style={[styles.price, { color: colors.TEXT_PRIMARY }]}>
            {formatCurrency(item.price)}
          </Text>
        </View>
        
        <View style={styles.stockDetails}>
          <Text style={[styles.name, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
            {item.name || item.symbol}
          </Text>
          <View style={styles.changeContainer}>
            <Text
              style={[
                styles.change,
                { color: item.change >= 0 ? colors.GAIN : colors.LOSS },
              ]}
            >
              {formatCurrency(item.change)}
            </Text>
            <Text
              style={[
                styles.changePercent,
                { color: item.change >= 0 ? colors.GAIN : colors.LOSS },
              ]}
            >
              ({formatPercentage(item.changePercent)})
            </Text>
          </View>
        </View>
      </View>

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={colors.TEXT_SECONDARY} 
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="bar-chart-outline" 
        size={64} 
        color={colors.TEXT_SECONDARY} 
      />
      <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
        No {type} Found
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.TEXT_SECONDARY }]}>
        Unable to load {type} data at this time.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.BACKGROUND }]}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>
          Loading {title.toLowerCase()}...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.SURFACE, borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.TEXT_PRIMARY }]}>
          {title}
        </Text>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={refreshing ? colors.TEXT_SECONDARY : colors.PRIMARY} 
          />
        </TouchableOpacity>
      </View>

      {/* Stock List */}
      {stocks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderStockItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.PRIMARY}
              colors={[colors.PRIMARY]}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: SPACING.SM,
  },
  listContainer: {
    paddingVertical: SPACING.SM,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
  },
  stockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  symbol: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  price: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FONT_SIZES.SM,
    flex: 1,
    marginRight: SPACING.SM,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    marginRight: SPACING.XS,
  },
  changePercent: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.MD,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: FONT_SIZES.MD,
    marginTop: SPACING.MD,
  },
});

export default StockListScreen;
