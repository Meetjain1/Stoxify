import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RootState, AppDispatch } from '../store';
import {
  selectWatchlists,
  selectActiveWatchlist,
} from '../store/selectors/watchlistSelectors';
import {
  createWatchlist,
  addToWatchlist,
} from '../store/watchlistSlice';
import { Stock } from '../types';

interface WatchlistSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  stock: Stock | null;
  onSuccess: (watchlistName: string) => void;
}

const WatchlistSelectorModal: React.FC<WatchlistSelectorModalProps> = ({
  visible,
  onClose,
  stock,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const watchlists = useSelector(selectWatchlists);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  const handleSelectWatchlist = (watchlistId: string, watchlistName: string) => {
    if (!stock) return;

    const watchlistItem = {
      id: `${stock.symbol}_${Date.now()}`,
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      price: stock.price || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      addedDate: new Date().toISOString(),
      addedAt: new Date().toISOString(),
    };

    dispatch(addToWatchlist({ watchlistId, item: watchlistItem }));
    onSuccess(watchlistName);
    onClose();
  };

  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }

    const watchlistName = newWatchlistName.trim();
    dispatch(createWatchlist({ name: watchlistName }));
    
    setTimeout(() => {
      const newWatchlist = watchlists.find(w => w.name === watchlistName);
      if (newWatchlist && stock) {
        handleSelectWatchlist(newWatchlist.id, watchlistName);
      }
    }, 100);

    setNewWatchlistName('');
    setShowCreateForm(false);
  };

  const renderWatchlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.watchlistItem, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
      onPress={() => handleSelectWatchlist(item.id, item.name)}
    >
      <View style={styles.watchlistInfo}>
        <Text style={[styles.watchlistName, { color: colors.TEXT_PRIMARY }]}>
          {item.name}
        </Text>
        <Text style={[styles.watchlistCount, { color: colors.TEXT_SECONDARY }]}>
          {item.items.length} stocks
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.TEXT_SECONDARY} />
    </TouchableOpacity>
  );

  if (showCreateForm) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                <Ionicons name="arrow-back" size={24} color={colors.TEXT_PRIMARY} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
                Create New Watchlist
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.createForm}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.BACKGROUND,
                    borderColor: colors.BORDER,
                    color: colors.TEXT_PRIMARY,
                  },
                ]}
                placeholder="Watchlist name"
                placeholderTextColor={colors.TEXT_SECONDARY}
                value={newWatchlistName}
                onChangeText={setNewWatchlistName}
                autoFocus
              />
              
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.PRIMARY }]}
                onPress={handleCreateWatchlist}
              >
                <Text style={[styles.createButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Create & Add Stock
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
              Add to Watchlist
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {stock && (
            <View style={[styles.stockInfo, { backgroundColor: colors.BACKGROUND }]}>
              <Text style={[styles.stockSymbol, { color: colors.TEXT_PRIMARY }]}>
                {stock.symbol}
              </Text>
              <Text style={[styles.stockName, { color: colors.TEXT_SECONDARY }]}>
                {stock.name}
              </Text>
            </View>
          )}

          {watchlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color={colors.TEXT_SECONDARY} />
              <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
                No Watchlists Yet
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.TEXT_SECONDARY }]}>
                Create your first watchlist to organize your favorite stocks
              </Text>
              <TouchableOpacity
                style={[styles.createFirstButton, { backgroundColor: colors.PRIMARY }]}
                onPress={() => setShowCreateForm(true)}
              >
                <Text style={[styles.createFirstButtonText, { color: colors.TEXT_ON_PRIMARY }]}>
                  Create First Watchlist
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={watchlists}
                renderItem={renderWatchlistItem}
                keyExtractor={(item) => item.id}
                style={styles.watchlistsList}
                showsVerticalScrollIndicator={false}
              />

              <TouchableOpacity
                style={[styles.addNewButton, { borderColor: colors.PRIMARY }]}
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add" size={20} color={colors.PRIMARY} />
                <Text style={[styles.addNewText, { color: colors.PRIMARY }]}>
                  Create New Watchlist
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 14,
    marginTop: 2,
  },
  watchlistsList: {
    maxHeight: 300,
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: '600',
  },
  watchlistCount: {
    fontSize: 12,
    marginTop: 2,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 12,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createForm: {
    paddingVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WatchlistSelectorModal;
