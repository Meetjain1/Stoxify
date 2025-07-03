import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsItem } from '../types';
import { formatTimeAgo, getChangeColor } from '../utils';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface NewsItemComponentProps {
  item: NewsItem;
  onPress?: () => void;
}

const NewsItemComponent: React.FC<NewsItemComponentProps> = ({ item, onPress }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Linking.openURL(item.url);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return COLORS.SUCCESS;
    if (score < -0.1) return COLORS.ERROR;
    return COLORS.NEUTRAL;
  };

  const getSentimentIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bullish':
      case 'somewhat-bullish':
        return 'trending-up';
      case 'bearish':
      case 'somewhat-bearish':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: isDark ? '#23272F' : colors.SURFACE }]} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={[styles.source, { color: colors.PRIMARY }]}>{item.source}</Text>
        <Text style={[styles.time, { color: colors.TEXT_SECONDARY }]}>{formatTimeAgo(item.time_published)}</Text>
      </View>
      
      <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]} numberOfLines={3}>
        {item.title}
      </Text>
      
      <Text style={[styles.summary, { color: colors.TEXT_SECONDARY }]} numberOfLines={2}>
        {item.summary}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.sentimentContainer}>
          <Ionicons
            name={getSentimentIcon(item.overall_sentiment_label)}
            size={16}
            color={getSentimentColor(item.overall_sentiment_score)}
          />
          <Text style={[styles.sentiment, { color: getSentimentColor(item.overall_sentiment_score) }]}>
            {item.overall_sentiment_label}
          </Text>
        </View>
        
        {item.topics && item.topics.length > 0 && (
          <View style={styles.topicsContainer}>
            {item.topics.slice(0, 2).map((topic, index) => (
              <View key={index} style={[styles.topicTag, { backgroundColor: colors.INFO + '20' }]}>
                <Text style={[styles.topicText, { color: colors.INFO }]}>{topic.topic}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {item.ticker_sentiment && item.ticker_sentiment.length > 0 && (
        <View style={styles.tickersContainer}>
          <Text style={[styles.tickersLabel, { color: colors.TEXT_SECONDARY }]}>Related:</Text>
          {item.ticker_sentiment.slice(0, 3).map((ticker, index) => (
            <View key={index} style={[styles.tickerTag, { backgroundColor: colors.PRIMARY + '20' }]}>
              <Text style={[styles.tickerText, { color: colors.PRIMARY }]}>{ticker.ticker}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.MD,
    marginVertical: SPACING.XS,
    borderRadius: 12,
    padding: SPACING.MD,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  source: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
  },
  time: {
    fontSize: FONT_SIZES.XS,
  },
  title: {
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
    lineHeight: 20,
    marginBottom: SPACING.XS,
  },
  summary: {
    fontSize: FONT_SIZES.SM,
    lineHeight: 18,
    marginBottom: SPACING.SM,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentiment: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  topicsContainer: {
    flexDirection: 'row',
  },
  topicTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  topicText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
  },
  tickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.XS,
  },
  tickersLabel: {
    fontSize: FONT_SIZES.XS,
    marginRight: SPACING.XS,
  },
  tickerTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  tickerText: {
    fontSize: FONT_SIZES.XS,
    fontWeight: '500',
  },
});

export default NewsItemComponent;
