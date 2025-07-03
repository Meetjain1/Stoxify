import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartData, TimeFrame } from '../types';
import { COLORS, SPACING, FONT_SIZES, CHART_CONFIG } from '../constants';

interface StockChartProps {
  data: ChartData;
  timeFrame: TimeFrame;
  width?: number;
  height?: number;
  showTitle?: boolean;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const StockChart: React.FC<StockChartProps> = ({
  data,
  timeFrame,
  width = screenWidth - 32,
  height = 220,
  showTitle = false,
  title,
}) => {
  const chartConfig = {
    ...CHART_CONFIG,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: COLORS.PRIMARY,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLORS.TEXT_DISABLED,
      strokeWidth: 0.5,
    },
  };

  if (!data.datasets || data.datasets.length === 0 || data.datasets[0].data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No chart data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && title && (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={data}
          width={Math.max(width, data.labels.length * 30)}
          height={height}
          chartConfig={chartConfig}
          bezier={true}
          style={styles.chart}
          withDots={data.labels.length <= 10}
          withShadow={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={false}
          segments={4}
          formatYLabel={(value) => {
            const num = parseFloat(value);
            if (num >= 1000) {
              return `$${(num / 1000).toFixed(1)}K`;
            }
            return `$${num.toFixed(0)}`;
          }}
          formatXLabel={(value) => {
            switch (timeFrame) {
              case '1D':
                return value.length > 5 ? value.substring(0, 5) : value;
              case '1W':
              case '1M':
                return value.length > 5 ? value.substring(0, 5) : value;
              case '3M':
              case '6M':
              case '1Y':
                return value.length > 8 ? value.substring(5, 10) : value;
              default:
                return value;
            }
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: SPACING.MD,
    margin: SPACING.MD,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  noDataText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default StockChart;
