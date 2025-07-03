import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stock } from '../types';
import { formatCurrency, formatPercentage, getChangeColor } from '../utils';
import { SPACING, FONT_SIZES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface StockItemProps {
  stock: Stock;
  onPress: () => void;
  onLongPress?: () => void;
  showAddButton?: boolean;
  onAddToWatchlist?: () => void;
  onRemoveFromWatchlist?: () => void;
  isInWatchlist?: boolean;
}

const StockItem: React.FC<StockItemProps> = ({
  stock,
  onPress,
  onLongPress,
  showAddButton = false,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist = false,
}) => {
  const { colors } = useTheme();
  const changeColor = getChangeColor(stock.change);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]} 
      onPress={onPress} 
      onLongPress={onLongPress}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={[styles.symbol, { color: colors.TEXT_PRIMARY }]}>{stock.symbol}</Text>
          <Text style={[styles.name, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
        
        <View style={styles.centerSection}>
          <Text style={[styles.price, { color: colors.TEXT_PRIMARY }]}>{formatCurrency(stock.price)}</Text>
          <View style={styles.changeContainer}>
            <Text style={[styles.change, { color: changeColor }]}>
              {formatCurrency(stock.change)}
            </Text>
            <Text style={[styles.changePercent, { color: changeColor }]}>
              ({formatPercentage(stock.changePercent)})
            </Text>
          </View>
        </View>

        {showAddButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isInWatchlist ? onRemoveFromWatchlist : onAddToWatchlist}
          >
            <Ionicons
              name={isInWatchlist ? 'star' : 'star-outline'}
              size={20}
              color={isInWatchlist ? colors.WARNING : colors.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.MD,
    marginVertical: SPACING.XS,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
  },
  leftSection: {
    flex: 1,
  },
  centerSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  actionButton: {
    marginLeft: SPACING.MD,
    padding: SPACING.XS,
  },
  symbol: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  name: {
    fontSize: FONT_SIZES.SM,
    marginTop: 2,
  },
  price: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  change: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
  },
  changePercent: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default StockItem;
