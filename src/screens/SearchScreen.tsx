import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../store';
import { searchStocks } from '../store/stocksSlice';
import { addToWatchlist } from '../store/watchlistSlice';
import { RootStackParamList, SearchResult } from '../types';
import { SPACING, FONT_SIZES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { debounce } from '../utils';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const activeWatchlistId = useSelector((state: RootState) => state.watchlists.activeWatchlistId);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dispatch(searchStocks(searchQuery)).unwrap();
      setResults(response.bestMatches || []);
      setError(null);
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to search stocks. Please try again.';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  const handleItemPress = (item: SearchResult) => {
    navigation.navigate('StockDetail', {
      symbol: item['1. symbol'],
      name: item['2. name'],
    });
  };

  const handleAddToWatchlist = async (item: SearchResult) => {
    try {
      const stock = {
        id: Date.now().toString(),
        symbol: item['1. symbol'],
        name: item['2. name'],
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        high: 0,
        low: 0,
        open: 0,
        previousClose: 0,
        addedDate: new Date().toISOString(),
      };

      if (activeWatchlistId) {
        dispatch(addToWatchlist({ watchlistId: activeWatchlistId, item: stock }));
        Alert.alert('Success', `${item['1. symbol']} added to watchlist`);
      } else {
        Alert.alert('Error', 'No active watchlist found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist');
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const matchScore = parseFloat(item['9. matchScore']);
    const isGoodMatch = matchScore > 0.7;

    return (
      <TouchableOpacity
        style={[
          styles.resultItem, 
          { backgroundColor: colors.SURFACE },
          !isGoodMatch && styles.lowMatchItem
        ]}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.resultContent}>
          <View style={styles.resultLeft}>
            <Text style={[styles.symbol, { color: colors.TEXT_PRIMARY }]}>{item['1. symbol']}</Text>
            <Text style={[styles.name, { color: colors.TEXT_SECONDARY }]} numberOfLines={2}>
              {item['2. name']}
            </Text>
            <View style={styles.detailsRow}>
              <Text style={[styles.detail, { color: colors.TEXT_SECONDARY }]}>{item['3. type']}</Text>
              <Text style={[styles.detail, { color: colors.TEXT_SECONDARY }]}>•</Text>
              <Text style={[styles.detail, { color: colors.TEXT_SECONDARY }]}>{item['4. region']}</Text>
              <Text style={[styles.detail, { color: colors.TEXT_SECONDARY }]}>•</Text>
              <Text style={[styles.detail, { color: colors.TEXT_SECONDARY }]}>{item['8. currency']}</Text>
            </View>
            <Text style={[styles.matchScore, { color: colors.PRIMARY }]}>
              Match: {(matchScore * 100).toFixed(0)}%
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToWatchlist(item)}
          >
            <Ionicons name="star-outline" size={20} color={colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (query.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={colors.TEXT_DISABLED} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>Search for Stocks</Text>
          <Text style={[styles.emptyDescription, { color: colors.TEXT_SECONDARY }]}>
            Enter a stock symbol or company name to get started
          </Text>
        </View>
      );
    }

    if (results.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={colors.TEXT_DISABLED} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>No Results Found</Text>
          <Text style={[styles.emptyDescription, { color: colors.TEXT_SECONDARY }]}>
            Try searching with a different keyword
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.SURFACE }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.BACKGROUND }]}>
          <Ionicons name="search" size={20} color={colors.TEXT_SECONDARY} />
          <TextInput
            style={[styles.searchInput, { color: colors.TEXT_PRIMARY }]}
            placeholder="Search stocks, ETFs..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && query.trim().length > 0 && (
        <LoadingSpinner text="Searching..." />
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => debouncedSearch(query)}
        />
      )}

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item['1. symbol']}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: SPACING.MD,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.MD,
    marginLeft: SPACING.SM,
  },
  clearButton: {
    padding: SPACING.XS,
  },
  listContainer: {
    paddingBottom: SPACING.LG,
  },
  resultItem: {
    marginHorizontal: SPACING.MD,
    marginVertical: SPACING.XS,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lowMatchItem: {
    opacity: 0.7,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
  },
  resultLeft: {
    flex: 1,
  },
  symbol: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  name: {
    fontSize: FONT_SIZES.SM,
    marginTop: 2,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  detail: {
    fontSize: FONT_SIZES.XS,
    marginRight: SPACING.XS,
  },
  matchScore: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
    marginTop: SPACING.XS,
  },
  addButton: {
    padding: SPACING.SM,
    marginLeft: SPACING.MD,
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
  },
});

export default SearchScreen;
