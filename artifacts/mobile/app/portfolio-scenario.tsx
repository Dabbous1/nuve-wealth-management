import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform,
  Modal, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';

// ── Constants ──────────────────────────────────────────────────
const PORTFOLIO_VALUE = 130_100;
const PORTFOLIO_RETURN = 12.4;     // current annualised % (display only)

type MarketScenario = 'bull' | 'neutral' | 'bear';

// ── Sub-components ─────────────────────────────────────────────
function ParamSlider({
  label, sub, displayValue, minLabel, maxLabel,
  value, min, max, step, onChange,
}: {
  label: string; sub: string; displayValue: string;
  minLabel: string; maxLabel: string;
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  const C = useColors();
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <View style={{ flex: 1 }}>
          <NuveText variant="bodySmall" weight="semibold">{label}</NuveText>
          <NuveText variant="caption" color={C.textMuted}>{sub}</NuveText>
        </View>
        <View style={[styles.sliderValueBadge, { borderColor: C.teal + '30', backgroundColor: C.teal + '12' }]}>
          <NuveText variant="bodySmall" weight="bold" family="mono" color={C.teal}>{displayValue}</NuveText>
        </View>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={C.teal}
        maximumTrackTintColor={C.borderLight}
        thumbTintColor={C.teal}
        onValueChange={onChange}
      />
      <View style={styles.sliderLabels}>
        <NuveText variant="caption" color={C.textMuted}>{minLabel}</NuveText>
        <NuveText variant="caption" color={C.textMuted}>{maxLabel}</NuveText>
      </View>
    </View>
  );
}

function AllocationMiniBar({ allocation }: { allocation: { label: string; pct: number; color: string; expectedReturn: number }[] }) {
  return (
    <View style={styles.allocBar}>
      {allocation.map((a) => (
        <View key={a.label} style={[styles.allocSegment, { flex: a.pct, backgroundColor: a.color }]} />
      ))}
    </View>
  );
}

function ScenarioPill({
  item, selected, onPress,
}: { item: { key: string; label: string; delta: number; color: string; icon: string }; selected: boolean; onPress: () => void }) {
  const C = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.scenarioPill,
        { backgroundColor: C.white, borderColor: C.borderLight },
        selected && { backgroundColor: item.color, borderColor: item.color },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Feather name={item.icon as any} size={13} color={selected ? '#FAFAF8' : item.color} />
      <NuveText
        variant="caption"
        weight="bold"
        color={selected ? '#FAFAF8' : item.color}
      >
        {item.label}
      </NuveText>
    </TouchableOpacity>
  );
}

// ── Main Screen ────────────────────────────────────────────────
export default function PortfolioScenarioScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const isWeb  = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  const ALLOCATION = [
    { label: 'Equity',      pct: 45, color: '#5B9BD5',     expectedReturn: 15 },
    { label: 'Bonds',       pct: 30, color: C.info,        expectedReturn: 11 },
    { label: 'Gold',        pct: 15, color: C.gold,        expectedReturn:  8 },
    { label: 'Cash',        pct:  5, color: C.success,     expectedReturn:  5 },
    { label: 'Real Estate', pct:  5, color: '#8E44AD',     expectedReturn: 12 },
  ];
  const AUTO_RETURN = parseFloat(
    ALLOCATION.reduce((s, a) => s + (a.pct / 100) * a.expectedReturn, 0).toFixed(2)
  );

  const SCENARIOS: { key: MarketScenario; label: string; delta: number; color: string; icon: string }[] = [
    { key: 'bear',    label: 'Bear',    delta: -5,  color: C.error,          icon: 'trending-down' },
    { key: 'neutral', label: 'Neutral', delta:  0,  color: C.textSecondary,  icon: 'minus'   },
    { key: 'bull',    label: 'Bull',    delta: +5,  color: C.success,        icon: 'trending-up'  },
  ];

  const [monthlyTopUp, setMonthlyTopUp] = useState(2_000);
  const [inflationPct, setInflationPct] = useState(6);
  const [horizon,      setHorizon]      = useState(10);
  const [market,       setMarket]       = useState<MarketScenario>('neutral');
  const [showParams,   setShowParams]   = useState(false);

  const reset = () => {
    setMonthlyTopUp(2_000);
    setInflationPct(6);
    setHorizon(10);
    setMarket('neutral');
  };

  const project = (annualReturn: number) => {
    const r = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    const n = horizon * 12;
    const nominal = r > 0
      ? PORTFOLIO_VALUE * Math.pow(1 + r, n) + monthlyTopUp * (Math.pow(1 + r, n) - 1) / r
      : PORTFOLIO_VALUE + monthlyTopUp * n;
    const real    = nominal / Math.pow(1 + inflationPct / 100, horizon);
    const totalIn = PORTFOLIO_VALUE + monthlyTopUp * n;
    const gain    = nominal - totalIn;
    const gainPct = (gain / totalIn) * 100;
    return { nominal, real, totalIn, gain, gainPct };
  };

  const marketDelta = SCENARIOS.find(s => s.key === market)!.delta;

  const outcome = useMemo(() => project(AUTO_RETURN + marketDelta), [inflationPct, horizon, monthlyTopUp, market]);
  const bull     = useMemo(() => project(AUTO_RETURN + 5),  [inflationPct, horizon, monthlyTopUp]);
  const bear     = useMemo(() => project(AUTO_RETURN - 5),  [inflationPct, horizon, monthlyTopUp]);

  const growthMultiple = (outcome.nominal / PORTFOLIO_VALUE).toFixed(2);

  return (
    <View style={[styles.screen, { backgroundColor: C.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.white }]}>
          <Feather name="arrow-left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">Portfolio Scenarios</NuveText>
        <TouchableOpacity onPress={reset} style={[styles.resetBtn, { backgroundColor: C.white }]}>
          <Feather name="refresh-ccw" size={16} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Portfolio snapshot */}
        <View style={styles.snapshotBanner}>
          {/* Top row: label + value + return badge */}
          <View style={styles.snapshotTop}>
            <View style={{ flex: 1 }}>
              <NuveText variant="caption" color={'#FAFAF8' + '80'}>Current Portfolio</NuveText>
              <NuveText variant="h1" weight="bold" color={'#FAFAF8'}>
                EGP {PORTFOLIO_VALUE.toLocaleString('en-EG')}
              </NuveText>
            </View>
            <View style={styles.snapshotReturnBadge}>
              <Feather name="trending-up" size={12} color={C.gold} />
              <NuveText variant="caption" weight="bold" color={C.gold}>
                {PORTFOLIO_RETURN}% p.a.
              </NuveText>
            </View>
          </View>

          {/* Bottom: full-width allocation bar + legend */}
          <View style={styles.snapshotAllocSection}>
            <NuveText variant="caption" color={'#FAFAF8' + '70'}>Allocation</NuveText>
            <AllocationMiniBar allocation={ALLOCATION} />
            <View style={styles.allocLegend}>
              {ALLOCATION.map(a => (
                <View key={a.label} style={styles.allocLegendItem}>
                  <View style={[styles.allocDot, { backgroundColor: a.color }]} />
                  <NuveText variant="caption" color={'#FAFAF8' + '80'} style={{ fontSize: 10 }}>
                    {a.label} {a.pct}%
                  </NuveText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Projected Outcome */}
        <NuveCard style={styles.outcomeCard}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 14 }}>Projected Outcome</NuveText>

          {/* Main projected value */}
          <View style={styles.projMain}>
            <View style={{ flex: 1 }}>
              <NuveText variant="caption" color={C.textMuted}>Projected Value (Nominal)</NuveText>
              <NuveText variant="h2" weight="bold" family="mono" color={C.teal} numberOfLines={1} adjustsFontSizeToFit>
                EGP {Math.round(outcome.nominal).toLocaleString('en-EG')}
              </NuveText>
              <NuveText variant="caption" color={C.textMuted}>
                in {horizon} year{horizon !== 1 ? 's' : ''}
              </NuveText>
              <NuveText variant="caption" color={C.textMuted} style={{ marginTop: 2 }}>
                at <NuveText weight="semibold" color={C.teal}>{AUTO_RETURN + marketDelta}% p.a.</NuveText> expected return
              </NuveText>
            </View>
            <View style={[styles.multipleBadge, { backgroundColor: C.teal + '15' }]}>
              <NuveText variant="caption" color={C.textMuted}>Growth</NuveText>
              <NuveText variant="h2" weight="bold" family="mono" color={C.teal}>{growthMultiple}x</NuveText>
            </View>
          </View>

          {/* Gain row */}
          <View style={styles.gainRow}>
            <View style={[styles.gainBlock, { backgroundColor: C.gray50, borderColor: C.borderLight }]}>
              <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center' }}>Total Invested</NuveText>
              <NuveText variant="bodySmall" weight="bold" style={{ textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>
                EGP {Math.round(outcome.totalIn).toLocaleString('en-EG')}
              </NuveText>
            </View>
            <View style={[styles.gainBlock, { backgroundColor: C.gray50, borderColor: C.borderLight }]}>
              <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center' }}>Investment Gain</NuveText>
              <NuveText variant="bodySmall" weight="bold" color={outcome.gain >= 0 ? C.success : C.error} style={{ textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>
                +EGP {Math.round(outcome.gain).toLocaleString('en-EG')} ({outcome.gainPct.toFixed(1)}%)
              </NuveText>
            </View>
          </View>

          {/* Real value */}
          <View style={[styles.realCard, { borderColor: C.gold + '30', backgroundColor: C.gold + '08' }]}>
            <View style={styles.realCardHeader}>
              <Feather name="info" size={14} color={C.gold} />
              <NuveText variant="caption" weight="semibold" color={C.textSecondary}>
                Inflation-Adjusted Real Value
              </NuveText>
            </View>
            <NuveText variant="h3" weight="bold" family="mono" color={C.textPrimary}>
              EGP {Math.round(outcome.real).toLocaleString('en-EG')}
            </NuveText>
            <NuveText variant="caption" color={C.textMuted}>
              Purchasing power after {horizon} years of inflation at {inflationPct}%
            </NuveText>
          </View>

          {/* Bull / Bear range */}
          <View style={[styles.rangeCard, { borderColor: C.borderLight }]}>
            <NuveText variant="caption" weight="semibold" color={C.textSecondary} style={{ marginBottom: 10 }}>
              Outcome Range (+/-5% return)
            </NuveText>
            <View style={styles.rangeRow}>
              <View style={[styles.rangeBlock, { borderColor: C.error + '30', backgroundColor: C.error + '08' }]}>
                <Feather name="trending-down" size={14} color={C.error} />
                <NuveText variant="caption" color={C.error} weight="semibold">Bear</NuveText>
                <NuveText variant="bodySmall" weight="bold" color={C.error}>
                  EGP {Math.round(bear.nominal).toLocaleString('en-EG')}
                </NuveText>
              </View>
              <View style={[styles.rangeBlock, { borderColor: C.success + '30', backgroundColor: C.success + '08' }]}>
                <Feather name="trending-up" size={14} color={C.success} />
                <NuveText variant="caption" color={C.success} weight="semibold">Bull</NuveText>
                <NuveText variant="bodySmall" weight="bold" color={C.success}>
                  EGP {Math.round(bull.nominal).toLocaleString('en-EG')}
                </NuveText>
              </View>
            </View>
          </View>

          {/* Adjust Parameters CTA */}
          <TouchableOpacity
            style={[styles.adjustCta, { backgroundColor: C.teal }]}
            onPress={() => setShowParams(true)}
            activeOpacity={0.8}
          >
            <Feather name="sliders" size={16} color={Colors.midnight} />
            <NuveText variant="bodySmall" weight="bold" color={Colors.midnight}>
              Adjust Parameters
            </NuveText>
            <Feather name="chevron-up" size={16} color={Colors.midnight} />
          </TouchableOpacity>
        </NuveCard>

        {/* Market Scenario selector */}
        <NuveCard style={styles.marketCard}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 4 }}>Market Scenario</NuveText>
          <NuveText variant="caption" color={C.textMuted} style={{ marginBottom: 14 }}>
            Applies a +/-5% return adjustment on top of your expected return.
          </NuveText>
          <View style={styles.scenarioPills}>
            {SCENARIOS.map(s => (
              <ScenarioPill
                key={s.key}
                item={s}
                selected={market === s.key}
                onPress={() => setMarket(s.key)}
              />
            ))}
          </View>
        </NuveCard>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Feather name="info" size={13} color={C.textMuted} />
          <NuveText variant="caption" color={C.textMuted} style={{ flex: 1, lineHeight: 17 }}>
            {' '}Projections are illustrative only and do not guarantee future returns. Past performance is not indicative of future results. FRA License #897.
          </NuveText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Adjust Parameters bottom sheet ── */}
      <Modal
        visible={showParams}
        transparent
        animationType="slide"
        onRequestClose={() => setShowParams(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setShowParams(false)} />
        <View style={[styles.sheet, { backgroundColor: C.white, paddingBottom: insets.bottom + 20 }]}>
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: C.gray200 }]} />

          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <NuveText variant="h3" weight="semibold">Adjust Parameters</NuveText>
            <TouchableOpacity onPress={() => setShowParams(false)} style={[styles.sheetClose, { backgroundColor: C.borderLight }]}>
              <Feather name="x" size={18} color={C.textPrimary} />
            </TouchableOpacity>
          </View>
          <NuveText variant="caption" color={C.textMuted} style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            Drag the sliders — the Projected Outcome updates live.
          </NuveText>

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <ParamSlider
              label="Monthly Top-Up"
              sub="Extra invested each month"
              displayValue={`EGP ${monthlyTopUp.toLocaleString('en-EG')}`}
              minLabel="EGP 0"
              maxLabel="EGP 50,000"
              value={monthlyTopUp}
              min={0}
              max={50_000}
              step={500}
              onChange={setMonthlyTopUp}
            />
            <View style={[styles.divider, { backgroundColor: C.borderLight }]} />

            <ParamSlider
              label="Inflation Rate"
              sub="Annual purchasing-power erosion"
              displayValue={`${inflationPct.toFixed(1)}%`}
              minLabel="1%"
              maxLabel="25%"
              value={inflationPct}
              min={1}
              max={25}
              step={0.5}
              onChange={v => setInflationPct(parseFloat(v.toFixed(1)))}
            />
            <View style={[styles.divider, { backgroundColor: C.borderLight }]} />

            <ParamSlider
              label="Time Horizon"
              sub="Years to project forward"
              displayValue={`${horizon} yr${horizon !== 1 ? 's' : ''}`}
              minLabel="1 yr"
              maxLabel="30 yrs"
              value={horizon}
              min={1}
              max={30}
              step={1}
              onChange={v => setHorizon(Math.round(v))}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.sheetDoneBtn, { backgroundColor: C.teal }]}
            onPress={() => setShowParams(false)}
            activeOpacity={0.85}
          >
            <NuveText variant="body" weight="bold" color={Colors.midnight}>Done</NuveText>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  resetBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  content: { paddingHorizontal: 20, paddingTop: 4 },

  // Snapshot banner
  snapshotBanner: {
    backgroundColor: Colors.midnight, borderRadius: 20, padding: 20,
    flexDirection: 'column', gap: 16,
    marginBottom: 16,
  },
  snapshotTop: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  snapshotReturnBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FAFAF8' + '18', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  snapshotAllocSection: { gap: 8 },
  allocBar: {
    flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden',
  },
  allocSegment: { height: 10 },
  allocLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  allocLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  allocDot: { width: 7, height: 7, borderRadius: 4 },

  // Market scenario
  marketCard: { marginBottom: 16 },
  scenarioPills: { flexDirection: 'row', gap: 10 },
  scenarioPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5,
  },

  // Outcome card
  outcomeCard: { marginBottom: 16 },
  projMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  multipleBadge: {
    borderRadius: 14, padding: 12, alignItems: 'center', justifyContent: 'center', minWidth: 72,
  },
  gainRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14,
  },
  gainBlock: {
    flex: 1, gap: 2,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  realCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  realCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  rangeCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 14,
  },
  rangeRow: { flexDirection: 'row', gap: 10 },
  rangeBlock: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center', gap: 4,
  },

  // Outcome CTA
  adjustCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12,
    paddingVertical: 13, marginTop: 16,
  },

  // Bottom sheet
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 4,
  },
  sheetClose: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  sheetDoneBtn: {
    marginHorizontal: 20, marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },

  // Sliders
  divider: { height: 1, marginVertical: 2 },
  sliderBlock: { paddingVertical: 10 },
  sliderHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  sliderValueBadge: {
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 4,
    minWidth: 80, alignItems: 'center',
  },
  slider: { width: '100%', height: 36 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },

  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4,
  },
});
