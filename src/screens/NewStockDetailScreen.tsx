import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

import { RootState, AppDispatch } from '../store';
import { fetchStock } from '../store/stocksSlice';
import { addToPortfolio, loadPortfolio } from '../store/portfolioSlice';
import {
  loadWatchlists,
  removeFromWatchlist,
} from '../store/watchlistSlice';
import {
  selectWatchlists,
} from '../store/selectors/watchlistSelectors';
import { SPACING, FONT_SIZES, TIME_FRAMES } from '../constants';
import { formatCurrency, formatPercentage } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import WatchlistSelectorModal from '../components/WatchlistSelectorModal';
import LoadingSpinner from '../components/LoadingSpinner';

const { width, height } = Dimensions.get('window');
const screenWidth = width;

const NewStockDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { symbol } = route.params as { symbol: string };
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1M');
  const [quantity, setQuantity] = useState('1');
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const { selectedStock, loading } = useSelector((state: RootState) => state.stocks);
  const watchlists = useSelector(selectWatchlists);

  const isInWatchlist = watchlists.some(watchlist => 
    watchlist.items.some((item: any) => item.symbol === symbol)
  );

  useEffect(() => {
    if (symbol) {
      dispatch(fetchStock(symbol));
    }
    dispatch(loadWatchlists());
  }, [symbol, dispatch]);

  const handleAddToWatchlist = () => {
    if (selectedStock) {
      if (isInWatchlist) {
        watchlists.forEach(watchlist => {
          const hasStock = watchlist.items.some((item: any) => item.symbol === symbol);
          if (hasStock) {
            dispatch(removeFromWatchlist({ watchlistId: watchlist.id, symbol }));
          }
        });
        Alert.alert('Removed', `${symbol} removed from watchlist`);
      } else {
        setShowWatchlistModal(true);
      }
    }
  };

  const handleWatchlistModalSuccess = (watchlistName: string) => {
    Alert.alert('Added', `${symbol} added to ${watchlistName}`);
  };

  const handleBuyStock = async () => {
    if (!selectedStock) {
      Alert.alert('Error', 'Stock data not available');
      return;
    }

    try {
      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
        return;
      }

      const portfolioItem = {
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        quantity: quantityNum,
        averagePrice: selectedStock.price,
        currentPrice: selectedStock.price,
        purchaseDate: new Date().toISOString(),
      };

      const result = await dispatch(addToPortfolio(portfolioItem));
      
      if (addToPortfolio.fulfilled.match(result)) {
        await dispatch(loadPortfolio());
        Alert.alert('Success', `Successfully bought ${quantityNum} shares of ${selectedStock.symbol}!`);
        setQuantity('1');
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 'Failed to add to portfolio';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to buy stock. Please try again.');
    }
  };

  const generateChartData = () => {
    let dataPoints = 50;
    let timeMultiplier = 1;
    
    switch (selectedTimeFrame) {
      case '1D':
        dataPoints = 24;
        timeMultiplier = 1;
        break;
      case '1W':
        dataPoints = 7;
        timeMultiplier = 24;
        break;
      case '1M':
        dataPoints = 30;
        timeMultiplier = 24 * 30;
        break;
      case '3M':
        dataPoints = 90;
        timeMultiplier = 24 * 90;
        break;
      case '6M':
        dataPoints = 180;
        timeMultiplier = 24 * 180;
        break;
      case '1Y':
        dataPoints = 365;
        timeMultiplier = 24 * 365;
        break;
      default:
        dataPoints = 30;
        timeMultiplier = 24 * 30;
    }

    const mockData = Array.from({ length: dataPoints }, (_, index) => {
      const basePrice = selectedStock?.price || 177.15;
      const trend = Math.sin(index * 0.1) * 3;
      const noise = (Math.random() - 0.5) * 6;
      return Math.max(basePrice + trend + noise, basePrice * 0.85);
    });

    const generateLabels = () => {
      const labels = [];
      const now = new Date();
      
      switch (selectedTimeFrame) {
        case '1D':
          for (let i = 0; i < dataPoints; i++) {
            if (i % 4 === 0) {
              const hour = new Date(now.getTime() - (dataPoints - i) * 60 * 60 * 1000);
              labels.push(hour.getHours().toString().padStart(2, '0') + ':00');
            } else {
              labels.push('');
            }
          }
          break;
        case '1W':
          for (let i = 0; i < dataPoints; i++) {
            const day = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
            labels.push(day.toLocaleDateString('en', { weekday: 'short' }));
          }
          break;
        case '1M':
          for (let i = 0; i < dataPoints; i++) {
            if (i % 5 === 0) {
              const day = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
              labels.push(day.getDate().toString());
            } else {
              labels.push('');
            }
          }
          break;
        case '3M':
          for (let i = 0; i < dataPoints; i++) {
            if (i % 15 === 0) {
              const day = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
              labels.push(day.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
            } else {
              labels.push('');
            }
          }
          break;
        case '6M':
          for (let i = 0; i < dataPoints; i++) {
            if (i % 30 === 0) {
              const day = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
              labels.push(day.toLocaleDateString('en', { month: 'short' }));
            } else {
              labels.push('');
            }
          }
          break;
        case '1Y':
          for (let i = 0; i < dataPoints; i++) {
            if (i % 30 === 0) {
              const day = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
              labels.push(day.toLocaleDateString('en', { month: 'short' }));
            } else {
              labels.push('');
            }
          }
          break;
        default:
          for (let i = 0; i < dataPoints; i++) {
            labels.push(i % 5 === 0 ? i.toString() : '');
          }
      }
      return labels;
    };

    return {
      labels: generateLabels(),
      datasets: [
        {
          data: mockData,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  if (loading || !selectedStock) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={[styles.loadingText, { color: colors.TEXT_PRIMARY }]}>Loading stock details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartData = generateChartData();
  const isPositiveChange = (selectedStock.change || 0) >= 0;
  const currentPrice = selectedStock.price || 177.15;
  const priceChange = selectedStock.change || 0.41;
  const percentChange = selectedStock.changePercent || 0.23;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.SURFACE, borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.TEXT_PRIMARY }]}>{selectedStock?.name || 'Details Screen'}</Text>
        <TouchableOpacity onPress={handleAddToWatchlist} style={styles.bookmarkButton}>
          <Ionicons 
            name={isInWatchlist ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={colors.TEXT_PRIMARY} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.BACKGROUND }]} showsVerticalScrollIndicator={false}>
        {/* Stock Info Card */}
        <View style={[styles.stockCard, { backgroundColor: colors.SURFACE }]}>
          <View style={styles.stockHeader}>
            <View style={[styles.companyLogo, { backgroundColor: colors.PRIMARY + '20' }]}>
              <Ionicons name="business" size={40} color={colors.PRIMARY} />
            </View>
            <View style={styles.stockDetails}>
              <Text style={[styles.companyName, { color: colors.TEXT_PRIMARY }]}>{selectedStock.name}</Text>
              <Text style={[styles.stockSymbol, { color: colors.TEXT_SECONDARY }]}>{selectedStock.symbol}, Common Stock</Text>
              <Text style={[styles.stockExchange, { color: colors.TEXT_SECONDARY }]}>NSQ</Text>
            </View>
            <View style={styles.priceSection}>
              <Text style={[styles.currentPrice, { color: colors.TEXT_PRIMARY }]}>${currentPrice.toFixed(2)}</Text>
              <Text style={[styles.priceChange, { color: isPositiveChange ? colors.SUCCESS : colors.ERROR }]}>
                {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* Chart Section */}
          <View style={styles.chartSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollView}>
              <LineChart
                data={chartData}
                width={screenWidth * 2}
                height={220}
                chartConfig={{
                  backgroundColor: colors.SURFACE,
                  backgroundGradientFrom: colors.SURFACE,
                  backgroundGradientTo: colors.SURFACE,
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => colors.TEXT_SECONDARY,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "3",
                    strokeWidth: "1",
                    stroke: colors.PRIMARY,
                    fill: colors.PRIMARY,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "3,3",
                    stroke: colors.BORDER,
                    strokeWidth: 1,
                  },
                  propsForVerticalLabels: {
                    fontSize: 10,
                    fill: colors.TEXT_SECONDARY,
                  },
                  propsForHorizontalLabels: {
                    fontSize: 10,
                    fill: colors.TEXT_SECONDARY,
                  },
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={false}
                withDots={true}
                withShadow={false}
                yAxisInterval={1}
              />
            </ScrollView>

            {/* Time Frame Buttons */}
            <View style={styles.timeFrameContainer}>
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map((timeFrame) => (
                <TouchableOpacity
                  key={timeFrame}
                  style={[
                    styles.timeFrameButton,
                    {
                      backgroundColor: selectedTimeFrame === timeFrame ? '#D97706' : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedTimeFrame(timeFrame)}
                >
                  <Text style={[
                    styles.timeFrameText,
                    {
                      color: selectedTimeFrame === timeFrame ? '#FFFFFF' : colors.TEXT_SECONDARY,
                    },
                  ]}>
                    {timeFrame}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={[styles.aboutTitle, { color: colors.TEXT_PRIMARY }]}>About {selectedStock.symbol}</Text>
            <Text style={[styles.aboutText, { color: colors.TEXT_SECONDARY }]}>
              Apple Inc. is an American multinational technology company that specializes in consumer 
              electronics, computer software, and online services. Apple is the world's largest technology 
              company by revenue (totaling $274.5 billion in 2020) and, since January 2021, the world's most 
              valuable company. As of 2021, Apple is the world's fourth-largest PC vendor by unit sales, and 
              fourth-largest smartphone manufacturer. It is one of the Big Five American information 
              technology companies, along with Amazon, Google, Microsoft, and Facebook.
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              <View style={[styles.tag, { backgroundColor: colors.WARNING + '20' }]}>
                <Text style={[styles.tagText, { color: colors.WARNING }]}>Industry: Electronic computers</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.WARNING + '20' }]}>
                <Text style={[styles.tagText, { color: colors.WARNING }]}>Sector: Technology</Text>
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.priceRangeSection}>
              <View style={styles.priceRangeRow}>
                <Text style={[styles.priceRangeLabel, { color: colors.TEXT_SECONDARY }]}>52-Week Low</Text>
                <Text style={[styles.priceRangeLabel, { color: colors.TEXT_SECONDARY }]}>Current price: ${currentPrice.toFixed(2)}</Text>
                <Text style={[styles.priceRangeLabel, { color: colors.TEXT_SECONDARY }]}>52-Week High</Text>
              </View>
              <View style={styles.priceRangeRow}>
                <Text style={[styles.priceRangeValue, { color: colors.TEXT_PRIMARY }]}>$123.64</Text>
                <View style={styles.priceRangeIndicator}>
                  <View style={[styles.priceRangeLine, { backgroundColor: colors.BORDER }]} />
                  <View style={[styles.priceRangeMarker, { backgroundColor: colors.TEXT_PRIMARY }]} />
                </View>
                <Text style={[styles.priceRangeValue, { color: colors.TEXT_PRIMARY }]}>$197.96</Text>
              </View>
            </View>

            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.TEXT_SECONDARY }]}>Market Cap</Text>
                <Text style={[styles.metricValue, { color: colors.TEXT_PRIMARY }]}>$2.77T</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.TEXT_SECONDARY }]}>P/E Ratio</Text>
                <Text style={[styles.metricValue, { color: colors.TEXT_PRIMARY }]}>27.77</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.TEXT_SECONDARY }]}>Beta</Text>
                <Text style={[styles.metricValue, { color: colors.TEXT_PRIMARY }]}>1.308</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.TEXT_SECONDARY }]}>Dividend Yield</Text>
                <Text style={[styles.metricValue, { color: colors.TEXT_PRIMARY }]}>0.54%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.TEXT_SECONDARY }]}>Profit Margin</Text>
                <Text style={[styles.metricValue, { color: colors.TEXT_PRIMARY }]}>0.247</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Spacer for fixed buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={[styles.actionButtonsContainer, { backgroundColor: colors.SURFACE, borderTopColor: colors.BORDER }]}>
        <TouchableOpacity 
          style={[styles.buyButton, { backgroundColor: colors.SUCCESS }]} 
          onPress={handleBuyStock}
        >
          <Ionicons name="trending-up" size={20} color="#FFFFFF" />
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.watchButton, { borderColor: colors.PRIMARY }]} 
          onPress={handleAddToWatchlist}
        >
          <Ionicons 
            name={isInWatchlist ? "star" : "star-outline"} 
            size={20} 
            color={colors.PRIMARY} 
          />
          <Text style={[styles.watchButtonText, { color: colors.PRIMARY }]}>
            {isInWatchlist ? 'Watching' : 'Watch'}
          </Text>
        </TouchableOpacity>
      </View>

      <WatchlistSelectorModal
        visible={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        stock={selectedStock}
        onSuccess={handleWatchlistModalSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.LG,
    marginTop: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  bookmarkButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  stockCard: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stockDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 14,
    marginBottom: 2,
  },
  stockExchange: {
    fontSize: 14,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartScrollView: {
    flex: 1,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  timeFrameButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  timeFrameText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aboutSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  priceRangeSection: {
    marginBottom: 24,
  },
  priceRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceRangeLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  priceRangeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    width: 80,
    textAlign: 'center',
  },
  priceRangeIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  priceRangeLine: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  priceRangeMarker: {
    position: 'absolute',
    left: '70%',
    width: 12,
    height: 12,
    backgroundColor: '#000000',
    borderRadius: 6,
    top: -4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '30%',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 50,
    borderTopWidth: 1,
    gap: 12,
  },
  buyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  watchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  watchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NewStockDetailScreen;
