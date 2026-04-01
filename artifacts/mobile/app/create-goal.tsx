import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useApp, Goal } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const GOAL_TYPES = [
  { type: 'home', icon: 'home', label: 'Dream Home', labelAr: 'منزل الأحلام', color: '#1A2B4A' },
  { type: 'education', icon: 'book', label: "Children's Education", labelAr: 'تعليم الأبناء', color: '#2980B9' },
  { type: 'hajj', icon: 'compass', label: 'Hajj Pilgrimage', labelAr: 'الحج المبارك', color: '#27AE60' },
  { type: 'retirement', icon: 'umbrella', label: 'Retirement', labelAr: 'التقاعد', color: Colors.gold },
  { type: 'emergency', icon: 'shield', label: 'Emergency Fund', labelAr: 'صندوق الطوارئ', color: '#E74C3C' },
  { type: 'custom', icon: 'star', label: 'Custom Goal', labelAr: 'هدف مخصص', color: '#8E44AD' },
] as const;

const ALLOCATION_PRESETS: Record<string, Record<string, number>> = {
  home: { equity: 45, bonds: 30, gold: 15, cash: 5, realestate: 5 },
  education: { equity: 55, bonds: 25, gold: 10, cash: 5, realestate: 5 },
  hajj: { equity: 30, bonds: 40, gold: 20, cash: 10, realestate: 0 },
  retirement: { equity: 70, bonds: 15, gold: 10, cash: 3, realestate: 2 },
  emergency: { equity: 5, bonds: 25, gold: 10, cash: 60, realestate: 0 },
  custom: { equity: 40, bonds: 30, gold: 15, cash: 10, realestate: 5 },
};

export default function CreateGoalScreen() {
  const insets = useSafeAreaInsets();
  const { addGoal, language } = useApp();
  const s = useStrings();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<typeof GOAL_TYPES[0] | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetYear, setTargetYear] = useState('2030');
  const [monthly, setMonthly] = useState('');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const allocation = selectedType ? ALLOCATION_PRESETS[selectedType.type] : null;
  const timeHorizon = parseInt(targetYear) - new Date().getFullYear();

  const handleCreate = () => {
    if (!selectedType || !targetAmount) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newGoal: Goal = {
      id,
      name: goalName || selectedType.label,
      nameAr: goalName || selectedType.labelAr,
      type: selectedType.type,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      targetDate: `${targetYear}-01-01`,
      allocation: allocation!,
      progressPct: 0,
      monthlyContribution: parseFloat(monthly) || 0,
    };
    addGoal(newGoal);
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">{s.createGoal}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive, i < step && { backgroundColor: Colors.gold }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <NuveText variant="h2" weight="bold" style={{ marginBottom: 8 }}>What are you saving for?</NuveText>
            <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 24, lineHeight: 24 }}>
              Choose a goal type and we'll recommend the best allocation strategy for you.
            </NuveText>

            <View style={styles.goalGrid}>
              {GOAL_TYPES.map(gt => (
                <TouchableOpacity
                  key={gt.type}
                  style={[
                    styles.goalType,
                    selectedType?.type === gt.type && { borderColor: gt.color, borderWidth: 2, backgroundColor: gt.color + '10' }
                  ]}
                  onPress={() => {
                    setSelectedType(gt);
                    if (gt.type !== 'custom') setGoalName('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.goalTypeIcon, { backgroundColor: gt.color + '20' }]}>
                    <Feather name={gt.icon as any} size={24} color={gt.color} />
                  </View>
                  <NuveText variant="bodySmall" weight="semibold" style={{ textAlign: 'center' }}>
                    {language === 'ar' ? gt.labelAr : gt.label}
                  </NuveText>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType?.type === 'custom' && (
              <View style={styles.inputGroup}>
                <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 6 }}>{s.goalName}</NuveText>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., New Car, Vacation..."
                  placeholderTextColor={Colors.textMuted}
                  value={goalName}
                  onChangeText={setGoalName}
                />
              </View>
            )}
          </>
        )}

        {step === 2 && selectedType && (
          <>
            <NuveText variant="h2" weight="bold" style={{ marginBottom: 8 }}>Set your target</NuveText>
            <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 24 }}>
              How much do you need and when?
            </NuveText>

            <View style={styles.inputGroup}>
              <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 6 }}>{s.targetAmount}</NuveText>
              <View style={styles.egpInput}>
                <NuveText variant="body" weight="semibold" color={Colors.textMuted}>{s.egp}</NuveText>
                <TextInput
                  style={styles.amountInput}
                  placeholder="500,000"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 6 }}>{s.targetDate}</NuveText>
              <View style={styles.yearGrid}>
                {[2027, 2028, 2029, 2030, 2032, 2035, 2040, 2050].map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearChip, parseInt(targetYear) === y && styles.yearChipActive]}
                    onPress={() => setTargetYear(y.toString())}
                  >
                    <NuveText variant="bodySmall" weight="semibold" color={parseInt(targetYear) === y ? Colors.white : Colors.textSecondary}>
                      {y}
                    </NuveText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 6 }}>{s.monthlyContribution}</NuveText>
              <View style={styles.egpInput}>
                <NuveText variant="body" weight="semibold" color={Colors.textMuted}>{s.egp}</NuveText>
                <TextInput
                  style={styles.amountInput}
                  placeholder="5,000"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                  value={monthly}
                  onChangeText={setMonthly}
                />
              </View>
            </View>
          </>
        )}

        {step === 3 && selectedType && allocation && (
          <>
            <NuveText variant="h2" weight="bold" style={{ marginBottom: 8 }}>Recommended Allocation</NuveText>
            <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 8, lineHeight: 24 }}>
              Based on your <NuveText weight="semibold">{timeHorizon}-year</NuveText> timeline and risk profile, we recommend:
            </NuveText>

            <View style={styles.allocationCard}>
              {Object.entries(allocation).map(([asset, pct], i) => {
                const COLORS = [Colors.chart1, Colors.chart4, Colors.chart2, Colors.chart5, Colors.chart3];
                const LABELS: Record<string, string> = { equity: s.equity, bonds: s.bonds, gold: s.gold, cash: s.cash, realestate: s.realestate };
                return (
                  <View key={i} style={styles.allocationRow}>
                    <View style={[styles.allocationDot, { backgroundColor: COLORS[i] }]} />
                    <NuveText variant="body" style={{ flex: 1 }}>{LABELS[asset]}</NuveText>
                    <View style={styles.allocationBar}>
                      <View style={[styles.allocationFill, { width: `${pct}%` as any, backgroundColor: COLORS[i] }]} />
                    </View>
                    <NuveText variant="body" weight="bold" style={{ width: 40, textAlign: 'right' }}>{pct}%</NuveText>
                  </View>
                );
              })}
            </View>

            {parseFloat(targetAmount) > 0 && (
              <View style={styles.projectionCard}>
                <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 8 }}>Projection</NuveText>
                <View style={styles.projRow}>
                  <NuveText variant="caption" color={Colors.textMuted}>Target</NuveText>
                  <NuveText variant="body" weight="bold">{s.egp} {parseFloat(targetAmount).toLocaleString()}</NuveText>
                </View>
                <View style={styles.projRow}>
                  <NuveText variant="caption" color={Colors.textMuted}>Timeline</NuveText>
                  <NuveText variant="body" weight="bold">{timeHorizon} years ({targetYear})</NuveText>
                </View>
                <View style={styles.projRow}>
                  <NuveText variant="caption" color={Colors.textMuted}>Monthly needed</NuveText>
                  <NuveText variant="body" weight="bold" color={Colors.primary}>
                    {s.egp} {Math.round(parseFloat(targetAmount) / (timeHorizon * 12) * 0.7).toLocaleString()}
                  </NuveText>
                </View>
                <View style={styles.projRow}>
                  <NuveText variant="caption" color={Colors.textMuted}>Confidence (70th pct)</NuveText>
                  <NuveText variant="body" weight="bold" color={Colors.success}>High</NuveText>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { opacity: step === 1 ? (selectedType ? 1 : 0.4) : (targetAmount ? 1 : 0.4) }]}
            onPress={() => setStep(step + 1)}
            disabled={step === 1 ? !selectedType : !targetAmount}
          >
            <NuveText variant="body" weight="bold" color={Colors.white}>{s.continue}</NuveText>
            <Feather name="arrow-right" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
            <NuveText variant="body" weight="bold" color={Colors.white}>{s.goalCreated}</NuveText>
            <Feather name="check" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressDot: {
    flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.gray200,
  },
  progressDotActive: { backgroundColor: Colors.primary },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  goalType: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  goalTypeIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  inputGroup: { marginBottom: 20 },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  egpInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  yearChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  allocationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  allocationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  allocationDot: { width: 8, height: 8, borderRadius: 4 },
  allocationBar: {
    flex: 1, height: 6, backgroundColor: Colors.gray100,
    borderRadius: 3, overflow: 'hidden',
  },
  allocationFill: { height: '100%', borderRadius: 3 },
  projectionCard: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
});
