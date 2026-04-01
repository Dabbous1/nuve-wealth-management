import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useStrings } from '@/hooks/useStrings';

const TAX_DATA = [
  { category: 'Capital Gains — EGX Stocks', amount: 0, rate: '0%', note: 'Exempt (Egyptian residents)' },
  { category: 'Dividend Income', amount: 8500, rate: '5%', note: 'Withheld at source', tax: 425 },
  { category: 'Treasury Bill Income', amount: 32000, rate: '20%', note: 'Withheld at source', tax: 6400 },
  { category: 'Mutual Fund Distributions', amount: 5200, rate: '0%', note: 'Exempt (Acumen managed)' },
];

export default function TaxScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const [selectedYear, setSelectedYear] = useState('2025');
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const totalTax = TAX_DATA.reduce((s, r) => s + (r.tax || 0), 0);
  const totalIncome = TAX_DATA.reduce((s, r) => s + r.amount, 0);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: C.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.white }]}>
          <Feather name="arrow-left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">Tax Reporting</NuveText>
        <View style={{ width: 36 }} />
      </View>

      {/* Year Selector */}
      <View style={styles.yearRow}>
        {['2023', '2024', '2025'].map(y => (
          <TouchableOpacity
            key={y}
            style={[
              styles.yearChip,
              { backgroundColor: C.white, borderColor: C.gray200 },
              y === selectedYear && { backgroundColor: C.teal, borderColor: C.teal },
            ]}
            onPress={() => setSelectedYear(y)}
          >
            <NuveText variant="bodySmall" weight="semibold" color={y === selectedYear ? '#FAFAF8' : C.textSecondary}>
              FY {y}
            </NuveText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary — NuveCard variant="dark" uses Colors.midnight internally */}
      <NuveCard variant="dark" style={{ marginBottom: 20, gap: 12 }}>
        <NuveText variant="label" color={Colors.gold}>Tax Summary — FY {selectedYear}</NuveText>
        <View style={styles.summaryRow}>
          <View>
            <NuveText variant="caption" color={C.slate}>Total Investment Income</NuveText>
            <NuveText variant="h2" weight="bold" family="mono" color={'#FAFAF8'}>EGP {totalIncome.toLocaleString()}</NuveText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <NuveText variant="caption" color={C.slate}>Total Tax Withheld</NuveText>
            <NuveText variant="h2" weight="bold" family="mono" color={Colors.gold}>EGP {totalTax.toLocaleString()}</NuveText>
          </View>
        </View>
      </NuveCard>

      {/* Breakdown */}
      <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Income Breakdown</NuveText>
      {TAX_DATA.map((item, i) => (
        <NuveCard key={i} style={{ marginBottom: 12 }}>
          <View style={styles.taxRow}>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{item.category}</NuveText>
              <NuveText variant="caption" color={C.textMuted}>{item.note}</NuveText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <NuveText variant="bodySmall" weight="semibold">EGP {item.amount.toLocaleString()}</NuveText>
              {item.tax ? (
                <NuveText variant="caption" color={C.error}>Tax: EGP {item.tax.toLocaleString()}</NuveText>
              ) : (
                <View style={[styles.exemptPill, { backgroundColor: C.successLight }]}>
                  <NuveText variant="caption" weight="bold" color={Colors.success}>{item.rate}</NuveText>
                </View>
              )}
            </View>
          </View>
        </NuveCard>
      ))}

      <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: C.teal }]}>
        <Feather name="download" size={18} color={Colors.midnight} />
        <NuveText variant="body" weight="bold" color={Colors.midnight}>Download Tax Report (PDF)</NuveText>
      </TouchableOpacity>

      <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center', marginTop: 12, lineHeight: 18 }}>
        Tax information is provided for guidance only. Consult a licensed tax advisor for your official filing.
      </NuveText>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  yearRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  yearChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  taxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exemptPill: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 12, paddingVertical: 16, marginTop: 8,
  },
});
