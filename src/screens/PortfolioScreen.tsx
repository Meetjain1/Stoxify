import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../store';
import { loadPortfolio, removeFromPortfolio, updatePortfolioPrices } from '../store/portfolioSlice';
import { fetchMultipleStocks } from '../store/stocksSlice';
import { RootStackParamList, PortfolioItem } from '../types';
import { SPACING, FONT_SIZES } from '../constants';
import { formatCurrency, formatPercentage, getChangeColor } from '../utils';
import { useTheme } from '../contexts/ThemeContext';

import PortfolioItemComponent from '../components/PortfolioItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

type PortfolioScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PortfolioScreen: React.FC = () => {
  const navigation = useNavigation<PortfolioScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const { portfolio, loading, error } = useSelector((state: RootState) => state.portfolio);

  useEffect(() => {
    dispatch(loadPortfolio());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const symbols = portfolio.items.map((item: PortfolioItem) => item.symbol);
      if (symbols.length > 0) {
        const stocksResult = await dispatch(fetchMultipleStocks(symbols)).unwrap();
        await dispatch(updatePortfolioPrices(stocksResult));
      }
      await dispatch(loadPortfolio());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh portfolio');
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = (item: PortfolioItem) => {
    navigation.navigate('StockDetail', {
      symbol: item.symbol,
      name: item.name,
    });
  };

  const handleRemoveItem = (item: PortfolioItem) => {
    Alert.alert(
      'Remove from Portfolio',
      `Are you sure you want to remove ${item.symbol} from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => dispatch(removeFromPortfolio(item.id))
        },
      ]
    );
  };

  const renderPortfolioSummary = () => {
    if (!portfolio || portfolio.items.length === 0) {
      return null;
    }

    const gainColor = getChangeColor(portfolio.totalGain);

    return (
      <View style={[styles.summaryContainer, { backgroundColor: colors.SURFACE }]}>
        <Text style={[styles.summaryTitle, { color: colors.TEXT_PRIMARY }]}>Portfolio Summary</Text>
        <Text style={[styles.totalValue, { color: colors.TEXT_PRIMARY }]}>
          {formatCurrency(portfolio.totalValue)}
        </Text>
        <View style={styles.gainContainer}>
          <Text style={[styles.totalGain, { color: gainColor }]}>
            {formatCurrency(portfolio.totalGain)}
          </Text>
          <Text style={[styles.totalGainPercent, { color: gainColor }]}>
            ({formatPercentage(portfolio.totalGainPercent)})
          </Text>
        </View>
        <Text style={[styles.itemCount, { color: colors.TEXT_SECONDARY }]}>
          {portfolio.items.length} holdings
        </Text>
      </View>
    );
  };

  const renderEmptyPortfolio = () => (
    <View style={{ alignItems: 'center', marginTop: 48 }}>
      <Ionicons name="briefcase-outline" size={64} color={colors.PRIMARY} style={{ marginBottom: 16 }} />
      <Text style={{ color: colors.TEXT_PRIMARY, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Your portfolio is empty</Text>
      <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 16, marginBottom: 24 }}>Buy stocks to get started!</Text>
      <TouchableOpacity style={{ backgroundColor: colors.PRIMARY, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32 }} onPress={() => navigation.navigate('Search')}>
        <Text style={{ color: colors.TEXT_ON_PRIMARY, fontWeight: 'bold', fontSize: 16 }}>Browse Stocks</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: PortfolioItem }) => (
    <PortfolioItemComponent
      item={item}
      onPress={() => handleItemPress(item)}
      onRemove={() => handleRemoveItem(item)}
    />
  );

  if (loading && (!portfolio || portfolio.items.length === 0)) {
    return <LoadingSpinner text="Loading portfolio..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => dispatch(loadPortfolio())}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {renderPortfolioSummary()}
      
      {portfolio.items.length === 0 ? (
        renderEmptyPortfolio()
      ) : (
        <FlatList
          data={portfolio.items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    margin: SPACING.MD,
    padding: SPACING.LG,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.MD,
    marginBottom: SPACING.XS,
  },
  totalValue: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  totalGain: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
  },
  totalGainPercent: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    marginLeft: SPACING.XS,
  },
  itemCount: {
    fontSize: FONT_SIZES.SM,
  },
  listContainer: {
    paddingBottom: SPACING.LG,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.MD,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.LG,
  },
  addButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
});

export default PortfolioScreen;
