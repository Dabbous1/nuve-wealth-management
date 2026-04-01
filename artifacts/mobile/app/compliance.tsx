import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useStrings } from '@/hooks/useStrings';

const COMPLIANCE_DATA = {
  licenseNumber: '897',
  licenseType: 'Non-Banking Financial Institution',
  issueDate: 'January 15, 2010',
  lastRenewal: 'January 15, 2026',
  lastAudit: 'December 5, 2025',
  nextAudit: 'December 2026',
  status: 'Full Compliance',
  registryUrl: 'https://fra.gov.eg',
  subsidiaries: [
    { name: 'Acumen Asset Management', license: 'AAM-897-1' },
    { name: 'Acumen Securities Brokerage', license: 'ASB-897-2' },
    { name: 'Acumen Advisory & Activism', license: 'AAA-897-3' },
  ],
};

export default function ComplianceScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
      <NuveText variant="caption" color={Colors.textMuted}>{label}</NuveText>
      <NuveText variant="bodySmall" weight="semibold">{value}</NuveText>
    </View>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">{s.fraCompliance}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      {/* Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusIcon}>
          <Feather name="shield" size={32} color={Colors.gold} />
        </View>
        <NuveText variant="h2" weight="bold" family="display" color={Colors.white}>FRA Regulated</NuveText>
        <View style={styles.statusPill}>
          <Feather name="check-circle" size={14} color={Colors.success} />
          <NuveText variant="bodySmall" weight="bold" color={Colors.success}>{s.fullCompliance}</NuveText>
        </View>
        <NuveText variant="caption" color={Colors.white + '80'} style={{ textAlign: 'center' }}>
          Acumen Holding is fully licensed and regulated by the Egyptian Financial Regulatory Authority.
        </NuveText>
      </View>

      {/* License Details */}
      <NuveCard style={styles.card}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>License Details</NuveText>
        <DetailRow label={s.licenseNumber} value={`No. ${COMPLIANCE_DATA.licenseNumber}`} />
        <DetailRow label="License Type" value={COMPLIANCE_DATA.licenseType} />
        <DetailRow label={s.issueDate} value={COMPLIANCE_DATA.issueDate} />
        <DetailRow label={s.lastRenewal} value={COMPLIANCE_DATA.lastRenewal} />
        <DetailRow label={s.lastAudit} value={COMPLIANCE_DATA.lastAudit} />
        <DetailRow label="Next Audit" value={COMPLIANCE_DATA.nextAudit} />
        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <NuveText variant="caption" color={Colors.textMuted}>{s.complianceStatus}</NuveText>
          <View style={styles.greenPill}>
            <Feather name="check" size={12} color={Colors.success} />
            <NuveText variant="caption" weight="bold" color={Colors.success}>{COMPLIANCE_DATA.status}</NuveText>
          </View>
        </View>
      </NuveCard>

      {/* Subsidiaries */}
      <NuveCard style={styles.card}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>{s.subsidiaries}</NuveText>
        {COMPLIANCE_DATA.subsidiaries.map((sub, i) => (
          <View key={i} style={[styles.subRow, i === COMPLIANCE_DATA.subsidiaries.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.subIcon}>
              <Feather name="briefcase" size={16} color={Colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{sub.name}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>License: {sub.license}</NuveText>
            </View>
            <Feather name="check-circle" size={16} color={Colors.success} />
          </View>
        ))}
      </NuveCard>

      {/* FRA Verify */}
      <TouchableOpacity
        style={styles.fraBtn}
        onPress={() => Linking.openURL(COMPLIANCE_DATA.registryUrl)}
      >
        <Feather name="external-link" size={18} color={Colors.teal} />
        <NuveText variant="body" weight="semibold" color={Colors.teal}>{s.verifyOnFRA}</NuveText>
      </TouchableOpacity>

      <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 }}>
        This information is updated within 48 hours of any regulatory event. FRA License No. 897 is verifiable at fra.gov.eg.
      </NuveText>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  statusBanner: {
    backgroundColor: Colors.midnight,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  statusIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.gold + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  card: { marginBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  greenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  subIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.teal + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  fraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.teal,
  },
});
