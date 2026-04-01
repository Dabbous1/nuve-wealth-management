import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { GoalProgressCard } from '@/components/GoalProgressCard';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';
import { useColors } from '@/hooks/useColors';
import { MarketSwitcherSheet, getMarketOption } from '@/components/MarketSwitcherSheet';

export default function SaveScreen() {
  const insets = useSafeAreaInsets();
  const { user, goals, language, notifications, selectedMarket, setSelectedMarket } = useApp();
  const [showMarketSheet, setShowMarketSheet] = useState(false);
  const s = useStrings();
  const C = useColors();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <View style={[styles.screen, { paddingTop: topPad + 8, backgroundColor: C.background }]}>
      {/* Header — fixed */}
      <View style={styles.header}>
        <NuveText variant="h1" weight="light">Save</NuveText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.marketBtn, { backgroundColor: C.textPrimary + '10', borderColor: C.textPrimary + '20' }]} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="bold" color={C.textPrimary}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={'#FAFAF8'}>
                {user?.name?.charAt(0) ?? 'A'}
              </NuveText>
            </View>
            {unreadCount > 0 && <View style={[styles.notifDot, { backgroundColor: C.error, borderColor: C.background }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

      {/* Summary card */}
      <View style={[styles.summaryCard, { backgroundColor: C.white, borderColor: C.borderLight }]}>
        {/* Total Saved — stacked vertically for clarity */}
        <View style={styles.summaryTop}>
          <NuveText variant="caption" color={C.textMuted}>Total Saved</NuveText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <NuveText variant="caption" color={C.slate} family="mono" style={{ fontSize: 14 }}>EGP</NuveText>
            <NuveText variant="h2" weight="bold" family="mono" color={C.textPrimary} numberOfLines={1} adjustsFontSizeToFit>
              {totalSaved.toLocaleString()}
            </NuveText>
          </View>
        </View>

        {/* Overall progress */}
        <View style={styles.overallProgress}>
          <View style={styles.progressLabels}>
            <NuveText variant="caption" weight="semibold" color={C.teal}>{overallPct}% of all goals</NuveText>
            <NuveText variant="caption" color={C.slate} family="mono">
              EGP {totalTarget.toLocaleString()} target
            </NuveText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: C.borderLight }]}>
            <View style={[styles.progressFill, { width: `${overallPct}%` as any, backgroundColor: C.teal }]} />
          </View>
        </View>

        <View style={[styles.statsRow, { borderTopColor: C.borderLight }]}>
          <View style={styles.statItem}>
            <NuveText variant="body" weight="bold" color={C.textPrimary} family="mono">{goals.length}</NuveText>
            <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center' }}>Active{'\n'}Goals</NuveText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: C.borderLight }]} />
          <View style={styles.statItem}>
            <NuveText variant="body" weight="bold" color={C.success} family="mono">
              {goals.filter(g => (g.currentAmount / g.targetAmount) >= (0.5)).length}
            </NuveText>
            <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center' }}>On{'\n'}Track</NuveText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: C.borderLight }]} />
          <View style={styles.statItem}>
            <NuveText variant="body" weight="bold" color={C.warning} family="mono">
              {goals.filter(g => (g.currentAmount / g.targetAmount) < (0.5)).length}
            </NuveText>
            <NuveText variant="caption" color={C.textMuted} style={{ textAlign: 'center' }}>Needs{'\n'}Attention</NuveText>
          </View>
        </View>
      </View>

      {/* Goals list */}
      <View style={styles.goalsSection}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" weight="regular" family="display">{s.myGoals}</NuveText>
          <NuveText variant="caption" color={C.textMuted}>{goals.length} goals</NuveText>
        </View>

        {goals.map(goal => (
          <GoalProgressCard
            key={goal.id}
            goal={goal}
            language={language}
            onPress={() => router.push({ pathname: '/goal/[id]', params: { id: goal.id } })}
          />
        ))}

        {/* Add Goal */}
        <TouchableOpacity style={[styles.addGoalBtn, { borderColor: C.gold + '60' }]} onPress={() => router.push('/create-goal')}>
          <View style={[styles.addGoalIcon, { backgroundColor: C.gold + '15' }]}>
            <Feather name="plus" size={22} color={C.gold} />
          </View>
          <View>
            <NuveText variant="body" weight="semibold" color={C.gold}>Add a New Goal</NuveText>
            <NuveText variant="caption" color={C.textMuted}>Set a target and start saving</NuveText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zakat calculator strip */}
      <TouchableOpacity style={[styles.zakatStrip, { backgroundColor: C.gold + '12' }]} onPress={() => router.push('/zakat')}>
        <View style={[styles.zakatIcon, { backgroundColor: C.gold + '25' }]}>
          <NuveText variant="caption" weight="bold" color={C.gold}>٪</NuveText>
        </View>
        <View style={{ flex: 1 }}>
          <NuveText variant="bodySmall" weight="semibold">Zakat Calculator</NuveText>
          <NuveText variant="caption" color={C.textMuted}>Calculate your annual Zakat obligation</NuveText>
        </View>
        <Feather name="chevron-right" size={16} color={C.slate} />
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      </ScrollView>

      <MarketSwitcherSheet
        visible={showMarketSheet}
        currentMarket={selectedMarket}
        onSelect={setSelectedMarket}
        onClose={() => setShowMarketSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1,
  },
  profileBtn: { position: 'relative' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 0, right: 0,
    width: 10, height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    gap: 16,
  },
  summaryTop: { gap: 4 },
  overallProgress: { gap: 8 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  goalsSection: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  addGoalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zakatStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  zakatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
