import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { CARD_TRANSACTIONS } from '@/constants/spendData';

const FILTER_CATEGORIES = ['All', 'Groceries', 'Shopping', 'Transport', 'Food', 'Other'];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest', icon: 'arrow-down' },
  { label: 'Oldest First', value: 'oldest', icon: 'arrow-up' },
  { label: 'Highest Amount', value: 'highest', icon: 'trending-up' },
  { label: 'Lowest Amount', value: 'lowest', icon: 'trending-down' },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

export default function CardTransactionsScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Temporary state for the sheet (apply on confirm)
  const [sheetCategory, setSheetCategory] = useState('All');
  const [sheetSort, setSheetSort] = useState<SortValue>('newest');

  const openFilterSheet = () => {
    setSheetCategory(selectedCategory);
    setSheetSort(sortBy);
    setShowFilterSheet(true);
  };

  const applyFilters = () => {
    setSelectedCategory(sheetCategory);
    setSortBy(sheetSort);
    setShowFilterSheet(false);
  };

  const resetFilters = () => {
    setSheetCategory('All');
    setSheetSort('newest');
  };

  const hasActiveFilters = selectedCategory !== 'All' || sortBy !== 'newest';

  const filteredTransactions = useMemo(() => {
    let txs = [...CARD_TRANSACTIONS];

    if (selectedCategory !== 'All') {
      txs = txs.filter(tx => tx.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      txs = txs.filter(tx =>
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'oldest':
        txs.reverse();
        break;
      case 'highest':
        txs.sort((a, b) => b.amountNum - a.amountNum);
        break;
      case 'lowest':
        txs.sort((a, b) => a.amountNum - b.amountNum);
        break;
      default:
        break;
    }

    return txs;
  }, [selectedCategory, searchQuery, sortBy]);

  const totalFiltered = filteredTransactions.reduce((sum, tx) => sum + tx.amountNum, 0);

  return (
    <View style={[styles.screen, { paddingTop: topPad, backgroundColor: C.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: C.borderLight }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h2" weight="semibold" family="display">Card Transactions</NuveText>
        <View style={{ width: 40 }} />
      </View>

      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: C.white, borderColor: C.borderLight }]}>
          <Feather name="search" size={16} color={C.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: C.textPrimary }]}
            placeholder="Search merchants..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: hasActiveFilters ? C.teal : C.white,
              borderColor: hasActiveFilters ? C.teal : C.borderLight,
            },
          ]}
          onPress={openFilterSheet}
        >
          <Feather name="sliders" size={18} color={hasActiveFilters ? '#FAFAF8' : C.textPrimary} />
          {hasActiveFilters && <View style={[styles.filterDot, { backgroundColor: C.gold }]} />}
        </TouchableOpacity>
      </View>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersRow}>
          {selectedCategory !== 'All' && (
            <TouchableOpacity
              style={[styles.activeTag, { backgroundColor: C.teal + '15', borderColor: C.teal + '30' }]}
              onPress={() => setSelectedCategory('All')}
            >
              <NuveText variant="caption" weight="semibold" color={C.teal}>{selectedCategory}</NuveText>
              <Feather name="x" size={12} color={C.teal} />
            </TouchableOpacity>
          )}
          {sortBy !== 'newest' && (
            <TouchableOpacity
              style={[styles.activeTag, { backgroundColor: C.gold + '15', borderColor: C.gold + '30' }]}
              onPress={() => setSortBy('newest')}
            >
              <NuveText variant="caption" weight="semibold" color={C.gold}>
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </NuveText>
              <Feather name="x" size={12} color={C.gold} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => { setSelectedCategory('All'); setSortBy('newest'); }}>
            <NuveText variant="caption" weight="semibold" color={C.error}>Clear all</NuveText>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: C.white, borderColor: C.borderLight }]}>
        <NuveText variant="caption" color={C.textMuted}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </NuveText>
        <NuveText variant="bodySmall" weight="semibold" color={C.error}>
          -EGP {totalFiltered.toLocaleString()}
        </NuveText>
      </View>

      {/* Transaction List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={C.grayLight} />
            <NuveText variant="body" color={C.textMuted} style={{ marginTop: 12 }}>
              No transactions found
            </NuveText>
            <NuveText variant="caption" color={C.textMuted}>
              Try adjusting your filters
            </NuveText>
          </View>
        ) : (
          filteredTransactions.map((tx, i) => (
            <View
              key={i}
              style={[
                styles.txRow,
                { borderBottomColor: C.borderLight },
                i === filteredTransactions.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.txIcon, { backgroundColor: C.textPrimary + '10' }]}>
                <Feather name={tx.icon as any} size={16} color={C.textPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <NuveText variant="bodySmall" weight="semibold">{tx.merchant}</NuveText>
                <NuveText variant="caption" color={C.textMuted}>{tx.category} · {tx.date}</NuveText>
              </View>
              <NuveText variant="bodySmall" weight="semibold" color={C.error}>-{tx.amount}</NuveText>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Filter Action Sheet */}
      <Modal
        visible={showFilterSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterSheet(false)}
        />
        <View style={[styles.sheetContainer, { backgroundColor: C.white }]}>
          <View style={[styles.sheetHandle, { backgroundColor: C.gray200 }]} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={resetFilters}>
              <NuveText variant="bodySmall" weight="semibold" color={C.error}>Reset</NuveText>
            </TouchableOpacity>
            <NuveText variant="h3" weight="semibold" family="display">Filters</NuveText>
            <TouchableOpacity onPress={() => setShowFilterSheet(false)}>
              <Feather name="x" size={20} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Category Section */}
            <View style={styles.sheetSection}>
              <NuveText variant="label" color={C.slate} style={{ marginBottom: 10 }}>CATEGORY</NuveText>
              <View style={styles.sheetChipsWrap}>
                {FILTER_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.sheetChip,
                      {
                        backgroundColor: sheetCategory === cat ? C.teal : C.background,
                        borderColor: sheetCategory === cat ? C.teal : C.borderLight,
                      },
                    ]}
                    onPress={() => setSheetCategory(cat)}
                  >
                    <NuveText
                      variant="bodySmall"
                      weight={sheetCategory === cat ? 'semibold' : 'regular'}
                      color={sheetCategory === cat ? '#FAFAF8' : C.textPrimary}
                    >
                      {cat}
                    </NuveText>
                    {sheetCategory === cat && (
                      <Feather name="check" size={14} color="#FAFAF8" style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Section */}
            <View style={styles.sheetSection}>
              <NuveText variant="label" color={C.slate} style={{ marginBottom: 10 }}>SORT BY</NuveText>
              <View style={{ gap: 6 }}>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.sortOption,
                      {
                        backgroundColor: sheetSort === opt.value ? C.teal + '10' : C.background,
                        borderColor: sheetSort === opt.value ? C.teal : C.borderLight,
                      },
                    ]}
                    onPress={() => setSheetSort(opt.value)}
                  >
                    <View style={[styles.sortOptionIcon, { backgroundColor: sheetSort === opt.value ? C.teal + '20' : C.borderLight }]}>
                      <Feather name={opt.icon as any} size={16} color={sheetSort === opt.value ? C.teal : C.slate} />
                    </View>
                    <NuveText
                      variant="body"
                      weight={sheetSort === opt.value ? 'semibold' : 'regular'}
                      color={sheetSort === opt.value ? C.teal : C.textPrimary}
                      style={{ flex: 1 }}
                    >
                      {opt.label}
                    </NuveText>
                    {sheetSort === opt.value && (
                      <Feather name="check-circle" size={18} color={C.teal} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: C.teal }]} onPress={applyFilters} activeOpacity={0.85}>
            <Feather name="check" size={18} color="#FAFAF8" />
            <NuveText variant="body" weight="bold" color="#FAFAF8">Apply Filters</NuveText>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  // Action Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sheetSection: {
    marginBottom: 24,
  },
  sheetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  sortOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
});
