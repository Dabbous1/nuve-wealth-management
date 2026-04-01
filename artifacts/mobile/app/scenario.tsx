import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';

const GOAL_ICONS: Record<string, string> = {
  home: 'home', education: 'book', hajj: 'compass',
  retirement: 'umbrella', emergency: 'shield', custom: 'star',
};
const GOAL_COLORS: Record<string, string> = {
  home: Colors.primary, education: Colors.info, hajj: Colors.success,
  retirement: Colors.gold, emergency: Colors.error, custom: '#8E44AD',
};

function ParamSlider({
  label, sub, displayValue, minLabel, maxLabel,
  value, min, max, step, color, onChange,
}: {
  label: string; sub: string; displayValue: string;
  minLabel: string; maxLabel: string;
  value: number; min: number; max: number; step: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <View style={{ flex: 1 }}>
          <NuveText variant="bodySmall" weight="semibold">{label}</NuveText>
          <NuveText variant="caption" color={Colors.textMuted}>{sub}</NuveText>
        </View>
        <View style={[styles.sliderValueBadge, { backgroundColor: color + '18', borderColor: color + '30' }]}>
          <NuveText variant="bodySmall" weight="bold" color={color}>{displayValue}</NuveText>
        </View>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={color}
        maximumTrackTintColor={Colors.gray100}
        thumbTintColor={color}
        onValueChange={onChange}
      />
      <View style={styles.sliderLabels}>
        <NuveText variant="caption" color={Colors.textMuted}>{minLabel}</NuveText>
        <NuveText variant="caption" color={Colors.textMuted}>{maxLabel}</NuveText>
      </View>
    </View>
  );
}

export default function ScenarioScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const insets = useSafeAreaInsets();
  const { goals, language } = useApp();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;

  const goal = goals.find(g => g.id === goalId);
  const color = goal ? GOAL_COLORS[goal.type] : Colors.primary;
  const icon  = goal ? GOAL_ICONS[goal.type]  : 'sliders';
  const name  = goal ? (language === 'ar' ? goal.nameAr : goal.name) : 'Scenario';
  const yearsLeft = goal
    ? Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000)))
    : 10;

  const [monthly, setMonthly] = useState(goal?.monthlyContribution ?? 5000);
  const [returnPct, setReturnPct] = useState(8);
  const [inflationPct, setInflationPct] = useState(6);
  const [years, setYears] = useState(yearsLeft);

  const reset = () => {
    setMonthly(goal?.monthlyContribution ?? 5000);
    setReturnPct(8);
    setInflationPct(6);
    setYears(yearsLeft);
  };

  const projection = useMemo(() => {
    const start  = goal?.currentAmount ?? 0;
    const target = goal?.targetAmount  ?? 1_000_000;
    const n      = years * 12;
    const r      = Math.pow(1 + returnPct / 100, 1 / 12) - 1;
    const nominal = r > 0
      ? start * Math.pow(1 + r, n) + monthly * (Math.pow(1 + r, n) - 1) / r
      : start + monthly * n;
    const real = nominal / Math.pow(1 + inflationPct / 100, years);
    const nominalPct = Math.min((nominal / target) * 100, 999);
    const shortfall  = Math.max(target - nominal, 0);
    const surplus    = Math.max(nominal - target, 0);
    const reached    = nominal >= target;
    return { nominal, real, nominalPct, shortfall, surplus, reached, target };
  }, [goal, monthly, returnPct, inflationPct, years]);

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">Scenario Modeling</NuveText>
        <TouchableOpacity onPress={reset} style={styles.resetBtn}>
          <Feather name="refresh-ccw" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Goal context */}
        {goal && (
          <View style={[styles.goalBanner, { backgroundColor: color }]}>
            <View style={[styles.goalIconWrap, { backgroundColor: Colors.white + '25' }]}>
              <Feather name={icon as any} size={20} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="caption" color={Colors.white + '80'}>Modeling for</NuveText>
              <NuveText variant="body" weight="bold" color={Colors.white}>{name}</NuveText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <NuveText variant="caption" color={Colors.white + '80'}>Progress</NuveText>
              <NuveText variant="bodySmall" weight="bold" color={Colors.white}>
                {goal.progressPct.toFixed(1)}%
              </NuveText>
            </View>
          </View>
        )}

        {/* Projected Outcome */}
        <NuveCard style={styles.outcomeCard}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 16 }}>Projected Outcome</NuveText>

          {/* Status pill */}
          <View style={[
            styles.statusPill,
            { backgroundColor: projection.reached ? Colors.success + '18' : Colors.error + '18' },
          ]}>
            <Feather
              name={projection.reached ? 'check-circle' : 'x-circle'}
              size={16}
              color={projection.reached ? Colors.success : Colors.error}
            />
            <NuveText
              variant="bodySmall"
              weight="bold"
              color={projection.reached ? Colors.success : Colors.error}
            >
              {projection.reached ? 'Goal Reached' : 'Goal Not Reached'}
            </NuveText>
          </View>

          {/* Nominal vs real */}
          <View style={styles.projAmounts}>
            <View style={styles.projAmountBlock}>
              <NuveText variant="caption" color={Colors.textMuted}>Projected Value</NuveText>
              <NuveText variant="caption" weight="semibold" color={Colors.textMuted}>(Nominal)</NuveText>
              <NuveText variant="h2" weight="bold" color={color}>
                EGP {Math.round(projection.nominal).toLocaleString('en-EG')}
              </NuveText>
            </View>
            <View style={styles.projDivider} />
            <View style={styles.projAmountBlock}>
              <NuveText variant="caption" color={Colors.textMuted}>Real Value</NuveText>
              <NuveText variant="caption" weight="semibold" color={Colors.textMuted}>(Inflation-adjusted)</NuveText>
              <NuveText variant="h2" weight="bold" color={Colors.textSecondary}>
                EGP {Math.round(projection.real).toLocaleString('en-EG')}
              </NuveText>
            </View>
          </View>

          {/* Progress toward target */}
          <View style={styles.targetRow}>
            <NuveText variant="caption" color={Colors.textMuted}>
              Goal target: EGP {projection.target.toLocaleString('en-EG')}
            </NuveText>
            <NuveText variant="caption" weight="bold" color={color}>
              {Math.min(projection.nominalPct, 100).toFixed(1)}%
            </NuveText>
          </View>
          <View style={styles.progressTrack}>
            <View style={[
              styles.progressFill,
              {
                width: `${Math.min(projection.nominalPct, 100)}%` as any,
                backgroundColor: projection.reached ? Colors.success : color,
              },
            ]} />
          </View>

          {/* Surplus / Shortfall */}
          {projection.reached ? (
            <View style={styles.surplusRow}>
              <Feather name="trending-up" size={14} color={Colors.success} />
              <NuveText variant="caption" color={Colors.textSecondary}>
                Surplus of{' '}
                <NuveText weight="bold" color={Colors.success}>
                  EGP {Math.round(projection.surplus).toLocaleString('en-EG')}
                </NuveText>
                {' '}above your target.
              </NuveText>
            </View>
          ) : (
            <View style={styles.surplusRow}>
              <Feather name="alert-triangle" size={14} color={Colors.warning} />
              <NuveText variant="caption" color={Colors.textSecondary}>
                Shortfall of{' '}
                <NuveText weight="bold" color={Colors.error}>
                  EGP {Math.round(projection.shortfall).toLocaleString('en-EG')}
                </NuveText>
                {' '}— try increasing contributions or timeline.
              </NuveText>
            </View>
          )}
        </NuveCard>

        {/* Controls */}
        <NuveCard style={styles.controlsCard}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 4 }}>Adjust Parameters</NuveText>
          <NuveText variant="caption" color={Colors.textMuted} style={{ marginBottom: 8 }}>
            Drag the sliders below and watch the outcome update.
          </NuveText>

          <ParamSlider
            label="Monthly Contribution"
            sub="Amount added each month"
            displayValue={`EGP ${monthly.toLocaleString('en-EG')}`}
            minLabel="EGP 500"
            maxLabel="EGP 100,000"
            value={monthly}
            min={500}
            max={100_000}
            step={500}
            color={color}
            onChange={setMonthly}
          />
          <View style={styles.divider} />

          <ParamSlider
            label="Expected Annual Return"
            sub="Average yearly growth rate"
            displayValue={`${returnPct.toFixed(1)}%`}
            minLabel="1%"
            maxLabel="30%"
            value={returnPct}
            min={1}
            max={30}
            step={0.5}
            color={color}
            onChange={v => setReturnPct(parseFloat(v.toFixed(1)))}
          />
          <View style={styles.divider} />

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
            color={color}
            onChange={v => setInflationPct(parseFloat(v.toFixed(1)))}
          />
          <View style={styles.divider} />

          <ParamSlider
            label="Timeline"
            sub="Years to achieve the goal"
            displayValue={`${years} yr${years !== 1 ? 's' : ''}`}
            minLabel="1 yr"
            maxLabel="40 yrs"
            value={years}
            min={1}
            max={40}
            step={1}
            color={color}
            onChange={v => setYears(Math.round(v))}
          />
        </NuveCard>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Feather name="info" size={13} color={Colors.textMuted} />
          <NuveText variant="caption" color={Colors.textMuted} style={{ flex: 1, lineHeight: 17 }}>
            {' '}Projections are illustrative only and do not guarantee future returns. Past performance is not indicative of future results. FRA License #897.
          </NuveText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  resetBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  goalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  goalIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  controlsCard: { marginBottom: 16, gap: 0 },
  divider: { height: 1, backgroundColor: Colors.gray100, marginVertical: 2 },
  sliderBlock: { paddingVertical: 10 },
  sliderHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  sliderValueBadge: {
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 4,
    minWidth: 80, alignItems: 'center',
  },
  slider: { width: '100%', height: 36 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  outcomeCard: { marginBottom: 12 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 20,
  },
  projAmounts: {
    flexDirection: 'row', marginBottom: 20, gap: 0,
  },
  projAmountBlock: { flex: 1, gap: 2 },
  projDivider: {
    width: 1, backgroundColor: Colors.gray100, marginHorizontal: 12,
  },
  targetRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  progressTrack: {
    height: 8, backgroundColor: Colors.gray100,
    borderRadius: 4, overflow: 'hidden', marginBottom: 14,
  },
  progressFill: { height: 8, borderRadius: 4 },
  surplusRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.gray50, borderRadius: 10, padding: 12,
  },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: 4,
  },
});
