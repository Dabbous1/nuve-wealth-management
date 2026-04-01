import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { MarketSwitcherSheet, getMarketOption } from '@/components/MarketSwitcherSheet';

const TRANSFERS = [
  { type: 'deposit', label: 'Deposit via Bank Transfer', amount: '+EGP 10,000', date: 'Mar 28', status: 'Completed' },
  { type: 'transfer', label: 'Transfer to Nuvé Card', amount: '-EGP 2,000', date: 'Mar 27', status: 'Completed' },
  { type: 'withdraw', label: 'Withdrawal via InstaPay', amount: '-EGP 5,000', date: 'Mar 18', status: 'Completed' },
  { type: 'deposit', label: 'Deposit via Debit Card', amount: '+EGP 8,000', date: 'Mar 12', status: 'Completed' },
  { type: 'transfer', label: 'Transfer from Nuvé Card', amount: '+EGP 1,500', date: 'Mar 10', status: 'Completed' },
  { type: 'withdraw', label: 'Withdrawal to CIB ···1234', amount: '-EGP 3,500', date: 'Feb 28', status: 'Completed' },
];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user, notifications, selectedMarket, setSelectedMarket } = useApp();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2 | 3>(1);
  const [transferDir, setTransferDir] = useState<'wallet-to-card' | 'card-to-wallet'>('wallet-to-card');
  const [transferAmount, setTransferAmount] = useState('');
  const [showMarketSheet, setShowMarketSheet] = useState(false);

  const openTransfer = () => {
    setTransferStep(1);
    setTransferAmount('');
    setShowTransfer(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeTransfer = () => {
    setShowTransfer(false);
    setTimeout(() => { setTransferStep(1); setTransferAmount(''); }, 300);
  };

  const selectDir = (dir: 'wallet-to-card' | 'card-to-wallet') => {
    setTransferDir(dir);
    setTransferAmount('');
    setTransferStep(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const confirmTransfer = () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTransferStep(3);
  };

  const QUICK_AMOUNTS = ['500', '1,000', '2,000', '5,000'];
  const dirLabel = transferDir === 'wallet-to-card'
    ? { from: 'Wallet', to: 'Nuvé Card', color: Colors.primary }
    : { from: 'Nuvé Card', to: 'Wallet', color: Colors.gold };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <NuveText variant="h1" weight="bold">Wallet</NuveText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.marketBtn} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="bold" color={Colors.primary}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={Colors.white}>
                {user?.name?.charAt(0) ?? 'A'}
              </NuveText>
            </View>
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Cash Balance Card */}
      <NuveCard variant="dark" style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <NuveText variant="label" color={Colors.gold}>Available Cash</NuveText>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            <Feather name={balanceVisible ? 'eye' : 'eye-off'} size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>
        {balanceVisible ? (
          <NuveText variant="display" weight="bold" color={Colors.white}>
            EGP 12,500
          </NuveText>
        ) : (
          <NuveText variant="display" weight="bold" color={Colors.white}>••••••</NuveText>
        )}
        <NuveText variant="caption" color={Colors.gray400}>Uninvested cash · ready to deploy</NuveText>

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaBtn} onPress={openTransfer}>
            <Feather name="send" size={17} color={Colors.primary} />
            <NuveText variant="bodySmall" weight="semibold" color={Colors.primary}>Transfer</NuveText>
          </TouchableOpacity>
          <View style={styles.ctaDivider} />
          <TouchableOpacity style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/deposit'); }}>
            <Feather name="arrow-down-circle" size={17} color={Colors.success} />
            <NuveText variant="bodySmall" weight="semibold" color={Colors.success}>Deposit</NuveText>
          </TouchableOpacity>
          <View style={styles.ctaDivider} />
          <TouchableOpacity style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/withdraw'); }}>
            <Feather name="arrow-up-circle" size={17} color={Colors.gold} />
            <NuveText variant="bodySmall" weight="semibold" color={Colors.gold}>Withdraw</NuveText>
          </TouchableOpacity>
        </View>
      </NuveCard>

      {/* Invested Balance */}
      <NuveCard style={styles.investedCard}>
        <View style={styles.investedRow}>
          <View>
            <NuveText variant="caption" color={Colors.textMuted}>Invested Portfolio</NuveText>
            <NuveText variant="h2" weight="bold" color={Colors.textPrimary}>
              EGP {((user?.totalBalance ?? 0) - 12500).toLocaleString()}
            </NuveText>
          </View>
          <View style={styles.returnBadge}>
            <Feather name="trending-up" size={14} color={Colors.success} />
            <NuveText variant="caption" weight="bold" color={Colors.success}>
              +{user?.totalReturnPct}%
            </NuveText>
          </View>
        </View>
        <TouchableOpacity style={styles.goInvest} onPress={() => router.push('/(tabs)/invest')}>
          <NuveText variant="caption" weight="semibold" color={Colors.primary}>Go to Invest →</NuveText>
        </TouchableOpacity>
      </NuveCard>

      {/* Transfer History */}
      <View style={styles.section}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Transfer History</NuveText>
        {TRANSFERS.map((tx, i) => {
          const iconName = tx.type === 'transfer' ? 'send' : tx.type === 'deposit' ? 'arrow-down-left' : 'arrow-up-right';
          const iconColor = tx.type === 'transfer' ? Colors.primary : tx.type === 'deposit' ? Colors.success : Colors.gold;
          const amountColor = tx.type === 'deposit' ? Colors.success : tx.type === 'transfer' && tx.amount.startsWith('+') ? Colors.primary : Colors.error;
          return (
          <View key={i} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: iconColor + '15' }]}>
              <Feather name={iconName as any} size={16} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="medium">{tx.label}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>{tx.date} · {tx.status}</NuveText>
            </View>
            <NuveText variant="bodySmall" weight="semibold" color={amountColor}>
              {tx.amount}
            </NuveText>
          </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Transfer Modal */}
    <Modal visible={showTransfer} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeTransfer} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          {/* ── STEP 1: Direction ── */}
          {transferStep === 1 && (
            <>
              <NuveText variant="h2" weight="bold" style={{ marginBottom: 6 }}>Transfer Funds</NuveText>
              <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 24 }}>
                Which direction would you like to transfer?
              </NuveText>

              <TouchableOpacity style={styles.withdrawOption} onPress={() => selectDir('wallet-to-card')}>
                <View style={[styles.withdrawIcon, { backgroundColor: Colors.primary + '15' }]}>
                  <Feather name="arrow-right-circle" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <NuveText variant="body" weight="semibold">Wallet → Card</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>Move cash from your wallet to your Nuvé pre-paid card</NuveText>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.withdrawOption} onPress={() => selectDir('card-to-wallet')}>
                <View style={[styles.withdrawIcon, { backgroundColor: Colors.gold + '15' }]}>
                  <Feather name="arrow-left-circle" size={22} color={Colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <NuveText variant="body" weight="semibold">Card → Wallet</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>Return funds from your Nuvé card back to your wallet</NuveText>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={closeTransfer}>
                <NuveText variant="body" weight="semibold" color={Colors.textMuted}>Cancel</NuveText>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2: Amount ── */}
          {transferStep === 2 && (
            <>
              {/* Header with back */}
              <View style={styles.transferModalHeader}>
                <TouchableOpacity style={styles.backCircle} onPress={() => setTransferStep(1)}>
                  <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <NuveText variant="h2" weight="bold">Enter Amount</NuveText>
              </View>

              {/* Direction Banner */}
              <View style={[styles.dirBanner, { borderColor: dirLabel.color + '30', backgroundColor: dirLabel.color + '08' }]}>
                <View style={styles.dirBannerSide}>
                  <Feather name="credit-card" size={14} color={Colors.textMuted} />
                  <NuveText variant="bodySmall" weight="semibold" color={dirLabel.color}>{dirLabel.from}</NuveText>
                </View>
                <Feather name="arrow-right" size={16} color={dirLabel.color} />
                <View style={styles.dirBannerSide}>
                  <Feather name={transferDir === 'wallet-to-card' ? 'credit-card' : 'briefcase'} size={14} color={Colors.textMuted} />
                  <NuveText variant="bodySmall" weight="semibold" color={dirLabel.color}>{dirLabel.to}</NuveText>
                </View>
              </View>

              {/* Available Balance */}
              <NuveText variant="caption" color={Colors.textMuted} style={{ marginBottom: 6 }}>
                Available: <NuveText variant="caption" weight="bold" color={Colors.textPrimary}>EGP 127,450.00</NuveText>
              </NuveText>

              {/* Amount Input */}
              <View style={styles.amountInputWrap}>
                <NuveText variant="h3" weight="semibold" color={Colors.textMuted}>EGP</NuveText>
                <TextInput
                  style={[styles.amountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder="0.00"
                  placeholderTextColor={Colors.gray300}
                  keyboardType="numeric"
                  value={transferAmount}
                  onChangeText={v => setTransferAmount(v.replace(/[^0-9.]/g, ''))}
                  autoFocus
                />
              </View>

              {/* Quick Chips */}
              <View style={styles.quickChipsRow}>
                {QUICK_AMOUNTS.map(amt => {
                  const raw = amt.replace(',', '');
                  const active = transferAmount === raw;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.quickChip, active && styles.quickChipActive]}
                      onPress={() => { setTransferAmount(raw); Haptics.selectionAsync(); }}
                    >
                      <NuveText
                        variant="caption"
                        weight="semibold"
                        color={active ? Colors.white : Colors.primary}
                      >
                        {amt}
                      </NuveText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.transferBtn, (!transferAmount || parseFloat(transferAmount) <= 0) && styles.transferBtnDisabled]}
                onPress={confirmTransfer}
                activeOpacity={0.85}
              >
                <Feather name="send" size={18} color={Colors.white} />
                <NuveText variant="body" weight="bold" color={Colors.white}>Transfer Now</NuveText>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 3: Success ── */}
          {transferStep === 3 && (
            <View style={styles.successState}>
              <View style={styles.successIcon}>
                <Feather name="check" size={32} color={Colors.white} />
              </View>
              <NuveText variant="h2" weight="bold" style={{ marginTop: 20, marginBottom: 8 }}>Transfer Sent!</NuveText>
              <NuveText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginBottom: 6 }}>
                EGP {parseFloat(transferAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </NuveText>
              <NuveText variant="bodySmall" color={Colors.textMuted} style={{ textAlign: 'center', marginBottom: 28 }}>
                {dirLabel.from} → {dirLabel.to} · Instant
              </NuveText>
              <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide]} onPress={closeTransfer}>
                <NuveText variant="body" weight="bold" color={Colors.white}>Done</NuveText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>

    <MarketSwitcherSheet
      visible={showMarketSheet}
      currentMarket={selectedMarket}
      onSelect={setSelectedMarket}
      onClose={() => setShowMarketSheet(false)}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary + '10',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary + '20',
  },
  profileBtn: { position: 'relative' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  balanceCard: { marginBottom: 16, gap: 10 },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ctaRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  ctaDivider: { width: 1, backgroundColor: Colors.gray100 },
  investedCard: { marginBottom: 24 },
  investedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  goInvest: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: 10,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  withdrawOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  withdrawIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  accountsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  accountPill: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  instantBadge: {
    backgroundColor: Colors.success + '15',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  transferModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  dirBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  dirBannerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gray50,
    borderWidth: 1, borderColor: Colors.gray200,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    height: 64,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    height: 64,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  quickChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  transferBtnDisabled: {
    opacity: 0.4,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 8,
  },
  doneBtnWide: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  successIcon: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
});
