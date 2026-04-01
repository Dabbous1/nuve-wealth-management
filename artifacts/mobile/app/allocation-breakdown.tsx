import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';

interface Asset {
  name: string;
  ticker?: string;
  value: number;
  allocation: number;
  returnPct: number;
}

interface Category {
  label: string;
  totalValue: number;
  allocation: number;
  color: string;
  icon: string;
  assets: Asset[];
}

export default function AllocationBreakdownScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Equity');

  const CATEGORIES: Category[] = [
    {
      label: 'Equity',
      totalValue: 62400,
      allocation: 48,
      color: C.chart1,
      icon: 'trending-up',
      assets: [
        { name: 'Commercial International Bank', ticker: 'COMI', value: 18700, allocation: 14.4, returnPct: 22.5 },
        { name: 'Eastern Tobacco', ticker: 'EAST', value: 12400, allocation: 9.5, returnPct: 18.3 },
        { name: 'Acumen Equity Fund', ticker: 'AEF', value: 15600, allocation: 12.0, returnPct: 15.8 },
        { name: 'EFG Hermes Holdings', ticker: 'HRHO', value: 8900, allocation: 6.8, returnPct: 12.1 },
        { name: 'Fawry for Banking', ticker: 'FWRY', value: 6800, allocation: 5.2, returnPct: -3.4 },
      ],
    },
    {
      label: 'Bonds',
      totalValue: 28600,
      allocation: 22,
      color: C.chart4,
      icon: 'shield',
      assets: [
        { name: 'Egyptian Treasury Bills (364-day)', value: 14200, allocation: 10.9, returnPct: 24.5 },
        { name: 'Acumen Income Fund', value: 8400, allocation: 6.5, returnPct: 18.2 },
        { name: 'Government Bonds (5yr)', value: 6000, allocation: 4.6, returnPct: 16.8 },
      ],
    },
    {
      label: 'Gold',
      totalValue: 19500,
      allocation: 15,
      color: C.chart2,
      icon: 'award',
      assets: [
        { name: 'iShares Gold Trust', ticker: 'IAU', value: 11700, allocation: 9.0, returnPct: 28.4 },
        { name: 'Egypt Gold ETF', value: 7800, allocation: 6.0, returnPct: 32.1 },
      ],
    },
    {
      label: 'Cash',
      totalValue: 13000,
      allocation: 10,
      color: C.chart5,
      icon: 'dollar-sign',
      assets: [
        { name: 'Acumen Money Market Fund', value: 8000, allocation: 6.2, returnPct: 12.8 },
        { name: 'Cash Reserves (EGP)', value: 5000, allocation: 3.8, returnPct: 0 },
      ],
    },
    {
      label: 'Real Estate',
      totalValue: 6500,
      allocation: 5,
      color: C.chart3,
      icon: 'home',
      assets: [
        { name: 'Egyptian REIT Fund', value: 6500, allocation: 5.0, returnPct: 8.6 },
      ],
    },
  ];

  const totalValue = CATEGORIES.reduce((sum, c) => sum + c.totalValue, 0);

  const toggleCategory = (label: string) => {
    setExpandedCategory(expandedCategory === label ? null : label);
  };

  return (
    <View style={[styles.screen, { backgroundColor: C.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: C.white, borderColor: C.borderLight }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h2" weight="bold" family="display">Allocation</NuveText>
        <View style={{ width: 40 }} />
      </View>

      {/* Total */}
      <View style={styles.totalRow}>
        <NuveText variant="caption" color={C.slate}>Total Portfolio Value</NuveText>
        <NuveText variant="h2" weight="bold" family="mono">EGP {totalValue.toLocaleString()}</NuveText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => {
          const isExpanded = expandedCategory === cat.label;
          return (
            <View key={cat.label} style={[styles.categorySection, { backgroundColor: C.white, borderColor: C.borderLight }]}>
              {/* Category header */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(cat.label)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '18' }]}>
                    <Feather name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <View>
                    <NuveText variant="body" weight="semibold">{cat.label}</NuveText>
                    <NuveText variant="caption" color={C.slate}>
                      {cat.assets.length} asset{cat.assets.length !== 1 ? 's' : ''} · {cat.allocation}%
                    </NuveText>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <NuveText variant="bodySmall" weight="bold" family="mono">
                    EGP {cat.totalValue.toLocaleString()}
                  </NuveText>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={C.slate}
                  />
                </View>
              </TouchableOpacity>

              {/* Allocation bar for category */}
              <View style={[styles.categoryBar, { backgroundColor: C.borderLight }]}>
                <View style={[styles.categoryBarFill, { width: `${cat.allocation}%` as any, backgroundColor: cat.color }]} />
              </View>

              {/* Expanded asset list */}
              {isExpanded && (
                <View style={[styles.assetList, { borderTopColor: C.borderLight }]}>
                  {cat.assets.map((asset, i) => (
                    <View
                      key={i}
                      style={[
                        styles.assetRow,
                        { borderBottomColor: C.borderLight },
                        i === cat.assets.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.assetInfo}>
                        <NuveText variant="bodySmall" weight="medium">{asset.name}</NuveText>
                        <View style={styles.assetMeta}>
                          {asset.ticker && (
                            <View style={[styles.tickerBadge, { backgroundColor: C.cream, borderColor: C.borderLight }]}>
                              <NuveText variant="caption" weight="bold" color={C.textPrimary} style={{ fontSize: 10 }}>
                                {asset.ticker}
                              </NuveText>
                            </View>
                          )}
                          <NuveText variant="caption" color={C.slate} family="mono">
                            {asset.allocation}% of portfolio
                          </NuveText>
                        </View>
                      </View>
                      <View style={styles.assetValues}>
                        <NuveText variant="bodySmall" weight="bold" family="mono">
                          EGP {asset.value.toLocaleString()}
                        </NuveText>
                        <NuveText
                          variant="caption"
                          weight="semibold"
                          family="mono"
                          color={asset.returnPct >= 0 ? C.teal : C.error}
                        >
                          {asset.returnPct >= 0 ? '+' : ''}{asset.returnPct}%
                        </NuveText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  totalRow: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 4,
  },
  content: {
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 12,
  },
  categoryBarFill: {
    height: 6,
    borderRadius: 3,
  },
  assetList: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  assetInfo: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  assetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tickerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  assetValues: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
