import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState, AppDispatch } from '../store';
import { logoutUser, updateUser, setApiKey, removeApiKey } from '../store/userSlice';
import { resetPortfolio } from '../store/portfolioSlice';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, FONT_SIZES, AVATAR_OPTIONS, STORAGE_KEYS, THEMES, TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { apiService } from '../services/apiService';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, theme, setTheme } = useTheme();
  
  const { user, apiKey } = useSelector((state: RootState) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [selectedTimezone, setSelectedTimezone] = useState(DEFAULT_TIMEZONE);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR);
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      const savedTimezone = await AsyncStorage.getItem(STORAGE_KEYS.TIMEZONE);
      
      if (savedAvatar) {
        setSelectedAvatar(savedAvatar);
      }
      
      if (savedTheme) {
        setCurrentTheme(savedTheme as 'light' | 'dark' | 'system');
      }

      if (savedTimezone) {
        setSelectedTimezone(savedTimezone);
      }
    } catch (error) {
      
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUser({ name, email })).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleAvatarSelect = async (avatar: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AVATAR, avatar);
      setSelectedAvatar(avatar);
      setShowAvatarModal(false);
    } catch (error) {
      
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await setTheme(newTheme);
      setCurrentTheme(newTheme);
    } catch (error) {
      
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear all your data and return you to the onboarding screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
              dispatch(resetPortfolio());
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App Data',
      'This will delete all your data including portfolio, watchlists, and settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                'App Reset Complete',
                'All data has been cleared. The app will restart.',
                [{ text: 'OK', onPress: () => {
                  dispatch(logoutUser());
                  dispatch(resetPortfolio());
                }}]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data.');
            }
          },
        },
      ]
    );
  };

  const isValidApiKeyFormat = (apiKey: string) => /^[A-Z0-9]{16}$/.test(apiKey);

  const handleUpdateApiKey = async () => {
    const trimmedKey = newApiKey.trim();
    if (!trimmedKey) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }
    if (!isValidApiKeyFormat(trimmedKey)) {
      Alert.alert('Invalid API Key', 'Please enter a valid Alpha Vantage API key (16 uppercase letters/numbers).');
      return;
    }
    try {
      await dispatch(setApiKey(trimmedKey)).unwrap();
      apiService.setApiKey(trimmedKey);
      setNewApiKey('');
      Alert.alert('Success', 'API key updated successfully! Real market data will now be used. Please refresh the app or pull to refresh data.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update API key');
    }
  };

  const handleRemoveApiKey = () => {
    Alert.alert(
      'Remove API Key',
      'This will switch to demo mode with limited functionality. You will only see mock data until you add a new API key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeApiKey());
            apiService.removeApiKey();
            Alert.alert('API Key Removed', 'App is now in demo mode. Real market data is disabled.');
          },
        },
      ]
    );
  };

  const handleTimezoneSelect = async (timezone: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMEZONE, timezone);
      setSelectedTimezone(timezone);
      setShowTimezoneModal(false);
      dispatch({ type: 'user/setTimezone', payload: timezone });
      Alert.alert('Success', 'Timezone updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update timezone');
    }
  };

  const renderAvatarOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.avatarOption,
        {
          backgroundColor: item === selectedAvatar ? colors.PRIMARY : colors.SURFACE,
          borderColor: colors.BORDER,
        },
      ]}
      onPress={() => handleAvatarSelect(item)}
    >
      <Text style={styles.avatarEmoji}>{item}</Text>
    </TouchableOpacity>
  );

  const renderThemeOption = (themeOption: 'light' | 'dark' | 'system', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: currentTheme === themeOption ? colors.PRIMARY : colors.SURFACE,
          borderColor: colors.BORDER,
        },
      ]}
      onPress={() => handleThemeChange(themeOption)}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={currentTheme === themeOption ? colors.TEXT_ON_PRIMARY : colors.TEXT_PRIMARY}
      />
      <Text
        style={[
          styles.themeLabel,
          {
            color: currentTheme === themeOption ? colors.TEXT_ON_PRIMARY : colors.TEXT_PRIMARY,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTimezoneOption = ({ item }: { item: typeof TIMEZONE_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[
        styles.timezoneOption,
        {
          backgroundColor: selectedTimezone === item.value ? colors.PRIMARY : colors.SURFACE,
          borderColor: colors.BORDER,
        },
      ]}
      onPress={() => handleTimezoneSelect(item.value)}
    >
      <Text
        style={[
          styles.timezoneOptionText,
          {
            color: selectedTimezone === item.value ? colors.TEXT_ON_PRIMARY : colors.TEXT_PRIMARY,
          },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.SURFACE }]}>
        <TouchableOpacity
          style={[styles.avatarContainer, { backgroundColor: colors.PRIMARY }]}
          onPress={() => setShowAvatarModal(true)}
        >
          <Text style={styles.avatar}>{selectedAvatar}</Text>
          <View style={[styles.editAvatarBadge, { backgroundColor: colors.SECONDARY }]}>
            <Ionicons name="pencil" size={12} color={colors.TEXT_ON_PRIMARY} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          {isEditing ? (
            <>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.BACKGROUND,
                    borderColor: colors.BORDER,
                    color: colors.TEXT_PRIMARY,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.TEXT_DISABLED}
              />
              <TextInput
                style={[
                  styles.emailInput,
                  {
                    backgroundColor: colors.BACKGROUND,
                    borderColor: colors.BORDER,
                    color: colors.TEXT_PRIMARY,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                placeholderTextColor={colors.TEXT_DISABLED}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </>
          ) : (
            <>
              <Text style={[styles.userName, { color: colors.TEXT_PRIMARY }]}>
                {user?.name || 'User Name'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.TEXT_SECONDARY }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.PRIMARY }]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
        >
          <Ionicons
            name={isEditing ? 'checkmark' : 'pencil'}
            size={20}
            color={colors.TEXT_ON_PRIMARY}
          />
        </TouchableOpacity>
      </View>

      {/* Theme Settings */}
      <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          Theme Settings
        </Text>
        <View style={styles.themeContainer}>
          {renderThemeOption('light', 'Light', 'sunny')}
          {renderThemeOption('dark', 'Dark', 'moon')}
          {renderThemeOption('system', 'System', 'phone-portrait')}
        </View>
      </View>

      {/* Timezone Settings */}
      <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          Timezone Settings
        </Text>
        <Text style={[styles.label, { color: colors.TEXT_SECONDARY, marginBottom: 8 }]}>
          Set your timezone for accurate market hours and greetings
        </Text>
        
        <TouchableOpacity
          style={[styles.timezoneSelector, { borderColor: colors.BORDER, backgroundColor: colors.BACKGROUND }]}
          onPress={() => setShowTimezoneModal(true)}
        >
          <Text style={[styles.timezoneText, { color: colors.TEXT_PRIMARY }]}>
            {TIMEZONE_OPTIONS.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* API Settings */}
      <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          API Settings
        </Text>
        
        <Text style={[styles.label, { color: colors.TEXT_SECONDARY, marginBottom: 8 }]}>
          API Key enables real market data. Without it, the app shows demo data.
        </Text>
        
        <View style={styles.apiKeyContainer}>
          <Text style={[styles.label, { color: colors.TEXT_SECONDARY }]}>
            Alpha Vantage API Key {!apiKey && '(Optional - Get free at alphavantage.co)'}
          </Text>
          
          {apiKey ? (
            <View style={styles.existingApiKey}>
              <Text style={[styles.apiKeyText, { color: colors.TEXT_PRIMARY }]}>
                {showApiKey ? apiKey : '••••••••••••••••'}
              </Text>
              <View style={styles.apiKeyActions}>
                <TouchableOpacity
                  style={styles.apiKeyButton}
                  onPress={() => setShowApiKey(!showApiKey)}
                >
                  <Ionicons
                    name={showApiKey ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.PRIMARY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.apiKeyButton}
                  onPress={handleRemoveApiKey}
                >
                  <Ionicons name="trash" size={20} color={colors.ERROR} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.newApiKeyContainer}>
              <TextInput
                style={[
                  styles.apiKeyInput,
                  {
                    backgroundColor: colors.BACKGROUND,
                    borderColor: colors.BORDER,
                    color: colors.TEXT_PRIMARY,
                  },
                ]}
                value={newApiKey}
                onChangeText={setNewApiKey}
                placeholder="Enter your Alpha Vantage API key"
                placeholderTextColor={colors.TEXT_DISABLED}
                secureTextEntry={!showApiKey}
              />
              <TouchableOpacity
                style={[styles.updateButton, { backgroundColor: colors.PRIMARY }]}
                onPress={handleUpdateApiKey}
              >
                <Text style={[styles.updateButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          App Information
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.TEXT_SECONDARY }]}>Version</Text>
          <Text style={[styles.infoValue, { color: colors.TEXT_PRIMARY }]}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.TEXT_SECONDARY }]}>
            Last Updated
          </Text>
          <Text style={[styles.infoValue, { color: colors.TEXT_PRIMARY }]}>
            {formatDate(new Date())}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.section, { backgroundColor: colors.SURFACE, marginBottom: SPACING.XL + 20 }]}>
        <TouchableOpacity style={[styles.actionButton, { borderColor: colors.WARNING }]} onPress={handleResetApp}>
          <Ionicons name="refresh" size={20} color={colors.WARNING} />
          <Text style={[styles.actionButtonText, { color: colors.WARNING }]}>
            Reset App (Debug)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { borderColor: colors.ERROR, marginTop: SPACING.MD }]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.ERROR} />
          <Text style={[styles.actionButtonText, { color: colors.ERROR }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timezone Selection Modal */}
      <Modal
        visible={showTimezoneModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimezoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
              Select Timezone
            </Text>
            
            <FlatList
              data={TIMEZONE_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={renderTimezoneOption}
              contentContainerStyle={styles.timezoneList}
            />
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.TEXT_DISABLED }]}
              onPress={() => setShowTimezoneModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
              Choose Avatar
            </Text>
            
            <FlatList
              data={AVATAR_OPTIONS}
              numColumns={5}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderAvatarOption}
              contentContainerStyle={styles.avatarGrid}
            />
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.TEXT_DISABLED }]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    fontSize: 40,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.LG,
  },
  userName: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginBottom: SPACING.XS,
  },
  userEmail: {
    fontSize: FONT_SIZES.MD,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
    fontSize: FONT_SIZES.MD,
    marginBottom: SPACING.SM,
  },
  emailInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
    fontSize: FONT_SIZES.MD,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginBottom: SPACING.MD,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.MD,
    marginHorizontal: SPACING.XS,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeLabel: {
    marginTop: SPACING.XS,
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
  },
  apiKeyContainer: {
    marginTop: SPACING.SM,
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
    marginBottom: SPACING.SM,
  },
  existingApiKey: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apiKeyText: {
    flex: 1,
    fontSize: FONT_SIZES.MD,
    fontFamily: 'monospace',
  },
  apiKeyActions: {
    flexDirection: 'row',
  },
  apiKeyButton: {
    padding: SPACING.SM,
    marginLeft: SPACING.SM,
  },
  newApiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
    fontSize: FONT_SIZES.MD,
    marginRight: SPACING.SM,
  },
  updateButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  updateButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  timezoneContainer: {
    marginTop: SPACING.SM,
  },
  timezoneSelector: {
    padding: SPACING.MD,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timezoneText: {
    fontSize: FONT_SIZES.MD,
  },
  editTimezoneButton: {
    padding: SPACING.SM,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  infoLabel: {
    fontSize: FONT_SIZES.MD,
  },
  infoValue: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MD,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    marginLeft: SPACING.SM,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: SPACING.XL,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  avatarGrid: {
    alignItems: 'center',
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.XS,
    borderWidth: 2,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  closeButton: {
    marginTop: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    textAlign: 'center',
  },
  timezoneOption: {
    padding: SPACING.MD,
    margin: SPACING.XS,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timezoneOptionText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '500',
  },
  timezoneList: {
    alignItems: 'center',
  },
});

export default ProfileScreen;
