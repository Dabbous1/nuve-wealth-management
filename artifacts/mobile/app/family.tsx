import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { AllocationBars } from '@/components/AllocationDonut';
import { useStrings } from '@/hooks/useStrings';

const MEMBERS = [
  { name: 'Ahmed Hassan', role: 'Primary', balance: 125000, return: 17.3, risk: 'Growth' },
  { name: 'Mona Hassan', role: 'Spouse', balance: 80000, return: 12.8, risk: 'Moderate' },
  { name: 'Omar Hassan', role: 'Child', balance: 35000, return: 22.1, risk: 'Growth' },
];

export default function FamilyScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const totalBalance = MEMBERS.reduce((s, m) => s + m.balance, 0);

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
        <NuveText variant="h3" weight="semibold">{s.familyPortfolio}</NuveText>
        <TouchableOpacity style={styles.addBtn}>
          <Feather name="user-plus" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Total */}
      <NuveCard variant="dark" style={{ marginBottom: 20, gap: 8 }}>
        <NuveText variant="label" color={Colors.gold}>Family Total Wealth</NuveText>
        <NuveText variant="display" weight="bold" family="mono" color={Colors.white}>
          EGP {totalBalance.toLocaleString()}
        </NuveText>
        <NuveText variant="bodySmall" color={Colors.white + '70'}>{MEMBERS.length} Members · Growing Together</NuveText>
      </NuveCard>

      {/* Combined Allocation */}
      <NuveCard style={{ marginBottom: 16 }}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 14 }}>Combined Allocation</NuveText>
        <AllocationBars data={[
          { label: 'EGX Stocks', value: 52, color: Colors.chart1 },
          { label: 'T-Bills', value: 20, color: Colors.chart4 },
          { label: 'Gold', value: 14, color: Colors.chart2 },
          { label: 'Money Market', value: 9, color: Colors.chart5 },
          { label: 'Real Estate', value: 5, color: Colors.chart3 },
        ]} />
      </NuveCard>

      {/* Members */}
      <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Members</NuveText>
      {MEMBERS.map((member, i) => (
        <NuveCard key={i} style={{ marginBottom: 12 }}>
          <View style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <NuveText variant="body" weight="bold" color={Colors.white}>{member.name.charAt(0)}</NuveText>
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{member.name}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>{member.role} · {member.risk}</NuveText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <NuveText variant="body" weight="bold">EGP {member.balance.toLocaleString()}</NuveText>
              <NuveText variant="caption" weight="semibold" color={Colors.success}>+{member.return}%</NuveText>
            </View>
          </View>
        </NuveCard>
      ))}

      <TouchableOpacity style={styles.inviteBtn}>
        <Feather name="user-plus" size={18} color={Colors.gold} />
        <NuveText variant="body" weight="semibold" color={Colors.gold}>Invite Family Member</NuveText>
      </TouchableOpacity>

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
  addBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.midnight, alignItems: 'center', justifyContent: 'center',
  },
  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 12, paddingVertical: 16,
    borderWidth: 1.5, borderColor: Colors.gold, borderStyle: 'dashed',
  },
});
