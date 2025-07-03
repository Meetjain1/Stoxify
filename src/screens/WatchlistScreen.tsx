import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../store';
import { 
  loadWatchlists,
  setActiveWatchlist,
  createWatchlist,
  updateWatchlistName,
  deleteWatchlist,
  removeFromWatchlist,
  addToWatchlist
} from '../store/watchlistSlice';
import {
  selectWatchlists,
  selectWatchlistLoading,
  selectWatchlistError,
  selectActiveWatchlist,
  selectActiveWatchlistId,
  selectActiveWatchlistItems
} from '../store/selectors/watchlistSelectors';
import { fetchMultipleStocks } from '../store/stocksSlice';
import { RootStackParamList, WatchlistItem, Watchlist, Stock } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants';
import { formatCurrency } from '../utils';

import StockItem from '../components/StockItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import CustomAlert from '../components/CustomAlert';

type WatchlistScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const WatchlistScreen: React.FC = () => {
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [editingWatchlist, setEditingWatchlist] = useState<string | null>(null);
  
  const [alertConfig, setAlertConfig] = useState<{
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
  }>({
    visible: false,
    title: '',
    message: '',
  });
  
  const watchlists = useSelector(selectWatchlists);
  const loading = useSelector(selectWatchlistLoading);
  const error = useSelector(selectWatchlistError);
  const activeWatchlistId = useSelector(selectActiveWatchlistId);
  const activeWatchlist = useSelector(selectActiveWatchlist);
  const watchlistItems = useSelector(selectActiveWatchlistItems);
  useEffect(() => {
    dispatch(loadWatchlists());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const symbols = watchlistItems.map((item: WatchlistItem) => item.symbol);
      if (symbols.length > 0) {
        await dispatch(fetchMultipleStocks(symbols)).unwrap();
      }
      await dispatch(loadWatchlists()).unwrap();
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      dispatch(createWatchlist({
        name: newWatchlistName.trim()
      }));
      setNewWatchlistName('');
      setShowCreateModal(false);
    }
  };

  const handleRenameWatchlist = () => {
    if (newWatchlistName.trim() && editingWatchlist) {
      dispatch(updateWatchlistName({
        id: editingWatchlist,
        name: newWatchlistName.trim()
      }));
      setNewWatchlistName('');
      setEditingWatchlist(null);
      setShowRenameModal(false);
    }
  };

  const handleDeleteWatchlist = (watchlistId: string) => {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return;
    
    setAlertConfig({
      visible: true,
      title: 'Delete Watchlist',
      message: `Are you sure you want to delete "${watchlist.name}"?`,
      type: 'warning',
      primaryButton: {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteWatchlist(watchlistId));
          setAlertConfig({ visible: false, title: '', message: '' });
          
          setTimeout(() => {
            setAlertConfig({
              visible: true,
              title: 'Deleted',
              message: 'Watchlist deleted successfully.',
              type: 'success',
              primaryButton: {
                text: 'OK',
                style: 'primary',
                onPress: () => setAlertConfig({ visible: false, title: '', message: '' }),
              },
            });
          }, 300);
        }
      },
      secondaryButton: {
        text: 'Cancel',
        onPress: () => setAlertConfig({ visible: false, title: '', message: '' }),
      },
    });
  };

  const handleRemoveStock = (symbol: string) => {
    if (activeWatchlistId) {
      dispatch(removeFromWatchlist({ 
        watchlistId: activeWatchlistId, 
        symbol 
      }));
    }
  };

  const openRenameModal = (watchlist: Watchlist) => {
    setEditingWatchlist(watchlist.id);
    setNewWatchlistName(watchlist.name);
    setShowRenameModal(true);
  };

  const convertWatchlistItemToStock = (item: WatchlistItem): Stock => ({
    symbol: item.symbol,
    name: item.name,
    price: item.price,
    change: item.change,
    changePercent: item.changePercent,
    volume: 0,
    high: 0,
    low: 0,
    open: 0,
    previousClose: item.price - item.change,
  });

  const renderStockItem = ({ item }: { item: WatchlistItem }) => (
    <View style={{ backgroundColor: colors.SURFACE, borderRadius: 16, padding: 16, marginBottom: 16, flex: 1, marginHorizontal: 8, shadowColor: colors.PRIMARY, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
      <Text style={{ color: colors.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
      <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 14 }}>{item.symbol}</Text>
      <Text style={{ color: colors.PRIMARY, fontWeight: 'bold', fontSize: 18, marginVertical: 8 }}>{formatCurrency(item.price)}</Text>
      <TouchableOpacity onPress={() => handleRemoveStock(item.symbol)} style={{ position: 'absolute', top: 12, right: 12 }}>
        <Ionicons name={'bookmark'} size={24} color={colors.ERROR} />
      </TouchableOpacity>
    </View>
  );

  const renderWatchlistTab = ({ item }: { item: Watchlist }) => (
    <TouchableOpacity
      style={[
        styles.tabItem,
        { 
          backgroundColor: item.id === activeWatchlistId ? colors.PRIMARY : colors.SURFACE,
          borderColor: colors.BORDER 
        }
      ]}
      onPress={() => dispatch(setActiveWatchlist(item.id))}
      onLongPress={() => item.isDefault ? null : openRenameModal(item)}
    >
      <Text
        style={[
          styles.tabText,
          {
            color: item.id === activeWatchlistId ? colors.TEXT_ON_PRIMARY : colors.TEXT_PRIMARY
          }
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text
        style={[
          styles.tabCount,
          {
            color: item.id === activeWatchlistId ? colors.TEXT_ON_PRIMARY : colors.TEXT_SECONDARY
          }
        ]}
      >
        {item.items.length}
      </Text>
      {!item.isDefault && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteWatchlist(item.id)}
        >
          <Ionicons 
            name="close-circle" 
            size={16} 
            color={item.id === activeWatchlistId ? colors.TEXT_ON_PRIMARY : colors.ERROR} 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.BACKGROUND }]}>
      <Ionicons name="star-outline" size={64} color={colors.TEXT_DISABLED} />
      <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
        No Stocks in Watchlist
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.TEXT_SECONDARY }]}>
        Search for stocks and add them to your watchlist to track their performance.
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.PRIMARY }]}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={[styles.addButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
          Search Stocks
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && watchlists.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => dispatch(loadWatchlists())} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Watchlist Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.SURFACE, borderBottomColor: colors.BORDER }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {watchlists.map((watchlist) => (
            <View key={watchlist.id}>
              {renderWatchlistTab({ item: watchlist })}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addTabButton, { borderColor: colors.BORDER }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color={colors.PRIMARY} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Watchlist Content */}
      {watchlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={watchlistItems}
          keyExtractor={(item) => item.symbol}
          renderItem={renderStockItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.PRIMARY}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Create Watchlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
              Create New Watchlist
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.BACKGROUND,
                  borderColor: colors.BORDER,
                  color: colors.TEXT_PRIMARY
                }
              ]}
              placeholder="Watchlist name"
              placeholderTextColor={colors.TEXT_DISABLED}
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.TEXT_DISABLED }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewWatchlistName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.PRIMARY }]}
                onPress={handleCreateWatchlist}
              >
                <Text style={[styles.modalButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Watchlist Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
              Rename Watchlist
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.BACKGROUND,
                  borderColor: colors.BORDER,
                  color: colors.TEXT_PRIMARY
                }
              ]}
              placeholder="Watchlist name"
              placeholderTextColor={colors.TEXT_DISABLED}
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.TEXT_DISABLED }]}
                onPress={() => {
                  setShowRenameModal(false);
                  setNewWatchlistName('');
                  setEditingWatchlist(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.PRIMARY }]}
                onPress={handleRenameWatchlist}
              >
                <Text style={[styles.modalButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 32 }} />

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={alertConfig.primaryButton}
        secondaryButton={alertConfig.secondaryButton}
        onClose={() => setAlertConfig({ visible: false, title: '', message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    paddingVertical: SPACING.SM,
  },
  tabsContent: {
    paddingHorizontal: SPACING.MD,
  },
  tabItem: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  tabText: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    flex: 1,
  },
  tabCount: {
    fontSize: FONT_SIZES.XS,
    marginLeft: SPACING.XS,
  },
  deleteButton: {
    marginLeft: SPACING.XS,
    padding: 2,
  },
  addTabButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  listContainer: {
    padding: SPACING.MD,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.MD,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.XL,
  },
  addButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: SPACING.XL,
    borderRadius: 12,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
    fontSize: FONT_SIZES.MD,
    marginBottom: SPACING.LG,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
    marginHorizontal: SPACING.SM,
  },
  modalButtonText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WatchlistScreen;
