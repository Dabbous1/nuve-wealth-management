import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import {
  SPEND_CATEGORIES,
  CARD_TRANSACTIONS,
  SPEND_MONTH_LABEL,
} from '@/constants/spendData';

export default function CategoryTransactionsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  const cat = SPEND_CATEGORIES.find(c => c.label === category);
  const txs = CARD_TRANSACTIONS.filter(t => t.category === category);
  const total = txs.reduce((s, t) => s + t.amountNum, 0);

  if (!cat) {
    return (
      <View style={[styles.screen, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { margin: 20 }]}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="body" color={Colors.textMuted} style={{ textAlign: 'center', marginTop: 40 }}>
          Category not found.
        </NuveText>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">{cat.label}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Category summary card */}
        <NuveCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
              <Feather name={cat.icon as any} size={22} color={cat.color} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="caption" color={Colors.textMuted}>{SPEND_MONTH_LABEL}</NuveText>
              <NuveText variant="h2" weight="bold" color={Colors.error}>
                -EGP {total.toLocaleString('en-EG')}
              </NuveText>
            </View>
            <View style={styles.pctBadge}>
              <View style={[styles.pctDot, { backgroundColor: cat.color }]} />
              <NuveText variant="caption" weight="bold" color={cat.color}>
                {cat.value}% of spend
              </NuveText>
            </View>
          </View>

          {/* Category fill bar */}
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${cat.value}%` as any, backgroundColor: cat.color }]} />
          </View>

          <NuveText variant="caption" color={Colors.textMuted}>
            {txs.length} transaction{txs.length !== 1 ? 's' : ''} this month
          </NuveText>
        </NuveCard>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" weight="semibold">Transactions</NuveText>
          <NuveText variant="caption" color={Colors.textMuted}>{txs.length} items</NuveText>
        </View>

        {txs.map((tx, i) => (
          <View
            key={i}
            style={[
              styles.txRow,
              i === 0 && styles.txRowFirst,
              i === txs.length - 1 && styles.txRowLast,
              i > 0 && i < txs.length && styles.txRowBorder,
            ]}
          >
            <View style={[styles.txIcon, { backgroundColor: cat.color + '15' }]}>
              <Feather name={tx.icon as any} size={16} color={cat.color} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="body" weight="semibold">{tx.merchant}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>{tx.date}</NuveText>
            </View>
            <NuveText variant="body" weight="bold" color={Colors.error}>
              -{tx.amount}
            </NuveText>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  summaryCard: { marginBottom: 24, gap: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  catIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  pctBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.gray50,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  pctDot: { width: 8, height: 8, borderRadius: 4 },
  barTrack: {
    height: 6, backgroundColor: Colors.gray100,
    borderRadius: 3, overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 14,
  },
  txRowFirst: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  txRowLast: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  txRowBorder: { borderTopWidth: 1, borderTopColor: Colors.gray100 },
  txIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
});
