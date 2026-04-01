import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { AllocationBars } from '@/components/AllocationDonut';
import { useStrings } from '@/hooks/useStrings';

const PERFORMANCE_TABS = ['1M', '3M', '6M', '1Y', 'All'];

const PERFORMANCE_DATA = {
  '1M': { value: 2.3, label: '1 Month' },
  '3M': { value: 6.8, label: '3 Months' },
  '6M': { value: 9.4, label: '6 Months' },
  '1Y': { value: 17.3, label: '1 Year' },
  'All': { value: 24.6, label: 'All Time' },
};

const REBALANCE_PROPOSAL = {
  goal: 'Dream Home',
  drift: 6.2,
  trades: [
    { asset: 'EGX Stocks', action: 'Sell', amount: 8200, reason: 'Overweight by 3.1%' },
    { asset: 'Treasury Bills', action: 'Buy', amount: 5100, reason: 'Underweight by 1.9%' },
    { asset: 'Gold', action: 'Buy', amount: 3100, reason: 'Underweight by 1.2%' },
  ],
};

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();

  const s = useStrings();
  const [perfTab, setPerfTab] = useState('1Y');
  const [showRebalance, setShowRebalance] = useState(false);
  const { fromInvest } = useLocalSearchParams<{ fromInvest?: string }>();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const allocationData = [
    { label: s.equity, value: 48, color: Colors.chart1 },
    { label: s.bonds, value: 22, color: Colors.chart4 },
    { label: s.gold, value: 15, color: Colors.chart2 },
    { label: s.cash, value: 10, color: Colors.chart5 },
    { label: s.realestate, value: 5, color: Colors.chart3 },
  ];

  const perf = PERFORMANCE_DATA[perfTab as keyof typeof PERFORMANCE_DATA];

  const handleApproveRebalance = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRebalance(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <NuveText variant="h1" weight="bold">{s.portfolio}</NuveText>
      </View>

      {/* Rebalance Alert */}
      <TouchableOpacity style={styles.rebalanceAlert} onPress={() => setShowRebalance(true)}>
        <View style={styles.rebalanceAlertLeft}>
          <Feather name="alert-circle" size={18} color={Colors.warning} />
          <View>
            <NuveText variant="bodySmall" weight="semibold" color={Colors.warning}>
              {s.driftDetected} — {REBALANCE_PROPOSAL.goal}
            </NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>
              Drift: {REBALANCE_PROPOSAL.drift}% · Tap to review
            </NuveText>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={Colors.warning} />
      </TouchableOpacity>

      {/* Performance Card */}
      <NuveCard style={styles.perfCard}>
        <View style={styles.perfHeader}>
          <NuveText variant="h3">{s.performance}</NuveText>
          <View style={styles.perfTabs}>
            {PERFORMANCE_TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.perfTab, tab === perfTab && styles.perfTabActive]}
                onPress={() => setPerfTab(tab)}
              >
                <NuveText
                  variant="caption"
                  weight="semibold"
                  color={tab === perfTab ? Colors.white : Colors.textSecondary}
                >
                  {tab}
                </NuveText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.perfValue}>
          <NuveText variant="display" weight="bold" color={perf.value > 0 ? Colors.success : Colors.error}>
            +{perf.value}%
          </NuveText>
          <NuveText variant="caption" color={Colors.textMuted}>{perf.label} Return</NuveText>
        </View>

        {/* Simple bar chart */}
        <View style={styles.chartContainer}>
          {[12, 18, 9, 24, 16, 30, 22, 35, 28, 42, 38, 17].map((h, i) => (
            <View key={i} style={styles.chartBarWrapper}>
              <View style={[styles.chartBar, { height: h * 2.5, backgroundColor: i === 11 ? Colors.gold : Colors.primary + '40' }]} />
            </View>
          ))}
        </View>
      </NuveCard>

      {/* Allocation */}
      <NuveCard style={styles.allocationCard}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 16 }}>{s.allocation}</NuveText>
        <AllocationBars data={allocationData} />
      </NuveCard>

      {/* Back to Home — shown after investing */}
      {fromInvest === '1' && (
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.push('/(tabs)/')}
        >
          <Feather name="home" size={16} color={Colors.white} />
          <NuveText variant="body" weight="semibold" color={Colors.white}>
            Back to Home
          </NuveText>
          <Feather name="arrow-right" size={16} color={Colors.white} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}

      <View style={{ height: 100 }} />

      {/* Rebalance Modal */}
      <Modal visible={showRebalance} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <NuveText variant="h2" weight="bold">{s.rebalanceProposal}</NuveText>
            <TouchableOpacity onPress={() => setShowRebalance(false)}>
              <Feather name="x" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 16, paddingHorizontal: 20 }}>
            Your <NuveText weight="semibold">{REBALANCE_PROPOSAL.goal}</NuveText> portfolio has drifted{' '}
            <NuveText weight="bold" color={Colors.warning}>{REBALANCE_PROPOSAL.drift}%</NuveText> from
            its target allocation. We recommend the following trades:
          </NuveText>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
            {REBALANCE_PROPOSAL.trades.map((trade, i) => (
              <View key={i} style={styles.tradeCard}>
                <View style={[styles.tradeAction, {
                  backgroundColor: trade.action === 'Buy' ? Colors.success + '20' : Colors.error + '20'
                }]}>
                  <NuveText variant="caption" weight="bold" color={
                    trade.action === 'Buy' ? Colors.success : Colors.error
                  }>{trade.action}</NuveText>
                </View>
                <View style={{ flex: 1 }}>
                  <NuveText variant="body" weight="semibold">{trade.asset}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>{trade.reason}</NuveText>
                </View>
                <NuveText variant="body" weight="bold" color={Colors.primary}>
                  {s.egp} {trade.amount.toLocaleString()}
                </NuveText>
              </View>
            ))}

            <View style={styles.feeNote}>
              <Feather name="info" size={14} color={Colors.info} />
              <NuveText variant="caption" color={Colors.textSecondary}>
                Transaction fee: <NuveText weight="semibold" color={Colors.primary}>EGP 28</NuveText> (0.17%) · Industry avg: 0.25%
              </NuveText>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.deferBtn} onPress={() => setShowRebalance(false)}>
              <NuveText variant="body" weight="semibold" color={Colors.textSecondary}>{s.deferRebalance}</NuveText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={handleApproveRebalance}>
              <NuveText variant="body" weight="semibold" color={Colors.white}>{s.approveRebalance}</NuveText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  rebalanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    marginBottom: 16,
  },
  rebalanceAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  perfCard: { marginBottom: 16 },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  perfTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    padding: 2,
  },
  perfTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  perfTabActive: {
    backgroundColor: Colors.primary,
  },
  perfValue: {
    gap: 4,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 4,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 3,
  },
  allocationCard: { marginBottom: 16 },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  tradeAction: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.infoLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  deferBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: Colors.gray100,
  },
  approveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
});
