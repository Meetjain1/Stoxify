import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioItem } from '../types';
import { formatCurrency, formatPercentage, getChangeColor } from '../utils';
import { SPACING, FONT_SIZES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface PortfolioItemComponentProps {
  item: PortfolioItem;
  onPress: () => void;
  onRemove?: () => void;
}

const PortfolioItemComponent: React.FC<PortfolioItemComponentProps> = ({
  item,
  onPress,
  onRemove,
}) => {
  const { colors } = useTheme();
  const gainColor = getChangeColor(item.gain);

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.SURFACE }]} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={[styles.symbol, { color: colors.TEXT_PRIMARY }]}>{item.symbol}</Text>
          <Text style={[styles.name, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.quantity, { color: colors.TEXT_SECONDARY }]}>
            {item.quantity} shares @ {formatCurrency(item.averagePrice)}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[styles.currentPrice, { color: colors.TEXT_PRIMARY }]}>
            {formatCurrency(item.currentPrice)}
          </Text>
          <Text style={[styles.totalValue, { color: colors.TEXT_PRIMARY }]}>
            {formatCurrency(item.totalValue)}
          </Text>
          <View style={styles.gainContainer}>
            <Text style={[styles.gain, { color: gainColor }]}>
              {formatCurrency(item.gain)}
            </Text>
            <Text style={[styles.gainPercent, { color: gainColor }]}>
              ({formatPercentage(item.gainPercent)})
            </Text>
          </View>
        </View>

        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.ERROR}
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
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  removeButton: {
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
  quantity: {
    fontSize: FONT_SIZES.XS,
    marginTop: 2,
  },
  currentPrice: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginTop: 2,
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  gain: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
  },
  gainPercent: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default PortfolioItemComponent;
