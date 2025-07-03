import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  primaryButton?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'destructive' | 'primary';
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  primaryButton,
  secondaryButton,
  onClose,
}) => {
  const { colors } = useTheme();

  const getIconForType = () => {
    switch (type) {
      case 'warning':
        return <Ionicons name="warning" size={24} color={colors.WARNING} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={colors.ERROR} />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={colors.SUCCESS} />;
      default:
        return <Ionicons name="information-circle" size={24} color={colors.INFO} />;
    }
  };

  const getButtonStyle = (buttonStyle: string = 'default') => {
    switch (buttonStyle) {
      case 'destructive':
        return {
          backgroundColor: colors.ERROR,
          color: colors.TEXT_ON_PRIMARY,
        };
      case 'primary':
        return {
          backgroundColor: colors.PRIMARY,
          color: colors.TEXT_ON_PRIMARY,
        };
      default:
        return {
          backgroundColor: 'transparent',
          color: colors.PRIMARY,
        };
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: colors.SURFACE }]}>
          {/* Header with icon */}
          <View style={styles.header}>
            {getIconForType()}
            <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <Text style={[styles.message, { color: colors.TEXT_SECONDARY }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {secondaryButton && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryButton.onPress}
              >
                <Text style={[styles.buttonText, { color: colors.TEXT_SECONDARY }]}>
                  {secondaryButton.text}
                </Text>
              </TouchableOpacity>
            )}

            {primaryButton && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  {
                    backgroundColor: getButtonStyle(primaryButton.style).backgroundColor,
                  },
                ]}
                onPress={primaryButton.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    styles.primaryButtonText,
                    { color: getButtonStyle(primaryButton.style).color },
                  ]}
                >
                  {primaryButton.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  alertContainer: {
    width: width - SPACING.XL * 2,
    maxWidth: 320,
    borderRadius: 16,
    padding: SPACING.LG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginLeft: SPACING.SM,
    flex: 1,
  },
  message: {
    fontSize: FONT_SIZES.MD,
    lineHeight: 22,
    marginBottom: SPACING.XL,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.SM,
  },
  button: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  primaryButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  primaryButtonText: {
    fontWeight: 'bold',
  },
});

export default CustomAlert;
