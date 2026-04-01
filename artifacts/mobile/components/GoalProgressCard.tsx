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
  home: Colors.midnight,
  education: Colors.blue,
  hajj: Colors.teal,
  retirement: Colors.gold,
  emergency: Colors.error,
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
          <NuveText variant="bodySmall" weight="semibold" style={{ flex: 1 }}>{name}</NuveText>
          <NuveText variant="mono" weight="bold" color={color}>
            {goal.progressPct.toFixed(1)}%
          </NuveText>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(goal.progressPct, 100)}%` as any, backgroundColor: color }]} />
        </View>

        <View style={styles.row}>
          <NuveText variant="caption" color={Colors.slate} family="mono">
            {s.egp} {goal.currentAmount.toLocaleString()}
          </NuveText>
          <NuveText variant="caption" color={Colors.grayLight} family="mono">
            {s.egp} {goal.targetAmount.toLocaleString()} target
          </NuveText>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.slate} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.midnight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chevron: {
    marginLeft: 8,
  },
});
