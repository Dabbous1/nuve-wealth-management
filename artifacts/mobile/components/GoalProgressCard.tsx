import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { NuveText } from './NuveText';
import { Goal } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const GOAL_ICONS: Record<Goal['type'], string> = {
  home: 'home',
  education: 'book',
  hajj: 'compass',
  retirement: 'umbrella',
  emergency: 'shield',
  custom: 'star',
};

const GOAL_COLORS: Record<Goal['type'], string> = {
  home: '#1A2B4A',
  education: '#2980B9',
  hajj: '#27AE60',
  retirement: '#C9A84C',
  emergency: '#E74C3C',
  custom: '#8E44AD',
};

interface GoalProgressCardProps {
  goal: Goal;
  onPress: () => void;
  language?: 'en' | 'ar';
}

export function GoalProgressCard({ goal, onPress, language = 'en' }: GoalProgressCardProps) {
  const s = useStrings();
  const color = GOAL_COLORS[goal.type];
  const icon = GOAL_ICONS[goal.type];
  const name = language === 'ar' ? goal.nameAr : goal.name;
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.iconContainer, { backgroundColor: color + '18' }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <NuveText variant="h3" style={{ flex: 1 }}>{name}</NuveText>
          <NuveText variant="body" weight="semibold" color={color}>
            {goal.progressPct.toFixed(1)}%
          </NuveText>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(goal.progressPct, 100)}%` as any, backgroundColor: color }]} />
        </View>

        <View style={styles.row}>
          <NuveText variant="bodySmall" color={Colors.textSecondary}>
            {s.egp} {goal.currentAmount.toLocaleString()}
          </NuveText>
          <NuveText variant="bodySmall" color={Colors.textMuted}>
            {s.egp} {goal.targetAmount.toLocaleString()} target
          </NuveText>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.gray400} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray100,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
