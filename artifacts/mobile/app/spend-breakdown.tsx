import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { AllocationBars } from '@/components/AllocationDonut';
import {
  SPEND_CATEGORIES,
  CARD_TRANSACTIONS,
  SPEND_MONTH_TOTAL,
  SPEND_MONTH_LABEL,
} from '@/constants/spendData';

export default function SpendBreakdownScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(prev => (prev === label ? null : label));
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">Spending Breakdown</NuveText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary banner */}
        <NuveCard style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <NuveText variant="caption" color={Colors.textMuted}>Total Spent</NuveText>
              <NuveText variant="h2" weight="bold" color={Colors.error}>
                -EGP {SPEND_MONTH_TOTAL.toLocaleString('en-EG')}
              </NuveText>
            </View>
            <View style={styles.monthBadge}>
              <NuveText variant="caption" weight="semibold" color={Colors.primary}>
                {SPEND_MONTH_LABEL}
              </NuveText>
            </View>
          </View>
          <AllocationBars data={SPEND_CATEGORIES} />
        </NuveCard>

        {/* Category sections */}
        {SPEND_CATEGORIES.map(cat => {
          const txs = CARD_TRANSACTIONS.filter(t => t.category === cat.label);
          const catTotal = txs.reduce((s, t) => s + t.amountNum, 0);
          const isOpen = expanded === cat.label;

          return (
            <View key={cat.label} style={styles.categoryBlock}>
              {/* Category header row — tap to expand */}
              <TouchableOpacity
                style={styles.catHeader}
                onPress={() => toggle(cat.label)}
                activeOpacity={0.75}
              >
                <View style={[styles.catIconWrap, { backgroundColor: cat.color + '18' }]}>
                  <Feather name={cat.icon as any} size={18} color={cat.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <NuveText variant="body" weight="semibold">{cat.label}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>
                    {txs.length} transaction{txs.length !== 1 ? 's' : ''} · {cat.value}% of spend
                  </NuveText>
                </View>

                <View style={styles.catRight}>
                  <NuveText variant="body" weight="bold" color={Colors.error}>
                    -EGP {catTotal.toLocaleString('en-EG')}
                  </NuveText>
                  <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.textMuted}
                    style={{ marginTop: 2 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Colored progress bar */}
              <View style={styles.catBarTrack}>
                <View
                  style={[
                    styles.catBarFill,
                    { width: `${cat.value}%` as any, backgroundColor: cat.color },
                  ]}
                />
              </View>

              {/* Transactions list (expandable) */}
              {isOpen && (
                <>
                  <View style={styles.txList}>
                    {txs.map((tx, i) => (
                      <View
                        key={i}
                        style={[
                          styles.txRow,
                          i < txs.length - 1 && styles.txRowBorder,
                        ]}
                      >
                        <View style={[styles.txIcon, { backgroundColor: cat.color + '12' }]}>
                          <Feather name={tx.icon as any} size={14} color={cat.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <NuveText variant="bodySmall" weight="semibold">{tx.merchant}</NuveText>
                          <NuveText variant="caption" color={Colors.textMuted}>{tx.date}</NuveText>
                        </View>
                        <NuveText variant="bodySmall" weight="semibold" color={Colors.error}>
                          -{tx.amount}
                        </NuveText>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.seeAllBtn, { borderColor: cat.color + '30' }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: '/category-transactions', params: { category: cat.label } });
                    }}
                    activeOpacity={0.75}
                  >
                    <NuveText variant="bodySmall" weight="semibold" color={cat.color}>
                      See all Transactions
                    </NuveText>
                    <Feather name="arrow-right" size={14} color={cat.color} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  summaryCard: { marginBottom: 24, gap: 16 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthBadge: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryBlock: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  catIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  catRight: { alignItems: 'flex-end', gap: 2 },
  catBarTrack: {
    height: 4,
    backgroundColor: Colors.gray100,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  catBarFill: { height: 4, borderRadius: 2 },
  txList: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  txIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
