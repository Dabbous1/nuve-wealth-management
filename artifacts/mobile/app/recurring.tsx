import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const FREQUENCIES = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'];

export default function RecurringScreen() {
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
    <View style={[styles.screen, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">{s.setupRecurring}</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <NuveCard variant="dark" style={{ marginBottom: 20, gap: 8 }}>
          <Feather name="repeat" size={24} color={Colors.gold} />
          <NuveText variant="h2" weight="bold" color={Colors.white}>Automate Your Wealth</NuveText>
          <NuveText variant="bodySmall" color={Colors.white + '80'}>
            Set up automatic investments and never miss a contribution. Consistency is the key to wealth building.
          </NuveText>
        </NuveCard>

        <NuveCard style={{ marginBottom: 16, gap: 12 }}>
          <NuveText variant="h3" weight="semibold">Amount</NuveText>
          <View style={styles.amountRow}>
            <NuveText variant="h2" weight="semibold" color={Colors.textMuted}>EGP</NuveText>
            <TextInput
              style={styles.amountInput}
              placeholder="5,000"
              keyboardType="numeric"
              placeholderTextColor={Colors.gray300}
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.quickAmounts}>
            {['1000', '2000', '5000', '10000'].map(a => (
              <TouchableOpacity key={a} style={styles.quickAmt} onPress={() => setAmount(a)}>
                <NuveText variant="caption" weight="semibold" color={Colors.primary}>
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
                style={[styles.freqChip, f === frequency && styles.freqChipActive]}
                onPress={() => setFrequency(f)}
              >
                <NuveText variant="bodySmall" weight="semibold" color={f === frequency ? Colors.white : Colors.textSecondary}>{f}</NuveText>
              </TouchableOpacity>
            ))}
          </View>
        </NuveCard>

        <NuveCard style={{ marginBottom: 16 }}>
          <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Apply to Goal</NuveText>
          {goals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalRow, selectedGoalId === goal.id && styles.goalRowActive]}
              onPress={() => setSelectedGoalId(goal.id)}
            >
              <NuveText variant="body" style={{ flex: 1 }}>{goal.name}</NuveText>
              {selectedGoalId === goal.id && <Feather name="check-circle" size={18} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </NuveCard>

        {parseFloat(amount) > 0 && (
          <View style={styles.impact}>
            <NuveText variant="bodySmall" weight="semibold" style={{ marginBottom: 8 }}>Impact Preview</NuveText>
            <View style={styles.impactRow}>
              <NuveText variant="caption" color={Colors.textSecondary}>Annual contribution</NuveText>
              <NuveText variant="bodySmall" weight="bold">
                EGP {(parseFloat(amount) * (frequency === 'Monthly' ? 12 : frequency === 'Weekly' ? 52 : frequency === 'Bi-Weekly' ? 26 : 4)).toLocaleString()}
              </NuveText>
            </View>
            <View style={styles.impactRow}>
              <NuveText variant="caption" color={Colors.textSecondary}>Projected 10yr wealth addition</NuveText>
              <NuveText variant="bodySmall" weight="bold" color={Colors.success}>
                +EGP {Math.round(parseFloat(amount) * 12 * 18).toLocaleString()}
              </NuveText>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.setupBtn, { opacity: parseFloat(amount) > 0 && selectedGoalId ? 1 : 0.4 }]}
          onPress={handleSetup}
          disabled={!parseFloat(amount) || !selectedGoalId}
        >
          <NuveText variant="body" weight="bold" color={Colors.white}>Activate Plan</NuveText>
        </TouchableOpacity>
      </View>

      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Feather name="repeat" size={36} color={Colors.gold} />
            </View>
            <NuveText variant="h2" weight="bold" style={{ textAlign: 'center' }}>Plan Activated!</NuveText>
            <NuveText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
              EGP {parseFloat(amount || '0').toLocaleString()} will be invested {frequency.toLowerCase()} into{' '}
              {goals.find(g => g.id === selectedGoalId)?.name}.
            </NuveText>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setShowSuccess(false); router.back(); }}>
              <NuveText variant="body" weight="bold" color={Colors.white}>{s.done}</NuveText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountInput: {
    flex: 1, fontFamily: 'Inter_700Bold', fontSize: 36, color: Colors.textPrimary,
  },
  quickAmounts: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickAmt: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.primary + '12', borderRadius: 20,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  freqGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  freqChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: Colors.gray100,
  },
  freqChipActive: { backgroundColor: Colors.primary },
  goalRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  goalRowActive: { paddingLeft: 4, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  impact: {
    backgroundColor: Colors.primary + '08', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: Colors.primary + '20',
  },
  impactRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.gray100,
  },
  setupBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 32,
    width: '100%', alignItems: 'center', gap: 16,
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.gold + '20', alignItems: 'center', justifyContent: 'center',
  },
  doneBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 32, alignItems: 'center', width: '100%',
  },
});
