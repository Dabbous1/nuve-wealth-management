import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const FREQUENCIES = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'];

export default function RecurringScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { goals } = useApp();
  const s = useStrings();
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id ?? null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const handleSetup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad, backgroundColor: C.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.white }]}>
            <Feather name="arrow-left" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">{s.setupRecurring}</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <NuveCard variant="dark" style={{ marginBottom: 20, gap: 8 }}>
          <Feather name="repeat" size={24} color={C.gold} />
          <NuveText variant="h2" weight="bold" family="display" color={'#FAFAF8'}>Automate Your Wealth</NuveText>
          <NuveText variant="bodySmall" color={'#FAFAF8' + '80'}>
            Set up automatic investments and never miss a contribution. Consistency is the key to wealth building.
          </NuveText>
        </NuveCard>

        <NuveCard style={{ marginBottom: 16, gap: 12 }}>
          <NuveText variant="h3" weight="semibold">Amount</NuveText>
          <View style={styles.amountRow}>
            <NuveText variant="h2" weight="semibold" color={C.textMuted}>EGP</NuveText>
            <TextInput
              style={[styles.amountInput, { color: C.textPrimary }]}
              placeholder="5,000"
              keyboardType="numeric"
              placeholderTextColor={C.grayLight}
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.quickAmounts}>
            {['1000', '2000', '5000', '10000'].map(a => (
              <TouchableOpacity key={a} style={[styles.quickAmt, { backgroundColor: C.teal + '12', borderColor: C.teal + '25' }]} onPress={() => setAmount(a)}>
                <NuveText variant="caption" weight="semibold" color={C.teal}>
                  EGP {parseInt(a).toLocaleString()}
                </NuveText>
              </TouchableOpacity>
            ))}
          </View>
        </NuveCard>

        <NuveCard style={{ marginBottom: 16 }}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Frequency</NuveText>
          <View style={styles.freqGrid}>
            {FREQUENCIES.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.freqChip, { backgroundColor: C.borderLight }, f === frequency && { backgroundColor: C.teal }]}
                onPress={() => setFrequency(f)}
              >
                <NuveText variant="bodySmall" weight="semibold" color={f === frequency ? '#FAFAF8' : C.textSecondary}>{f}</NuveText>
              </TouchableOpacity>
            ))}
          </View>
        </NuveCard>

        <NuveCard style={{ marginBottom: 16 }}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Apply to Goal</NuveText>
          {goals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalRow, { borderBottomColor: C.borderLight }, selectedGoalId === goal.id && { paddingLeft: 4, borderLeftWidth: 3, borderLeftColor: C.teal }]}
              onPress={() => setSelectedGoalId(goal.id)}
            >
              <NuveText variant="body" style={{ flex: 1 }}>{goal.name}</NuveText>
              {selectedGoalId === goal.id && <Feather name="check-circle" size={18} color={C.teal} />}
            </TouchableOpacity>
          ))}
        </NuveCard>

        {parseFloat(amount) > 0 && (
          <View style={[styles.impact, { backgroundColor: C.teal + '08', borderColor: C.teal + '20' }]}>
            <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 8 }}>Impact Preview</NuveText>
            <View style={styles.impactRow}>
              <NuveText variant="caption" color={C.textSecondary}>Annual contribution</NuveText>
              <NuveText variant="bodySmall" weight="bold">
                EGP {(parseFloat(amount) * (frequency === 'Monthly' ? 12 : frequency === 'Weekly' ? 52 : frequency === 'Bi-Weekly' ? 26 : 4)).toLocaleString()}
              </NuveText>
            </View>
            <View style={styles.impactRow}>
              <NuveText variant="caption" color={C.textSecondary}>Projected 10yr wealth addition</NuveText>
              <NuveText variant="bodySmall" weight="bold" color={C.success}>
                +EGP {Math.round(parseFloat(amount) * 12 * 18).toLocaleString()}
              </NuveText>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: C.background, borderTopColor: C.borderLight }]}>
        <TouchableOpacity
          style={[styles.setupBtn, { backgroundColor: C.teal, opacity: parseFloat(amount) > 0 && selectedGoalId ? 1 : 0.4 }]}
          onPress={handleSetup}
          disabled={!parseFloat(amount) || !selectedGoalId}
        >
          <NuveText variant="body" weight="bold" color={Colors.midnight}>Activate Plan</NuveText>
        </TouchableOpacity>
      </View>

      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, { backgroundColor: C.white }]}>
            <View style={[styles.successIcon, { backgroundColor: C.gold + '20' }]}>
              <Feather name="repeat" size={36} color={C.gold} />
            </View>
            <NuveText variant="h2" weight="bold" family="display" style={{ textAlign: 'center' }}>Plan Activated!</NuveText>
            <NuveText variant="body" color={C.textSecondary} style={{ textAlign: 'center' }}>
              EGP {parseFloat(amount || '0').toLocaleString()} will be invested {frequency.toLowerCase()} into{' '}
              {goals.find(g => g.id === selectedGoalId)?.name}.
            </NuveText>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: C.teal }]} onPress={() => { setShowSuccess(false); router.back(); }}>
              <NuveText variant="body" weight="bold" color={Colors.midnight}>{s.done}</NuveText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountInput: {
    flex: 1, fontFamily: 'SpaceMono_700Bold', fontSize: 36,
  },
  quickAmounts: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickAmt: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
  },
  freqGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  freqChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12,
  },
  goalRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1,
  },
  impact: {
    borderRadius: 12,
    padding: 14, borderWidth: 1,
  },
  impactRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  setupBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
  },
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successCard: {
    borderRadius: 20, padding: 32,
    width: '100%', alignItems: 'center', gap: 16,
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtn: {
    borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 32, alignItems: 'center', width: '100%',
  },
});
