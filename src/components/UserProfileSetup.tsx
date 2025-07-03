import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch } from '../store';
import { updateUser } from '../store/userSlice';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants';

interface UserProfileSetupProps {
  onComplete: () => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await dispatch(updateUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      })).unwrap();
      
      Alert.alert(
        'Profile Updated!',
        'Your profile has been saved successfully.',
        [{ text: 'Continue', onPress: onComplete }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={[colors.PRIMARY, colors.GRADIENT_END]} style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="person-circle" size={80} color={colors.TEXT_ON_PRIMARY} />
            <Text style={[styles.headerTitle, { color: colors.TEXT_ON_PRIMARY }]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.TEXT_ON_PRIMARY }]}>
              Let's personalize your Stoxify experience
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.TEXT_PRIMARY }]}>
                Full Name
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
                <Ionicons name="person-outline" size={20} color={colors.TEXT_SECONDARY} />
                <TextInput
                  style={[styles.input, { color: colors.TEXT_PRIMARY }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.TEXT_SECONDARY}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.TEXT_PRIMARY }]}>
                Email Address
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
                <Ionicons name="mail-outline" size={20} color={colors.TEXT_SECONDARY} />
                <TextInput
                  style={[styles.input, { color: colors.TEXT_PRIMARY }]}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.TEXT_SECONDARY}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Info Note */}
            <View style={[styles.infoContainer, { backgroundColor: colors.SURFACE }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.INFO} />
              <Text style={[styles.infoText, { color: colors.TEXT_SECONDARY }]}>
                Your information is stored locally and is used only to personalize your experience within the app.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { 
                backgroundColor: colors.PRIMARY,
                opacity: isLoading ? 0.7 : 1 
              }
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.TEXT_ON_PRIMARY} />
                <Text style={[styles.saveButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Saving...
                </Text>
              </View>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={colors.TEXT_ON_PRIMARY} />
                <Text style={[styles.saveButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Complete Setup
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.XL,
    paddingBottom: SPACING.XXL,
    paddingHorizontal: SPACING.LG,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.MD,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XL,
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.MD,
    marginLeft: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.MD,
    borderRadius: 12,
    marginTop: SPACING.MD,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.SM,
    lineHeight: 18,
    marginLeft: SPACING.SM,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    borderRadius: 12,
    marginBottom: SPACING.XL,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    marginLeft: SPACING.SM,
  },
});

export default UserProfileSetup;
