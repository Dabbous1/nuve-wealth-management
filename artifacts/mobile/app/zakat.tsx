import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useStrings } from '@/hooks/useStrings';

const NISAB_EGP = 18500; // Gold nisab in EGP (approx 85g gold × gold price)
const ZAKAT_RATE = 0.025;

export default function ZakatScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [investments, setInvestments] = useState('125000');
  const [receivables, setReceivables] = useState('');
  const [debts, setDebts] = useState('');
  const [calculated, setCalculated] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const totalAssets = (parseFloat(cash || '0') + parseFloat(gold || '0') + parseFloat(investments || '0') + parseFloat(receivables || '0'));
  const netZakatable = Math.max(0, totalAssets - parseFloat(debts || '0'));
  const zakatDue = netZakatable >= NISAB_EGP ? netZakatable * ZAKAT_RATE : 0;
  const aboveNisab = netZakatable >= NISAB_EGP;

  const InputRow = ({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string }) => (
    <View style={styles.inputRow}>
      <NuveText variant="bodySmall" weight="medium" style={{ flex: 1 }}>{label}</NuveText>
      <View style={styles.inputWrap}>
        <NuveText variant="caption" color={Colors.textMuted}>EGP</NuveText>
        <TextInput
          style={styles.numInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder || "0"}
          placeholderTextColor={Colors.textMuted}
        />
      </View>
    </View>
  );

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
        <NuveText variant="h3" weight="semibold">{s.zakatCalc}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.nisabNote}>
        <Feather name="info" size={14} color={Colors.info} />
        <NuveText variant="caption" color={Colors.textSecondary}>
          Nisab (85g gold) = <NuveText weight="semibold">EGP {NISAB_EGP.toLocaleString()}</NuveText> · Zakat rate: 2.5%
        </NuveText>
      </View>

      <NuveCard style={{ marginBottom: 16 }}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 16, color: Colors.success }}>Assets (Zakatable)</NuveText>
        <InputRow label="Cash & Bank Savings" value={cash} onChangeText={setCash} />
        <InputRow label="Gold & Silver Value" value={gold} onChangeText={setGold} />
        <InputRow label="Investment Portfolio" value={investments} onChangeText={setInvestments} />
        <InputRow label="Money Owed to You" value={receivables} onChangeText={setReceivables} />
      </NuveCard>

      <NuveCard style={{ marginBottom: 20 }}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 16, color: Colors.error }}>Deductions</NuveText>
        <InputRow label="Outstanding Debts Due" value={debts} onChangeText={setDebts} />
      </NuveCard>

      <TouchableOpacity style={styles.calcBtn} onPress={() => setCalculated(true)}>
        <NuveText variant="body" weight="bold" color={Colors.white}>Calculate Zakat</NuveText>
      </TouchableOpacity>

      {calculated && (
        <NuveCard style={styles.resultCard} variant={aboveNisab ? 'dark' : 'default'}>
          <NuveText variant="label" color={aboveNisab ? Colors.gold : Colors.textMuted}>{s.zakatResult}</NuveText>
          <NuveText variant="display" weight="bold" color={aboveNisab ? Colors.gold : Colors.textMuted}>
            EGP {zakatDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </NuveText>

          <View style={styles.resultRows}>
            <View style={styles.resultRow}>
              <NuveText variant="caption" color={aboveNisab ? Colors.white + '70' : Colors.textMuted}>Net Zakatable Wealth</NuveText>
              <NuveText variant="bodySmall" weight="semibold" color={aboveNisab ? Colors.white : Colors.textPrimary}>
                EGP {netZakatable.toLocaleString()}
              </NuveText>
            </View>
            <View style={styles.resultRow}>
              <NuveText variant="caption" color={aboveNisab ? Colors.white + '70' : Colors.textMuted}>Above Nisab?</NuveText>
              <View style={[styles.nisabPill, { backgroundColor: aboveNisab ? Colors.success + '30' : Colors.error + '30' }]}>
                <Feather name={aboveNisab ? 'check-circle' : 'x-circle'} size={12} color={aboveNisab ? Colors.success : Colors.error} />
                <NuveText variant="caption" weight="bold" color={aboveNisab ? Colors.success : Colors.error}>
                  {aboveNisab ? 'Yes' : 'No'}
                </NuveText>
              </View>
            </View>
            {!aboveNisab && (
              <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
                Your net zakatable wealth is below the Nisab threshold. Zakat is not obligatory this year.
              </NuveText>
            )}
          </View>
        </NuveCard>
      )}

      <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', paddingHorizontal: 16, lineHeight: 18, marginTop: 8 }}>
        This calculator is for guidance only. Please consult your Islamic scholar for personalized guidance on Zakat calculations.
      </NuveText>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  nisabNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.infoLight, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.gray50, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  numInput: {
    fontFamily: 'Inter_600SemiBold', fontSize: 15,
    color: Colors.textPrimary, width: 100, textAlign: 'right',
  },
  calcBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 20,
  },
  resultCard: { gap: 12, marginBottom: 16 },
  resultRows: { gap: 8 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nisabPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
});
