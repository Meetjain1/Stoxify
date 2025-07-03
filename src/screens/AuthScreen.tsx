import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootState, AppDispatch } from '../store';
import { loginUser, registerUser, loadUser, setApiKey } from '../store/userSlice';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { validateEmail } from '../utils';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@stoxify.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!isLogin && name.trim().length < 2) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    try {
      if (isLogin) {
        await dispatch(loginUser({ email, password })).unwrap();
      } else {
        await dispatch(registerUser({ email, password, name })).unwrap();
      }
      
      setShowApiKeySetup(true);
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  const handleApiKeySubmit = async () => {
    if (apiKey.trim()) {
      try {
        await dispatch(setApiKey(apiKey.trim())).unwrap();
        apiService.setApiKey(apiKey.trim());
        Alert.alert('Success', 'API key saved successfully! Real market data is now enabled.');
      } catch (error) {
        Alert.alert('Error', 'Failed to save API key');
      }
    } else {
      Alert.alert('Demo Mode', 'Continuing with demo data. You can add your API key later in Profile settings for real market data.');
    }
  };

  const handleSkipApiKey = () => {
    Alert.alert(
      'Skip API Key Setup',
      'You can set up your Alpha Vantage API key later in the Profile section for full functionality.',
      [
        { text: 'Continue with Demo', style: 'default' },
        { text: 'Set Up Now', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner text="Signing in..." />;
  }

  if (showApiKeySetup) {
    return (
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.apiKeyContainer}>
            <Ionicons name="key" size={64} color={COLORS.SURFACE} />
            <Text style={styles.apiKeyTitle}>API Key Setup</Text>
            <Text style={styles.apiKeyDescription}>
              To get real-time stock data, please enter your Alpha Vantage API key.{'\n\n'}
              Get your free API key at: https:
            </Text>
            
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Enter your API key (optional)"
              placeholderTextColor={COLORS.TEXT_DISABLED}
              value={apiKey}
              onChangeText={setApiKeyState}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.apiKeyButton} onPress={handleApiKeySubmit}>
              <Text style={styles.apiKeyButtonText}>Save API Key</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipApiKey}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="trending-up" size={80} color={COLORS.SURFACE} />
            <Text style={styles.appName}>Stoxify</Text>
            <Text style={styles.tagline}>Your Gateway to Smart Trading</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.TEXT_DISABLED}
                value={name}
                onChangeText={setName}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.TEXT_DISABLED}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.TEXT_DISABLED}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={styles.demoInfo}>
              <Ionicons name="information-circle" size={16} color={COLORS.SURFACE} />
              <Text style={styles.demoText}>
                This is a demo app. Use any email and password to continue.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  appName: {
    fontSize: FONT_SIZES.HUGE,
    fontWeight: 'bold',
    color: COLORS.SURFACE,
    marginTop: SPACING.MD,
  },
  tagline: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.SURFACE,
    opacity: 0.9,
    marginTop: SPACING.XS,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: SPACING.LG,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.LG,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.PRIMARY,
  },
  tabText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
  activeTabText: {
    color: COLORS.SURFACE,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.TEXT_DISABLED,
    borderRadius: 12,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.SURFACE,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  submitButtonText: {
    color: COLORS.SURFACE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.LG,
    padding: SPACING.SM,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  demoText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.XS,
    textAlign: 'center',
    flex: 1,
  },
  apiKeyContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: SPACING.LG,
    margin: SPACING.LG,
  },
  apiKeyTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  apiKeyDescription: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.LG,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: COLORS.TEXT_DISABLED,
    borderRadius: 12,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: FONT_SIZES.MD,
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.SURFACE,
    width: '100%',
  },
  apiKeyButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    marginBottom: SPACING.SM,
    width: '100%',
  },
  apiKeyButtonText: {
    color: COLORS.SURFACE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  skipButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.MD,
    textAlign: 'center',
  },
});

export default AuthScreen;
