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

const DIVIDENDS = [
  { asset: 'Acumen Income Fund', amount: 2840, date: 'Mar 2026', yield: 4.2 },
  { asset: 'Eastern Tobacco', amount: 1200, date: 'Feb 2026', yield: 3.8 },
  { asset: 'CIB Dividends', amount: 960, date: 'Jan 2026', yield: 2.9 },
];

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const [mainTab, setMainTab] = useState<'performance' | 'health'>('performance');
  const [perfPeriod, setPerfPeriod] = useState('1Y');
  const [showIncome, setShowIncome] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  const chartW = SCREEN_W - 48;
  const chartH = 140;
  const chart = CHART_DATA[perfPeriod];

  const healthScore = 78;
  const healthColor = healthScore >= 80 ? Colors.success : healthScore >= 60 ? Colors.warning : Colors.error;
  const healthLabel = healthScore >= 80 ? s.healthExcellent : healthScore >= 60 ? s.healthGood : s.healthFair;

  const allocationData = [
    { label: s.equity, value: 48, color: Colors.chart1 },
    { label: s.bonds, value: 22, color: Colors.chart4 },
    { label: s.gold, value: 15, color: Colors.chart2 },
    { label: s.cash, value: 10, color: Colors.chart5 },
    { label: s.realestate, value: 5, color: Colors.chart3 },
  ];

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h2" weight="bold" family="display">Insights</NuveText>
        <View style={{ width: 38 }} />
      </View>

      {/* Main tabs */}
      <View style={styles.mainTabs}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'performance' && styles.mainTabActive]}
          onPress={() => setMainTab('performance')}
        >
          <NuveText variant="bodySmall" weight="semibold" color={mainTab === 'performance' ? Colors.white : Colors.textSecondary}>
            Portfolio Performance
          </NuveText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'health' && styles.mainTabActive]}
          onPress={() => setMainTab('health')}
        >
          <NuveText variant="bodySmall" weight="semibold" color={mainTab === 'health' ? Colors.white : Colors.textSecondary}>
            Portfolio Health
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
                <View>
                  <NuveText variant="caption" color={Colors.textMuted}>Portfolio Value</NuveText>
                  <NuveText variant="h1" weight="bold" family="mono">EGP 130,100</NuveText>
                  <View style={styles.gainRow}>
                    <Feather name="trending-up" size={13} color={Colors.success} />
                    <NuveText variant="caption" weight="semibold" color={Colors.success}>
                      {chart.gain} ({chart.pct})
                    </NuveText>
                  </View>
                </View>
                <View style={styles.periodTabs}>
                  {PERF_TABS.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.periodTab, perfPeriod === p && styles.periodTabActive]}
                      onPress={() => setPerfPeriod(p)}
                    >
                      <NuveText variant="caption" weight="semibold" color={perfPeriod === p ? Colors.white : Colors.textMuted}>
                        {p}
                      </NuveText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SVG Line Chart */}
              <View style={styles.chartContainer}>
                <Svg width={chartW} height={chartH}>
                  <Defs>
                    <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={Colors.teal} stopOpacity="0.18" />
                      <Stop offset="100%" stopColor={Colors.teal} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {/* Area fill */}
                  <Path d={smoothPath(chart.pts, chartW, chartH, true)} fill="url(#areaGrad)" />
                  {/* Line */}
                  <Path d={smoothPath(chart.pts, chartW, chartH, false)} fill="none" stroke={Colors.teal} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* End dot */}
                  <Circle
                    cx={(chartW - 8).toFixed(1)}
                    cy={(12 + (1 - (chart.pts[chart.pts.length - 1] - Math.min(...chart.pts)) / (Math.max(...chart.pts) - Math.min(...chart.pts) || 1)) * (chartH - 32)).toFixed(1)}
                    r="5"
                    fill={Colors.white}
                    stroke={Colors.teal}
                    strokeWidth="2.5"
                  />
                </Svg>
                {/* X labels */}
                <View style={styles.chartLabels}>
                  {[chart.labels[0], chart.labels[Math.floor(chart.labels.length / 2)], chart.labels[chart.labels.length - 1]].map((l, i) => (
                    <NuveText key={i} variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>{l}</NuveText>
                  ))}
                </View>
              </View>
            </NuveCard>

            {/* What If Scenarios CTA */}
            <TouchableOpacity style={styles.scenarioCta} onPress={() => router.push('/portfolio-scenario')} activeOpacity={0.85}>
              <View style={styles.scenarioCtaLeft}>
                <View style={styles.scenarioCtaIcon}>
                  <Feather name="sliders" size={18} color={Colors.gold} />
                </View>
                <View>
                  <NuveText variant="body" weight="semibold">What If Scenarios</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>Simulate different market conditions</NuveText>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.gold} />
            </TouchableOpacity>

            {/* Allocation Card */}
            <NuveCard style={styles.card}>
              <View style={styles.allocHeader}>
                <NuveText variant="h3" weight="semibold" family="display">{s.allocation}</NuveText>
                <TouchableOpacity onPress={() => setShowIncome(!showIncome)}>
                  <NuveText variant="caption" weight="semibold" color={Colors.teal} style={styles.incomeLinkText}>
                    {showIncome ? 'Hide income' : 'Income breakdown'}
                  </NuveText>
                </TouchableOpacity>
              </View>
              <AllocationBars data={allocationData} />

              {/* Income breakdown panel */}
              {showIncome && (
                <View style={styles.incomePanel}>
                  <View style={styles.incomePanelHeader}>
                    <Feather name="dollar-sign" size={14} color={Colors.gold} />
                    <NuveText variant="bodySmall" weight="semibold">Income Breakdown</NuveText>
                  </View>
                  {DIVIDENDS.map((d, i) => (
                    <View key={i} style={styles.incomeRow}>
                      <View style={{ flex: 1 }}>
                        <NuveText variant="bodySmall" weight="medium">{d.asset}</NuveText>
                        <NuveText variant="caption" color={Colors.textMuted}>{d.date} · {d.yield}% yield</NuveText>
                      </View>
                      <NuveText variant="bodySmall" weight="semibold" family="mono" color={Colors.success}>
                        +EGP {d.amount.toLocaleString()}
                      </NuveText>
                    </View>
                  ))}
                  <View style={styles.incomeTotalRow}>
                    <NuveText variant="bodySmall" weight="semibold">Total Income</NuveText>
                    <NuveText variant="bodySmall" weight="bold" family="mono" color={Colors.success}>
                      +EGP {DIVIDENDS.reduce((s, d) => s + d.amount, 0).toLocaleString()}
                    </NuveText>
                  </View>
                </View>
              )}
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
                  <NuveText variant="display" weight="bold" family="mono" color={healthColor}>{healthScore}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>/100</NuveText>
                </View>
                <View style={styles.scoreDetails}>
                  <NuveText variant="h3" weight="semibold" color={healthColor}>{healthLabel}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted} style={{ marginTop: 4, lineHeight: 18 }}>
                    Your portfolio is well-diversified with good risk-return balance.
                  </NuveText>
                </View>
              </View>

              <View style={styles.healthItems}>
                {[
                  { label: 'Diversification', score: 85, color: Colors.success },
                  { label: 'Goal Alignment', score: 72, color: Colors.warning },
                  { label: 'Risk-Return Balance', score: 80, color: Colors.success },
                  { label: 'Fee Efficiency', score: 90, color: Colors.success },
                  { label: 'Liquidity', score: 65, color: Colors.warning },
                ].map((item, i) => (
                  <View key={i} style={styles.healthItem}>
                    <View style={styles.healthItemLabel}>
                      <NuveText variant="bodySmall">{item.label}</NuveText>
                      <NuveText variant="bodySmall" weight="bold" family="mono" color={item.color}>{item.score}</NuveText>
                    </View>
                    <View style={styles.healthBar}>
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
                  { label: s.nominalReturn, value: '+17.3%', color: Colors.success, icon: 'trending-up' },
                  { label: s.inflationRate, value: '-12.0%', color: Colors.error, icon: 'trending-down' },
                  { label: s.realReturn, value: '+5.3%', color: Colors.info, icon: 'bar-chart' },
                ].map((item, i) => (
                  <View key={i} style={styles.returnItem}>
                    <View style={[styles.returnIcon, { backgroundColor: item.color + '18' }]}>
                      <Feather name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <NuveText variant="caption" color={Colors.textMuted}>{item.label}</NuveText>
                    <NuveText variant="h3" weight="bold" family="mono" color={item.color}>{item.value}</NuveText>
                  </View>
                ))}
              </View>
              <NuveText variant="caption" color={Colors.textMuted} style={{ marginTop: 8 }}>
                Based on CAPMAS CPI rate of 12.0% (March 2026)
              </NuveText>
            </NuveCard>

            {/* Currency Exposure */}
            <NuveCard style={styles.card}>
              <NuveText variant="h3" weight="semibold" family="display" style={{ marginBottom: 16 }}>{s.currencyExposure}</NuveText>
              <AllocationBars data={[
                { label: 'EGP', value: 82, color: Colors.midnight },
                { label: 'USD', value: 12, color: Colors.gold },
                { label: 'EUR', value: 6, color: Colors.info },
              ]} />
              <NuveText variant="caption" color={Colors.textMuted} style={{ marginTop: 12 }}>
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
  screen: { flex: 1, backgroundColor: Colors.background },
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mainTabs: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 4,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  mainTabActive: {
    backgroundColor: Colors.midnight,
    shadowColor: Colors.midnight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { paddingHorizontal: 24 },
  chartCard: { marginBottom: 16, padding: 16, gap: 0 },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gainRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  periodTabs: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
  periodTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  periodTabActive: {
    backgroundColor: Colors.midnight,
  },
  chartContainer: { gap: 4 },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  scenarioCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gold + '12',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  scenarioCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scenarioCtaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { marginBottom: 16 },
  allocHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  incomeLinkText: {
    textDecorationLine: 'underline',
  },
  incomePanel: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 16,
    gap: 0,
  },
  incomePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  incomeTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
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
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  healthBarFill: { height: 6, borderRadius: 3 },
  returnGrid: { flexDirection: 'row', gap: 10 },
  returnItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
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
