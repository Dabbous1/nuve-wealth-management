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
import { MarketSwitcherSheet, getMarketOption } from '@/components/MarketSwitcherSheet';

export default function SaveScreen() {
  const insets = useSafeAreaInsets();
  const { user, goals, language, notifications, selectedMarket, setSelectedMarket } = useApp();
  const [showMarketSheet, setShowMarketSheet] = useState(false);
  const s = useStrings();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <NuveText variant="h1" weight="light">Save</NuveText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.marketBtn} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="bold" color={Colors.midnight}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={Colors.white}>
                {user?.name?.charAt(0) ?? 'A'}
              </NuveText>
            </View>
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <NuveText variant="caption" color={Colors.textMuted}>Total Saved</NuveText>
            <NuveText variant="h1" weight="light" color={Colors.midnight} family="display">
              EGP {totalSaved.toLocaleString()}
            </NuveText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <NuveText variant="caption" color={Colors.textMuted}>Target</NuveText>
            <NuveText variant="h3" weight="regular" color={Colors.slate} family="mono">
              EGP {totalTarget.toLocaleString()}
            </NuveText>
          </View>
        </View>

        {/* Overall progress */}
        <View style={styles.overallProgress}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${overallPct}%` as any }]} />
          </View>
          <NuveText variant="caption" weight="semibold" color={Colors.teal}>{overallPct}% of all goals</NuveText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <NuveText variant="caption" color={Colors.textMuted}>Active Goals</NuveText>
            <NuveText variant="h3" weight="regular" color={Colors.textPrimary} family="mono">{goals.length}</NuveText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <NuveText variant="caption" color={Colors.textMuted}>On Track</NuveText>
            <NuveText variant="h3" weight="regular" color={Colors.success} family="mono">
              {goals.filter(g => (g.currentAmount / g.targetAmount) >= (0.5)).length}
            </NuveText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <NuveText variant="caption" color={Colors.textMuted}>Needs Attention</NuveText>
            <NuveText variant="h3" weight="regular" color={Colors.warning} family="mono">
              {goals.filter(g => (g.currentAmount / g.targetAmount) < (0.5)).length}
            </NuveText>
          </View>
        </View>
      </View>

      {/* Goals list */}
      <View style={styles.goalsSection}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" weight="regular" family="display">{s.myGoals}</NuveText>
          <NuveText variant="caption" color={Colors.textMuted}>{goals.length} goals</NuveText>
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
        <TouchableOpacity style={styles.addGoalBtn} onPress={() => router.push('/create-goal')}>
          <View style={styles.addGoalIcon}>
            <Feather name="plus" size={22} color={Colors.gold} />
          </View>
          <View>
            <NuveText variant="body" weight="semibold" color={Colors.gold}>Add a New Goal</NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>Set a target and start saving</NuveText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zakat calculator strip */}
      <TouchableOpacity style={styles.zakatStrip} onPress={() => router.push('/zakat')}>
        <View style={styles.zakatIcon}>
          <NuveText variant="caption" weight="bold" color={Colors.gold}>٪</NuveText>
        </View>
        <View style={{ flex: 1 }}>
          <NuveText variant="bodySmall" weight="semibold">Zakat Calculator</NuveText>
          <NuveText variant="caption" color={Colors.textMuted}>Calculate your annual Zakat obligation</NuveText>
        </View>
        <Feather name="chevron-right" size={16} color={Colors.slate} />
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      <MarketSwitcherSheet
        visible={showMarketSheet}
        currentMarket={selectedMarket}
        onSelect={setSelectedMarket}
        onClose={() => setShowMarketSheet(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.midnight + '10',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.midnight + '20',
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
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  overallProgress: { gap: 6 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.grayLight + '40',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.teal,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: Colors.borderLight },
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
    borderColor: Colors.gold + '60',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  addGoalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zakatStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.gold + '12',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  zakatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gold + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
