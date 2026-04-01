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
import { useColors } from '@/hooks/useColors';

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

  const C = useColors();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const allocationData = [
    { label: s.equity, value: 48, color: C.chart1 },
    { label: s.bonds, value: 22, color: C.chart4 },
    { label: s.gold, value: 15, color: C.chart2 },
    { label: s.cash, value: 10, color: C.chart5 },
    { label: s.realestate, value: 5, color: C.chart3 },
  ];

  const perf = PERFORMANCE_DATA[perfTab as keyof typeof PERFORMANCE_DATA];

  const handleApproveRebalance = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRebalance(false);
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad + 8, backgroundColor: C.background }]}>
      {/* Header — fixed */}
      <View style={styles.header}>
        <NuveText variant="h1" weight="bold" family="display">{s.portfolio}</NuveText>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

      {/* Rebalance Alert */}
      <TouchableOpacity style={[styles.rebalanceAlert, { backgroundColor: C.warning + '15', borderColor: C.warning + '40' }]} onPress={() => setShowRebalance(true)}>
        <View style={styles.rebalanceAlertLeft}>
          <Feather name="alert-circle" size={18} color={C.warning} />
          <View>
            <NuveText variant="bodySmall" weight="semibold" color={C.warning}>
              {s.driftDetected} — {REBALANCE_PROPOSAL.goal}
            </NuveText>
            <NuveText variant="caption" color={C.textMuted}>
              Drift: {REBALANCE_PROPOSAL.drift}% · Tap to review
            </NuveText>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={C.warning} />
      </TouchableOpacity>

      {/* Performance Card */}
      <NuveCard style={styles.perfCard}>
        <View style={styles.perfHeader}>
          <NuveText variant="h3" family="display">{s.performance}</NuveText>
          <View style={[styles.perfTabs, { backgroundColor: C.borderLight }]}>
            {PERFORMANCE_TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.perfTab, tab === perfTab && [styles.perfTabActive, { backgroundColor: C.textPrimary }]]}
                onPress={() => setPerfTab(tab)}
              >
                <NuveText
                  variant="caption"
                  weight="semibold"
                  color={tab === perfTab ? '#FAFAF8' : C.textSecondary}
                >
                  {tab}
                </NuveText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.perfValue}>
          <NuveText variant="display" weight="bold" family="mono" color={perf.value > 0 ? C.success : C.error}>
            +{perf.value}%
          </NuveText>
          <NuveText variant="caption" color={C.textMuted}>{perf.label} Return</NuveText>
        </View>

        {/* Simple bar chart */}
        <View style={styles.chartContainer}>
          {[12, 18, 9, 24, 16, 30, 22, 35, 28, 42, 38, 17].map((h, i) => (
            <View key={i} style={styles.chartBarWrapper}>
              <View style={[styles.chartBar, { height: h * 2.5, backgroundColor: i === 11 ? C.gold : C.teal + '40' }]} />
            </View>
          ))}
        </View>
      </NuveCard>

      {/* Allocation */}
      <NuveCard style={styles.allocationCard}>
        <NuveText variant="h3" weight="semibold" family="display" style={{ marginBottom: 16 }}>{s.allocation}</NuveText>
        <AllocationBars data={allocationData} />
      </NuveCard>

      {/* Back to Home — shown after investing */}
      {fromInvest === '1' && (
        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: C.teal }]}
          onPress={() => router.push('/(tabs)' as any)}
        >
          <Feather name="home" size={16} color={'#FAFAF8'} />
          <NuveText variant="body" weight="semibold" color={'#FAFAF8'}>
            Back to Home
          </NuveText>
          <Feather name="arrow-right" size={16} color={'#FAFAF8'} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}

      <View style={{ height: 100 }} />
      </ScrollView>

      {/* Rebalance Modal */}
      <Modal visible={showRebalance} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: C.white }]}>
          <View style={[styles.modalHandle, { backgroundColor: C.grayLight }]} />
          <View style={styles.modalHeader}>
            <NuveText variant="h2" weight="bold" family="display">{s.rebalanceProposal}</NuveText>
            <TouchableOpacity onPress={() => setShowRebalance(false)}>
              <Feather name="x" size={22} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          <NuveText variant="body" color={C.textSecondary} style={{ marginBottom: 16, paddingHorizontal: 24 }}>
            Your <NuveText weight="semibold">{REBALANCE_PROPOSAL.goal}</NuveText> portfolio has drifted{' '}
            <NuveText weight="bold" color={C.warning}>{REBALANCE_PROPOSAL.drift}%</NuveText> from
            its target allocation. We recommend the following trades:
          </NuveText>

          <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
            {REBALANCE_PROPOSAL.trades.map((trade, i) => (
              <View key={i} style={[styles.tradeCard, { backgroundColor: C.gray50 }]}>
                <View style={[styles.tradeAction, {
                  backgroundColor: trade.action === 'Buy' ? C.success + '20' : C.error + '20'
                }]}>
                  <NuveText variant="caption" weight="bold" color={
                    trade.action === 'Buy' ? C.success : C.error
                  }>{trade.action}</NuveText>
                </View>
                <View style={{ flex: 1 }}>
                  <NuveText variant="body" weight="semibold">{trade.asset}</NuveText>
                  <NuveText variant="caption" color={C.textMuted}>{trade.reason}</NuveText>
                </View>
                <NuveText variant="body" weight="bold" family="mono" color={C.teal}>
                  {s.egp} {trade.amount.toLocaleString()}
                </NuveText>
              </View>
            ))}

            <View style={[styles.feeNote, { backgroundColor: C.infoLight }]}>
              <Feather name="info" size={14} color={C.info} />
              <NuveText variant="caption" color={C.textSecondary}>
                Transaction fee: <NuveText weight="semibold" color={C.teal}>EGP 28</NuveText> (0.17%) · Industry avg: 0.25%
              </NuveText>
            </View>
          </ScrollView>

          <View style={[styles.modalButtons, { borderTopColor: C.borderLight }]}>
            <TouchableOpacity style={[styles.deferBtn, { backgroundColor: C.borderLight }]} onPress={() => setShowRebalance(false)}>
              <NuveText variant="body" weight="semibold" color={C.textSecondary}>{s.deferRebalance}</NuveText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.approveBtn, { backgroundColor: C.teal }]} onPress={handleApproveRebalance}>
              <NuveText variant="body" weight="semibold" color={'#FAFAF8'}>{s.approveRebalance}</NuveText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  rebalanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  rebalanceAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 8,
    padding: 2,
  },
  perfTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  perfTabActive: {},
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
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  tradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
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
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
  },
  deferBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
  },
  approveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
  },
});
