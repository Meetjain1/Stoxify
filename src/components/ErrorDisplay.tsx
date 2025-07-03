import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  style?: any;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle" size={48} color={COLORS.ERROR} />
      <Text style={styles.errorText}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  errorText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.SURFACE,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
});

export default ErrorDisplay;
