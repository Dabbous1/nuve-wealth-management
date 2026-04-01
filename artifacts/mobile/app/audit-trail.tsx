import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useStrings } from '@/hooks/useStrings';

const AUDIT_ENTRIES = [
  { id: '1', action: 'Portfolio Rebalance Approved', details: 'Dream Home goal', timestamp: '2026-03-25 14:22', icon: 'refresh-cw', color: Colors.info },
  { id: '2', action: 'Deposit — Vodafone Cash', details: 'EGP 5,000 received', timestamp: '2026-03-22 10:15', icon: 'arrow-down-left', color: Colors.success },
  { id: '3', action: 'Investment — Treasury Bills', details: '91-Day T-Bill, EGP 10,000', timestamp: '2026-03-20 09:45', icon: 'trending-up', color: Colors.primary },
  { id: '4', action: 'Risk Profile Updated', details: 'Score: 6.5 → 6.8 (Growth)', timestamp: '2026-03-15 16:30', icon: 'sliders', color: Colors.gold },
  { id: '5', action: 'Goal Created', details: "Children's Education Goal", timestamp: '2026-03-10 11:00', icon: 'target', color: Colors.success },
  { id: '6', action: 'Biometric Login', details: 'Face ID enabled', timestamp: '2026-03-05 09:00', icon: 'lock', color: Colors.primary },
  { id: '7', action: 'KYC Verification Complete', details: 'National ID verified', timestamp: '2026-03-01 14:00', icon: 'check-circle', color: Colors.success },
  { id: '8', action: 'Account Created', details: 'Welcome to Nuvé!', timestamp: '2026-03-01 13:30', icon: 'user-plus', color: Colors.gold },
];

export default function AuditTrailScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

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
        <NuveText variant="h3" weight="semibold">{s.auditTrail}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.infoNote}>
        <Feather name="shield" size={14} color={Colors.info} />
        <NuveText variant="caption" color={Colors.textSecondary}>
          All account activities are logged and tamper-proof. This is your complete activity history.
        </NuveText>
      </View>

      {AUDIT_ENTRIES.map((entry, i) => (
        <View key={entry.id} style={styles.entryWrapper}>
          {i < AUDIT_ENTRIES.length - 1 && <View style={styles.timeline} />}
          <View style={[styles.entryIcon, { backgroundColor: entry.color + '20' }]}>
            <Feather name={entry.icon as any} size={16} color={entry.color} />
          </View>
          <View style={styles.entryContent}>
            <NuveText variant="bodySmall" weight="semibold">{entry.action}</NuveText>
            <NuveText variant="caption" color={Colors.textSecondary}>{entry.details}</NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>{entry.timestamp}</NuveText>
          </View>
        </View>
      ))}

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
  infoNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.infoLight, borderRadius: 10, padding: 12, marginBottom: 24,
  },
  entryWrapper: {
    flexDirection: 'row', gap: 14, marginBottom: 20, position: 'relative',
  },
  timeline: {
    position: 'absolute',
    left: 17, top: 40, bottom: -20,
    width: 2, backgroundColor: Colors.gray200,
  },
  entryIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  entryContent: { flex: 1, gap: 2 },
});
