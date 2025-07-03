import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.PRIMARY,
  text,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  text: {
    marginTop: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
