import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { AllocationBars } from '@/components/AllocationDonut';
import { useStrings } from '@/hooks/useStrings';
import { useColors } from '@/hooks/useColors';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Chart helpers ──────────────────────────────────────────────
function smoothPath(pts: number[], w: number, h: number, fill = false): string {
  if (pts.length < 2) return '';
  const pad = { x: 8, top: 12, bot: 20 };
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const x = (i: number) => pad.x + (i / (pts.length - 1)) * (w - 2 * pad.x);
  const y = (v: number) => pad.top + (1 - (v - min) / range) * (h - pad.top - pad.bot);
  let d = `M ${x(0).toFixed(1)} ${y(pts[0]).toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = ((x(i - 1) + x(i)) / 2).toFixed(1);
    d += ` C ${cx} ${y(pts[i - 1]).toFixed(1)}, ${cx} ${y(pts[i]).toFixed(1)}, ${x(i).toFixed(1)} ${y(pts[i]).toFixed(1)}`;
  }
  if (fill) {
    d += ` L ${x(pts.length - 1).toFixed(1)} ${(h - pad.bot + 4).toFixed(1)} L ${x(0).toFixed(1)} ${(h - pad.bot + 4).toFixed(1)} Z`;
  }
  return d;
}

// Portfolio value data per period
const CHART_DATA: Record<string, { pts: number[]; labels: string[]; gain: string; pct: string }> = {
  '1M': {
    pts: [124000, 126800, 125200, 127500, 128900, 130100],
    labels: ['Mar 1', '', '', '', '', 'Mar 29'],
    gain: '+EGP 6,100', pct: '+4.9%',
  },
  '3M': {
    pts: [118000, 120500, 119000, 122000, 125000, 127500, 130100],
    labels: ['Jan', '', 'Feb', '', 'Mar', '', ''],
    gain: '+EGP 12,100', pct: '+10.3%',
  },
  '6M': {
    pts: [108000, 112000, 115000, 118000, 121000, 124000, 127000, 130100],
    labels: ['Sep', '', 'Nov', '', 'Jan', '', 'Mar', ''],
    gain: '+EGP 22,100', pct: '+20.5%',
  },
  '1Y': {
    pts: [95000, 100000, 105000, 108000, 112000, 116000, 119000, 122000, 125000, 128000, 130100],
    labels: ['Mar\'25', '', '', 'Jun', '', 'Sep', '', '', 'Dec', '', 'Mar\'26'],
    gain: '+EGP 35,100', pct: '+37.0%',
  },
  'All': {
    pts: [50000, 65000, 72000, 80000, 88000, 95000, 100000, 108000, 115000, 122000, 130100],
    labels: ['2021', '', '2022', '', '2023', '', '2024', '', '2025', '', '2026'],
    gain: '+EGP 80,100', pct: '+160%',
  },
};

const PERF_TABS = ['1M', '3M', '6M', '1Y', 'All'];


export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const [mainTab, setMainTab] = useState<'performance' | 'health'>('performance');
  const [perfPeriod, setPerfPeriod] = useState('1Y');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  // 24px screen padding on each side + 16px card padding on each side = 80px total
  const chartW = SCREEN_W - 80;
  const C = useColors();
  const chartH = 160;
  const chart = CHART_DATA[perfPeriod];

  const healthScore = 78;
  const healthColor = healthScore >= 80 ? C.success : healthScore >= 60 ? C.warning : C.error;
  const healthLabel = healthScore >= 80 ? s.healthExcellent : healthScore >= 60 ? s.healthGood : s.healthFair;

  const allocationData = [
    { label: s.equity, value: 48, color: C.chart1 },
    { label: s.bonds, value: 22, color: C.chart4 },
    { label: s.gold, value: 15, color: C.chart2 },
    { label: s.cash, value: 10, color: C.chart5 },
    { label: s.realestate, value: 5, color: C.chart3 },
  ];

  return (
    <View style={[styles.screen, { paddingTop: topPad, backgroundColor: C.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: C.white, borderColor: C.borderLight }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h2" weight="bold" family="display">Insights</NuveText>
        <View style={{ width: 38 }} />
      </View>

      {/* Main tabs — pill toggle */}
      <View style={[styles.mainTabs, { backgroundColor: C.gray200 }]}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'performance' && { backgroundColor: C.white, borderWidth: 1, borderColor: C.borderLight }]}
          onPress={() => setMainTab('performance')}
        >
          <NuveText variant="bodySmall" weight="semibold" color={mainTab === 'performance' ? C.textPrimary : C.slate}>
            Performance
          </NuveText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'health' && { backgroundColor: C.white, borderWidth: 1, borderColor: C.borderLight }]}
          onPress={() => setMainTab('health')}
        >
          <NuveText variant="bodySmall" weight="semibold" color={mainTab === 'health' ? C.textPrimary : C.slate}>
            Health
          </NuveText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── PERFORMANCE TAB ─── */}
        {mainTab === 'performance' && (
          <>
            {/* Performance Chart Card */}
            <NuveCard style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <NuveText variant="caption" color={C.textMuted}>Portfolio Value</NuveText>
                <NuveText variant="h2" weight="bold" family="mono" style={{ marginTop: 4 }}>EGP 130,100</NuveText>
                <View style={styles.gainRow}>
                  <Feather name="trending-up" size={13} color={C.success} />
                  <NuveText variant="caption" weight="semibold" color={C.success}>
                    {chart.gain} ({chart.pct})
                  </NuveText>
                </View>
              </View>

              {/* Period selector */}
              <View style={styles.periodTabs}>
                {PERF_TABS.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.periodTab, { backgroundColor: C.borderLight }, perfPeriod === p && styles.periodTabActive]}
                    onPress={() => setPerfPeriod(p)}
                  >
                    <NuveText variant="caption" weight="semibold" color={perfPeriod === p ? '#FAFAF8' : C.textMuted}>
                      {p}
                    </NuveText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SVG Line Chart */}
              <View style={styles.chartContainer}>
                <Svg width={chartW} height={chartH}>
                  <Defs>
                    <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={C.teal} stopOpacity="0.18" />
                      <Stop offset="100%" stopColor={C.teal} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {/* Area fill */}
                  <Path d={smoothPath(chart.pts, chartW, chartH, true)} fill="url(#areaGrad)" />
                  {/* Line */}
                  <Path d={smoothPath(chart.pts, chartW, chartH, false)} fill="none" stroke={C.teal} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* End dot */}
                  <Circle
                    cx={(chartW - 8).toFixed(1)}
                    cy={(12 + (1 - (chart.pts[chart.pts.length - 1] - Math.min(...chart.pts)) / (Math.max(...chart.pts) - Math.min(...chart.pts) || 1)) * (chartH - 32)).toFixed(1)}
                    r="5"
                    fill={C.white}
                    stroke={C.teal}
                    strokeWidth="2.5"
                  />
                </Svg>
                {/* X labels */}
                <View style={styles.chartLabels}>
                  {[chart.labels[0], chart.labels[Math.floor(chart.labels.length / 2)], chart.labels[chart.labels.length - 1]].map((l, i) => (
                    <NuveText key={i} variant="caption" color={C.textMuted} style={{ fontSize: 10 }}>{l}</NuveText>
                  ))}
                </View>
              </View>
            </NuveCard>

            {/* What If Scenarios CTA */}
            <TouchableOpacity style={[styles.scenarioCta, { backgroundColor: C.gold + '12', borderColor: C.gold + '30' }]} onPress={() => router.push('/portfolio-scenario')} activeOpacity={0.85}>
              <View style={styles.scenarioCtaLeft}>
                <View style={[styles.scenarioCtaIcon, { backgroundColor: C.gold + '20' }]}>
                  <Feather name="sliders" size={18} color={C.gold} />
                </View>
                <View>
                  <NuveText variant="body" weight="semibold">What If Scenarios</NuveText>
                  <NuveText variant="caption" color={C.textMuted}>Simulate different market conditions</NuveText>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={C.gold} />
            </TouchableOpacity>

            {/* Allocation Card */}
            <NuveCard style={styles.card}>
              <View style={styles.allocHeader}>
                <NuveText variant="h3" weight="semibold" family="display">{s.allocation}</NuveText>
                <TouchableOpacity onPress={() => router.push('/allocation-breakdown')}>
                  <NuveText variant="caption" weight="semibold" color={C.teal} style={styles.incomeLinkText}>
                    Allocation breakdown
                  </NuveText>
                </TouchableOpacity>
              </View>
              <AllocationBars data={allocationData} />
            </NuveCard>
          </>
        )}

        {/* ─── HEALTH TAB ─── */}
        {mainTab === 'health' && (
          <>
            {/* Portfolio Health Score */}
            <NuveCard style={styles.card}>
              <NuveText variant="h3" weight="semibold" family="display" style={{ marginBottom: 16 }}>{s.portfolioHealth}</NuveText>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreCircle, { borderColor: healthColor }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <NuveText variant="h2" weight="bold" family="mono" color={healthColor}>{healthScore}</NuveText>
                    <NuveText variant="caption" color={C.textMuted} style={{ fontSize: 12 }}>/100</NuveText>
                  </View>
                </View>
                <View style={styles.scoreDetails}>
                  <NuveText variant="h3" weight="semibold" color={healthColor}>{healthLabel}</NuveText>
                  <NuveText variant="caption" color={C.textMuted} style={{ marginTop: 4, lineHeight: 18 }}>
                    Your portfolio is well-diversified with good risk-return balance.
                  </NuveText>
                </View>
              </View>

              <View style={styles.healthItems}>
                {[
                  { label: 'Diversification', score: 85, color: C.success },
                  { label: 'Goal Alignment', score: 72, color: C.warning },
                  { label: 'Risk-Return Balance', score: 80, color: C.success },
                  { label: 'Fee Efficiency', score: 90, color: C.success },
                  { label: 'Liquidity', score: 65, color: C.warning },
                ].map((item, i) => (
                  <View key={i} style={styles.healthItem}>
                    <View style={styles.healthItemLabel}>
                      <NuveText variant="bodySmall">{item.label}</NuveText>
                      <NuveText variant="bodySmall" weight="bold" family="mono" color={item.color}>{item.score}</NuveText>
                    </View>
                    <View style={[styles.healthBar, { backgroundColor: C.borderLight }]}>
                      <View style={[styles.healthBarFill, { width: `${item.score}%` as any, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </View>
            </NuveCard>

            {/* Inflation-Adjusted Returns */}
            <NuveCard style={styles.card}>
              <NuveText variant="h3" weight="semibold" family="display" style={{ marginBottom: 16 }}>{s.inflationAdjusted}</NuveText>
              <View style={styles.returnGrid}>
                {[
                  { label: s.nominalReturn, value: '+17.3%', color: C.success, icon: 'trending-up' },
                  { label: s.inflationRate, value: '-12.0%', color: C.error, icon: 'trending-down' },
                  { label: 'Real\nReturn', value: '+5.3%', color: C.info, icon: 'bar-chart' },
                ].map((item, i) => (
                  <View key={i} style={[styles.returnItem, { backgroundColor: C.background }]}>
                    <View style={[styles.returnIcon, { backgroundColor: item.color + '18' }]}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center' }}>{item.label}</NuveText>
                    <NuveText variant="bodySmall" weight="bold" family="mono" color={item.color} numberOfLines={1} adjustsFontSizeToFit>{item.value}</NuveText>
                  </View>
                ))}
              </View>
              <NuveText variant="caption" color={C.textMuted} style={{ marginTop: 8 }}>
                Based on CAPMAS CPI rate of 12.0% (March 2026)
              </NuveText>
            </NuveCard>

            {/* Currency Exposure */}
            <NuveCard style={styles.card}>
              <NuveText variant="h3" weight="semibold" family="display" style={{ marginBottom: 16 }}>{s.currencyExposure}</NuveText>
              <AllocationBars data={[
                { label: 'EGP', value: 82, color: Colors.midnight },
                { label: 'USD', value: 12, color: C.gold },
                { label: 'EUR', value: 6, color: C.info },
              ]} />
              <NuveText variant="caption" color={C.textMuted} style={{ marginTop: 12 }}>
                82% of holdings in Egyptian Pound · 18% in foreign currency
              </NuveText>
            </NuveCard>
          </>
        )}
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
  mainTabs: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  mainTabActive: {},
  content: { paddingHorizontal: 24 },
  chartCard: { marginBottom: 16, padding: 16, gap: 12 },
  chartHeader: {
    gap: 2,
  },
  gainRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  periodTabs: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-start',
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: Colors.midnight,
  },
  chartContainer: { gap: 4, overflow: 'hidden' },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  scenarioCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  scenarioCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scenarioCtaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { marginBottom: 16 },
  allocHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  incomeLinkText: {
    textDecorationLine: 'underline',
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  scoreCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scoreDetails: { flex: 1 },
  healthItems: { gap: 12 },
  healthItem: { gap: 6 },
  healthItemLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  healthBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: { height: 6, borderRadius: 3 },
  returnGrid: { flexDirection: 'row', gap: 10 },
  returnItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    padding: 12,
  },
  returnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
