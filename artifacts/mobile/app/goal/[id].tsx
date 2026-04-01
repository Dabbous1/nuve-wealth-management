import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { AllocationBars } from '@/components/AllocationDonut';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const GOAL_ICONS: Record<string, string> = {
  home: 'home', education: 'book', hajj: 'compass',
  retirement: 'umbrella', emergency: 'shield', custom: 'star',
};
const GOAL_COLORS: Record<string, string> = {
  home: Colors.midnight, education: Colors.info, hajj: Colors.success,
  retirement: Colors.gold, emergency: Colors.error, custom: '#8E44AD',
};

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { goals, deleteGoal, language } = useApp();
  const s = useStrings();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const goal = goals.find(g => g.id === id);
  if (!goal) return null;

  const color = GOAL_COLORS[goal.type];
  const icon = GOAL_ICONS[goal.type];
  const name = language === 'ar' ? goal.nameAr : goal.name;
  const remaining = goal.targetAmount - goal.currentAmount;
  const yearsLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000));

  const allocationData = Object.entries(goal.allocation).map(([key, val], i) => {
    const COLORS = [Colors.chart1, Colors.chart4, Colors.chart2, Colors.chart5, Colors.chart3];
    const LABELS: Record<string, string> = { equity: s.equity, bonds: s.bonds, gold: s.gold, cash: s.cash, realestate: s.realestate };
    return { label: LABELS[key] || key, value: val, color: COLORS[i] };
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">{name}</NuveText>
        <TouchableOpacity onPress={() => { deleteGoal(goal.id); router.back(); }}>
          <Feather name="trash-2" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: color }]}>
        {/* On Track badge — top-right */}
        <View style={[
          styles.onTrackBadge,
          { backgroundColor: goal.progressPct >= 15 ? Colors.success + 'CC' : Colors.warning + 'CC' },
        ]}>
          <Feather
            name={goal.progressPct >= 15 ? 'check-circle' : 'alert-circle'}
            size={11}
            color={Colors.white}
          />
          <NuveText variant="caption" weight="bold" color={Colors.white} style={{ fontSize: 11 }}>
            {goal.progressPct >= 15 ? 'On Track' : 'Needs Adjustment'}
          </NuveText>
        </View>

        <View style={styles.heroIcon}>
          <Feather name={icon as any} size={32} color={Colors.white} />
        </View>
        <NuveText variant="h1" weight="bold" color={Colors.white}>{name}</NuveText>
        <NuveText variant="display" weight="bold" family="mono" color={Colors.white}>
          {goal.progressPct.toFixed(1)}%
        </NuveText>
        <View style={styles.heroProgress}>
          <View style={[styles.heroFill, { width: `${Math.min(goal.progressPct, 100)}%` as any }]} />
        </View>
        <View style={styles.heroMeta}>
          <View style={{ alignItems: 'center' }}>
            <NuveText variant="caption" color={Colors.white + '70'}>Invested</NuveText>
            <NuveText variant="bodySmall" weight="bold" color={Colors.white}>
              {s.egp} {goal.currentAmount.toLocaleString()}
            </NuveText>
          </View>
          <View style={styles.heroDivider} />
          <View style={{ alignItems: 'center' }}>
            <NuveText variant="caption" color={Colors.white + '70'}>Target</NuveText>
            <NuveText variant="bodySmall" weight="bold" color={Colors.white}>
              {s.egp} {goal.targetAmount.toLocaleString()}
            </NuveText>
          </View>
          <View style={styles.heroDivider} />
          <View style={{ alignItems: 'center' }}>
            <NuveText variant="caption" color={Colors.white + '70'}>Years Left</NuveText>
            <NuveText variant="bodySmall" weight="bold" color={Colors.white}>{yearsLeft}</NuveText>
          </View>
        </View>
      </View>

      {/* Stats */}
      <NuveCard padding={0} style={styles.statsCard}>
        {[
          {
            label: 'Remaining',
            sub: 'Amount left to goal',
            prefix: 'EGP',
            value: remaining.toLocaleString('en-EG'),
            icon: 'target' as const,
            valueColor: Colors.error,
          },
          {
            label: 'Monthly Contribution',
            sub: 'Auto-invested each month',
            prefix: 'EGP',
            value: goal.monthlyContribution.toLocaleString('en-EG'),
            icon: 'calendar' as const,
            valueColor: Colors.teal,
          },
        ].map((stat, i, arr) => (
          <View
            key={i}
            style={[
              styles.statRow,
              i < arr.length - 1 && styles.statRowBorder,
            ]}
          >
            <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
              <Feather name={stat.icon} size={16} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{stat.label}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>{stat.sub}</NuveText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {stat.prefix && (
                <NuveText variant="caption" weight="semibold" color={Colors.textMuted}>{stat.prefix}</NuveText>
              )}
              <NuveText variant="h3" weight="bold" color={stat.valueColor}>
                {stat.value}
              </NuveText>
            </View>
          </View>
        ))}
      </NuveCard>

      {/* Allocation */}
      <NuveCard style={styles.card}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 14 }}>{s.allocation}</NuveText>
        <AllocationBars data={allocationData} />
      </NuveCard>

      {/* Projections */}
      <NuveCard style={styles.card}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>{s.projectedCompletion}</NuveText>
        {[
          { label: '70th percentile (optimistic)', value: `EGP ${(goal.targetAmount * 1.12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: Colors.success },
          { label: '50th percentile (base case)', value: `EGP ${(goal.targetAmount * 0.98).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: Colors.teal },
          { label: '30th percentile (conservative)', value: `EGP ${(goal.targetAmount * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: Colors.warning },
        ].map((proj, i) => (
          <View key={i} style={styles.projRow}>
            <NuveText variant="caption" color={Colors.textSecondary} style={{ flex: 1 }}>{proj.label}</NuveText>
            <NuveText variant="bodySmall" weight="bold" color={proj.color}>{proj.value}</NuveText>
          </View>
        ))}
      </NuveCard>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color }]} onPress={() => router.push('/deposit')}>
          <Feather name="plus" size={18} color={Colors.white} />
          <NuveText variant="body" weight="bold" color={Colors.white}>Add Funds</NuveText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => router.push({ pathname: '/scenario', params: { goalId: goal.id } })}
        >
          <Feather name="sliders" size={18} color={Colors.teal} />
          <NuveText variant="body" weight="bold" color={Colors.teal}>Run Scenario</NuveText>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, marginBottom: 16,
    position: 'relative',
  },
  onTrackBadge: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.white + '30', alignItems: 'center', justifyContent: 'center',
  },
  heroProgress: {
    width: '100%', height: 6, backgroundColor: Colors.white + '30', borderRadius: 3, overflow: 'hidden',
  },
  heroFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 3 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 4 },
  heroDivider: { width: 1, height: 30, backgroundColor: Colors.white + '40' },
  statsCard: { marginBottom: 16, gap: 0, padding: 0, overflow: 'hidden' },
  statRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  statRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  card: { marginBottom: 16 },
  projRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 14,
  },
  actionBtnSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1.5, borderColor: Colors.teal,
  },
});
