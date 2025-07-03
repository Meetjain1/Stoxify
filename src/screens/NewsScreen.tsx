import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../store';
import { fetchMarketNews, setSelectedCategory } from '../store/newsSlice';
import { NewsItem } from '../types';
import { SPACING, FONT_SIZES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

import NewsItemComponent from '../components/NewsItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const NewsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const { articles, loading, error, categories, selectedCategory } = useSelector(
    (state: RootState) => state.news
  );

  useEffect(() => {
    dispatch(fetchMarketNews({ limit: 50 }));
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMarketNews({ limit: 50 })).unwrap();
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    dispatch(setSelectedCategory(category));
    const topics = category === 'all' ? undefined : [category];
    dispatch(fetchMarketNews({ topics, limit: 50 }));
  };

  const renderCategoryTabs = () => (
    <View style={[styles.categoryContainer, { backgroundColor: colors.SURFACE }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category: string) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              { backgroundColor: selectedCategory === category ? colors.PRIMARY : colors.CARD, borderColor: colors.BORDER },
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === category ? colors.TEXT_ON_PRIMARY : colors.TEXT_SECONDARY },
              ]}
            >
              {category.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyNews = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={64} color={colors.TEXT_DISABLED} />
      <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>No News Available</Text>
      <Text style={[styles.emptyDescription, { color: colors.TEXT_SECONDARY }]}>
        Pull to refresh or try a different category.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: NewsItem }) => (
    <NewsItemComponent item={item} />
  );

  if (loading && articles.length === 0) {
    return <LoadingSpinner text="Loading news..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => dispatch(fetchMarketNews({ limit: 50 }))}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {renderCategoryTabs()}
      
      {articles.length === 0 ? (
        renderEmptyNews()
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, idx) => item.url + '-' + idx}
          renderItem={renderItem}
          ListEmptyComponent={loading ? <LoadingSpinner /> : <Text style={{ color: colors.TEXT_PRIMARY, textAlign: 'center', marginTop: 32 }}>No news available.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.PRIMARY} />
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.MD,
  },
  categoryTab: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeCategoryTab: {
  },
  categoryText: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeCategoryText: {
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
  },
});

export default NewsScreen;
