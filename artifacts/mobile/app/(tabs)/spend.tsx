import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { MarketSwitcherSheet, getMarketOption } from '@/components/MarketSwitcherSheet';
import { AllocationBars } from '@/components/AllocationDonut';
import {
  SPEND_CATEGORIES,
  CARD_TRANSACTIONS,
  SPEND_MONTH_TOTAL,
  SPEND_MONTH_LABEL,
} from '@/constants/spendData';

const P2P_CONTACTS = [
  { name: 'Sara Ahmed',    phone: '+20 100 123 4567', initials: 'SA', color: '#7C3AED' },
  { name: 'Karim Nabil',  phone: '+20 112 987 6543', initials: 'KN', color: '#0891B2' },
  { name: 'Nour Hassan',  phone: '+20 101 555 7890', initials: 'NH', color: '#059669' },
  { name: 'Omar Farouk',  phone: '+20 100 321 0987', initials: 'OF', color: '#D97706' },
  { name: 'Laila Mostafa',phone: '+20 115 444 2222', initials: 'LM', color: '#DB2777' },
  { name: 'Youssef Ali',  phone: '+20 100 777 3311', initials: 'YA', color: '#EA580C' },
];

export default function SpendScreen() {
  const insets = useSafeAreaInsets();
  const { user, notifications, selectedMarket, setSelectedMarket } = useApp();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2 | 3 | 4>(1);
  const [transferType, setTransferType] = useState<'wallet' | 'p2p' | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [p2pRecipient, setP2pRecipient] = useState<{ name: string; phone: string; initials: string; color: string } | null>(null);
  const [p2pSearch, setP2pSearch] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showMarketSheet, setShowMarketSheet] = useState(false);

  // Card Settings state
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [csStep, setCsStep] = useState<'main' | 'change-pin' | 'pin-success' | 'report-lost' | 'report-success' | 'limit'>('main');
  const [cardFrozen, setCardFrozen] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [contactlessEnabled, setContactlessEnabled] = useState(true);
  const [internationalEnabled, setInternationalEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState('5000');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const closeCardSettings = () => {
    setShowCardSettings(false);
    setCsStep('main');
    setNewPin('');
    setConfirmPin('');
  };

  const closeTransfer = () => {
    setShowTransfer(false);
    setTransferStep(1);
    setTransferType(null);
    setTransferAmount('');
    setP2pRecipient(null);
    setP2pSearch('');
  };

  const confirmTransfer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (transferType === 'p2p') {
      setTransferStep(4);
    } else {
      setTransferStep(3);
    }
  };

  const handleTransfer = (destination: 'wallet' | 'p2p') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTransferType(destination);
    setTransferStep(2);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <NuveText variant="h1" weight="light" family="display">Spend</NuveText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.marketBtn} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="bold" color={Colors.midnight}>{selectedMarket}</NuveText>
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

      {/* Pre-paid Card Visual */}
      <View style={styles.cardVisual}>
        <View style={styles.cardBg}>
          {/* Card decorative circles */}
          <View style={styles.cardCircle1} />
          <View style={styles.cardCircle2} />

          <View style={styles.cardTop}>
            <NuveText variant="h2" weight="light" family="display" color={Colors.white}>Nuvé</NuveText>
            <View style={styles.cardChip}>
              <Feather name="cpu" size={16} color={Colors.gold} />
            </View>
          </View>

          <View style={styles.cardBalanceSection}>
            <NuveText variant="caption" color={Colors.white + 'AA'}>Card Balance</NuveText>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? (
                <NuveText variant="display" weight="light" family="display" color={Colors.white}>EGP 3,200</NuveText>
              ) : (
                <NuveText variant="display" weight="light" family="display" color={Colors.white}>•••••••</NuveText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.cardBottom}>
            <NuveText variant="caption" weight="semibold" color={Colors.white + 'CC'} style={{ letterSpacing: 2 }}>
              ···· ···· ···· 4421
            </NuveText>
            <NuveText variant="caption" color={Colors.white + 'AA'}>
              {user?.name?.toUpperCase()}
            </NuveText>
          </View>
        </View>
      </View>

      {/* Card CTAs */}
      <View style={styles.ctaGrid}>
        {[
          { icon: 'plus-circle', label: 'Top-up', color: Colors.success, action: () => router.push('/deposit') },
          { icon: 'arrow-up-circle', label: 'Withdraw', color: Colors.warning, action: () => router.push('/withdraw') },
          { icon: 'send', label: 'Transfer', color: Colors.teal, action: () => setShowTransfer(true) },
          { icon: 'settings', label: 'Settings', color: Colors.textMuted, action: () => setShowCardSettings(true) },
        ].map((cta, i) => (
          <TouchableOpacity key={i} style={styles.ctaItem} onPress={cta.action} activeOpacity={0.75}>
            <View style={[styles.ctaIcon, { backgroundColor: cta.color + '15' }]}>
              <Feather name={cta.icon as any} size={22} color={cta.color} />
            </View>
            <NuveText variant="caption" weight="semibold" color={Colors.slate} style={{ textAlign: 'center' }}>
              {cta.label}
            </NuveText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spending Summary */}
      <NuveCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <NuveText variant="caption" color={Colors.textMuted}>This Month</NuveText>
            <NuveText variant="h2" weight="regular" family="display" color={Colors.error}>
              -EGP {SPEND_MONTH_TOTAL.toLocaleString('en-EG')}
            </NuveText>
          </View>
          <View style={styles.monthBadge}>
            <NuveText variant="caption" weight="semibold" color={Colors.teal}>{SPEND_MONTH_LABEL}</NuveText>
          </View>
        </View>

        {/* Category allocation bar + legend */}
        <AllocationBars data={SPEND_CATEGORIES} />

        {/* CTA */}
        <TouchableOpacity
          style={styles.breakdownBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/spend-breakdown');
          }}
          activeOpacity={0.8}
        >
          <NuveText variant="bodySmall" weight="semibold" color={Colors.teal}>
            View Full Breakdown
          </NuveText>
          <Feather name="arrow-right" size={14} color={Colors.teal} />
        </TouchableOpacity>
      </NuveCard>

      {/* Card Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" weight="regular" family="display">Card Transactions</NuveText>
          <NuveText variant="caption" color={Colors.textMuted}>{CARD_TRANSACTIONS.length} items</NuveText>
        </View>
        {CARD_TRANSACTIONS.map((tx, i) => (
          <View key={i} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: Colors.midnight + '10' }]}>
              <Feather name={tx.icon as any} size={16} color={Colors.midnight} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{tx.merchant}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>{tx.category} · {tx.date}</NuveText>
            </View>
            <NuveText variant="bodySmall" weight="semibold" color={Colors.error}>-{tx.amount}</NuveText>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />

      {/* Transfer Modal */}
      <Modal visible={showTransfer} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeTransfer} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {/* ── STEP 1: Destination choice ── */}
            {transferStep === 1 && (
              <>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginBottom: 8 }}>Transfer Funds</NuveText>
                <NuveText variant="body" color={Colors.slate} style={{ marginBottom: 24 }}>
                  Where would you like to send funds from your card?
                </NuveText>

                <TouchableOpacity style={styles.transferOption} onPress={() => handleTransfer('wallet')}>
                  <View style={[styles.transferIcon, { backgroundColor: Colors.teal + '15' }]}>
                    <Feather name="briefcase" size={22} color={Colors.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NuveText variant="body" weight="semibold">Transfer to Wallet</NuveText>
                    <NuveText variant="caption" color={Colors.textMuted}>Move funds to invest or withdraw</NuveText>
                  </View>
                  <Feather name="chevron-right" size={18} color={Colors.slate} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.transferOption} onPress={() => handleTransfer('p2p')}>
                  <View style={[styles.transferIcon, { backgroundColor: Colors.gold + '15' }]}>
                    <Feather name="users" size={22} color={Colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NuveText variant="body" weight="semibold">Transfer P2P</NuveText>
                    <NuveText variant="caption" color={Colors.textMuted}>Send to another Nuvé user</NuveText>
                  </View>
                  <Feather name="chevron-right" size={18} color={Colors.slate} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeTransfer}>
                  <NuveText variant="body" weight="semibold" color={Colors.textMuted}>Cancel</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2a: Wallet — Amount entry ── */}
            {transferStep === 2 && transferType === 'wallet' && (
              <>
                <View style={styles.transferModalHeader}>
                  <TouchableOpacity style={styles.backCircle} onPress={() => setTransferStep(1)}>
                    <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Enter Amount</NuveText>
                </View>

                <View style={[styles.dirBanner, { borderColor: Colors.teal + '30', backgroundColor: Colors.teal + '08' }]}>
                  <View style={styles.dirBannerSide}>
                    <Feather name="credit-card" size={14} color={Colors.textMuted} />
                    <NuveText variant="bodySmall" weight="semibold" color={Colors.teal}>Nuvé Card</NuveText>
                  </View>
                  <Feather name="arrow-right" size={16} color={Colors.teal} />
                  <View style={styles.dirBannerSide}>
                    <Feather name="briefcase" size={14} color={Colors.textMuted} />
                    <NuveText variant="bodySmall" weight="semibold" color={Colors.teal}>Wallet</NuveText>
                  </View>
                </View>

                <NuveText variant="caption" color={Colors.textMuted} style={{ marginBottom: 6 }}>
                  Available: <NuveText variant="caption" weight="bold" color={Colors.textPrimary}>EGP 12,800.00</NuveText>
                </NuveText>

                <View style={styles.amountInputWrap}>
                  <NuveText variant="h3" weight="semibold" color={Colors.textMuted}>EGP</NuveText>
                  <TextInput
                    style={[styles.amountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="0.00"
                    placeholderTextColor={Colors.grayLight}
                    keyboardType="numeric"
                    value={transferAmount}
                    onChangeText={v => setTransferAmount(v.replace(/[^0-9.]/g, ''))}
                    autoFocus
                  />
                </View>

                <View style={styles.quickChipsRow}>
                  {['500', '1,000', '2,000', '5,000'].map(amt => {
                    const raw = amt.replace(',', '');
                    const active = transferAmount === raw;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.quickChip, active && styles.quickChipActive]}
                        onPress={() => { setTransferAmount(raw); Haptics.selectionAsync(); }}
                      >
                        <NuveText variant="caption" weight="semibold" color={active ? Colors.white : Colors.teal}>
                          {amt}
                        </NuveText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

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

            {/* ── STEP 3a: Wallet — Success ── */}
            {transferStep === 3 && transferType === 'wallet' && (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <Feather name="check" size={32} color={Colors.white} />
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 8 }}>Transfer Sent!</NuveText>
                <NuveText variant="body" color={Colors.slate} style={{ textAlign: 'center', marginBottom: 6 }}>
                  EGP {parseFloat(transferAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </NuveText>
                <NuveText variant="bodySmall" color={Colors.textMuted} style={{ textAlign: 'center', marginBottom: 28 }}>
                  Nuvé Card → Wallet · Instant
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide]} onPress={closeTransfer}>
                  <NuveText variant="body" weight="bold" color={Colors.white}>Done</NuveText>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2b: P2P — Recipient picker ── */}
            {transferStep === 2 && transferType === 'p2p' && (() => {
              const q = p2pSearch.toLowerCase();
              const filtered = P2P_CONTACTS.filter(c =>
                c.name.toLowerCase().includes(q) || c.phone.includes(q)
              );
              return (
                <>
                  <View style={styles.transferModalHeader}>
                    <TouchableOpacity style={styles.backCircle} onPress={() => setTransferStep(1)}>
                      <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <NuveText variant="h2" weight="regular" family="display">Send to</NuveText>
                  </View>

                  {/* Search bar */}
                  <View style={styles.p2pSearch}>
                    <Feather name="search" size={16} color={Colors.textMuted} />
                    <TextInput
                      style={[styles.p2pSearchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                      placeholder="Name or phone number"
                      placeholderTextColor={Colors.grayLight}
                      value={p2pSearch}
                      onChangeText={setP2pSearch}
                      autoFocus
                    />
                    {p2pSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setP2pSearch('')}>
                        <Feather name="x-circle" size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Contacts list */}
                  <NuveText variant="caption" color={Colors.textMuted} style={{ marginBottom: 12 }}>
                    {q ? 'Search results' : 'Recent contacts'}
                  </NuveText>

                  {filtered.map(c => (
                    <TouchableOpacity
                      key={c.phone}
                      style={[styles.p2pContact, p2pRecipient?.phone === c.phone && styles.p2pContactSelected]}
                      onPress={() => { setP2pRecipient(c); Haptics.selectionAsync(); }}
                    >
                      <View style={[styles.p2pAvatar, { backgroundColor: c.color }]}>
                        <NuveText variant="caption" weight="bold" color={Colors.white}>{c.initials}</NuveText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <NuveText variant="body" weight="semibold">{c.name}</NuveText>
                        <NuveText variant="caption" color={Colors.textMuted}>{c.phone}</NuveText>
                      </View>
                      {p2pRecipient?.phone === c.phone && (
                        <View style={styles.p2pCheckBadge}>
                          <Feather name="check" size={14} color={Colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}

                  {filtered.length === 0 && (
                    <View style={styles.p2pEmpty}>
                      <Feather name="user-x" size={28} color={Colors.grayLight} />
                      <NuveText variant="bodySmall" color={Colors.textMuted} style={{ marginTop: 8 }}>
                        No Nuvé users found
                      </NuveText>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.transferBtn, { marginTop: 20 }, !p2pRecipient && styles.transferBtnDisabled]}
                    onPress={() => { if (p2pRecipient) setTransferStep(3); }}
                    activeOpacity={0.85}
                  >
                    <NuveText variant="body" weight="bold" color={Colors.white}>
                      {p2pRecipient ? `Continue with ${p2pRecipient.name.split(' ')[0]}` : 'Select a recipient'}
                    </NuveText>
                  </TouchableOpacity>
                </>
              );
            })()}

            {/* ── STEP 3b: P2P — Amount entry ── */}
            {transferStep === 3 && transferType === 'p2p' && (
              <>
                <View style={styles.transferModalHeader}>
                  <TouchableOpacity style={styles.backCircle} onPress={() => setTransferStep(2)}>
                    <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Enter Amount</NuveText>
                </View>

                {/* Recipient banner */}
                <View style={styles.p2pRecipientBanner}>
                  <View style={[styles.p2pAvatarSm, { backgroundColor: p2pRecipient?.color ?? Colors.teal }]}>
                    <NuveText variant="caption" weight="bold" color={Colors.white}>
                      {p2pRecipient?.initials}
                    </NuveText>
                  </View>
                  <View>
                    <NuveText variant="body" weight="semibold">{p2pRecipient?.name}</NuveText>
                    <NuveText variant="caption" color={Colors.textMuted}>{p2pRecipient?.phone}</NuveText>
                  </View>
                  <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setTransferStep(2)}>
                    <NuveText variant="caption" color={Colors.gold} weight="semibold">Change</NuveText>
                  </TouchableOpacity>
                </View>

                <NuveText variant="caption" color={Colors.textMuted} style={{ marginBottom: 6 }}>
                  Available: <NuveText variant="caption" weight="bold" color={Colors.textPrimary}>EGP 12,800.00</NuveText>
                </NuveText>

                <View style={styles.amountInputWrap}>
                  <NuveText variant="h3" weight="semibold" color={Colors.textMuted}>EGP</NuveText>
                  <TextInput
                    style={[styles.amountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="0.00"
                    placeholderTextColor={Colors.grayLight}
                    keyboardType="numeric"
                    value={transferAmount}
                    onChangeText={v => setTransferAmount(v.replace(/[^0-9.]/g, ''))}
                    autoFocus
                  />
                </View>

                <View style={styles.quickChipsRow}>
                  {['200', '500', '1,000', '2,000'].map(amt => {
                    const raw = amt.replace(',', '');
                    const active = transferAmount === raw;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.quickChip, active && styles.quickChipActive]}
                        onPress={() => { setTransferAmount(raw); Haptics.selectionAsync(); }}
                      >
                        <NuveText variant="caption" weight="semibold" color={active ? Colors.white : Colors.teal}>
                          {amt}
                        </NuveText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Note / memo field */}
                <TextInput
                  style={[styles.p2pNote, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={Colors.grayLight}
                  value={undefined}
                  maxLength={80}
                />

                <TouchableOpacity
                  style={[styles.transferBtn, { marginTop: 16 }, (!transferAmount || parseFloat(transferAmount) <= 0) && styles.transferBtnDisabled]}
                  onPress={confirmTransfer}
                  activeOpacity={0.85}
                >
                  <Feather name="send" size={18} color={Colors.white} />
                  <NuveText variant="body" weight="bold" color={Colors.white}>Send Now</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 4: P2P — Success ── */}
            {transferStep === 4 && transferType === 'p2p' && (
              <View style={styles.successState}>
                <View style={[styles.p2pAvatar, { width: 72, height: 72, borderRadius: 36, backgroundColor: p2pRecipient?.color ?? Colors.success }]}>
                  <NuveText variant="h3" weight="regular" family="display" color={Colors.white}>{p2pRecipient?.initials}</NuveText>
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 4 }}>Money Sent!</NuveText>
                <NuveText variant="body" color={Colors.slate} style={{ marginBottom: 4 }}>
                  EGP {parseFloat(transferAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </NuveText>
                <NuveText variant="bodySmall" color={Colors.textMuted} style={{ marginBottom: 28, textAlign: 'center' }}>
                  Sent to {p2pRecipient?.name} · Instant
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide]} onPress={closeTransfer}>
                  <NuveText variant="body" weight="bold" color={Colors.white}>Done</NuveText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Card Settings Modal ── */}
      <Modal visible={showCardSettings} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeCardSettings} />
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={styles.modalHandle} />

            {/* ── MAIN settings page ── */}
            {csStep === 'main' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.csHeader}>
                  <NuveText variant="h2" weight="regular" family="display">Card Settings</NuveText>
                  <TouchableOpacity onPress={closeCardSettings}>
                    <Feather name="x" size={22} color={Colors.slate} />
                  </TouchableOpacity>
                </View>

                {/* Freeze card */}
                <View style={[styles.csSection, cardFrozen && styles.csFreezeActive]}>
                  <View style={[styles.csRowIcon, { backgroundColor: cardFrozen ? Colors.error + '20' : Colors.info + '15' }]}>
                    <Feather name={cardFrozen ? 'lock' : 'unlock'} size={20} color={cardFrozen ? Colors.error : Colors.info} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NuveText variant="body" weight="semibold" color={cardFrozen ? Colors.error : Colors.textPrimary}>
                      {cardFrozen ? 'Card Frozen' : 'Card Active'}
                    </NuveText>
                    <NuveText variant="caption" color={Colors.textMuted}>
                      {cardFrozen ? 'All transactions are blocked' : 'Freeze to block all transactions instantly'}
                    </NuveText>
                  </View>
                  <Switch
                    value={!cardFrozen}
                    onValueChange={v => { setCardFrozen(!v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                    trackColor={{ false: Colors.error + '60', true: Colors.success + '60' }}
                    thumbColor={cardFrozen ? Colors.error : Colors.success}
                  />
                </View>

                {/* Payment Controls */}
                <NuveText variant="caption" weight="semibold" color={Colors.textMuted} style={styles.csSectionLabel}>
                  PAYMENT CONTROLS
                </NuveText>

                <View style={styles.csCard}>
                  {/* Online Payments */}
                  <View style={styles.csRow}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.teal + '15' }]}>
                      <Feather name="globe" size={18} color={Colors.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Online Payments</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>E-commerce & card-not-present</NuveText>
                    </View>
                    <Switch
                      value={onlineEnabled}
                      onValueChange={v => { setOnlineEnabled(v); Haptics.selectionAsync(); }}
                      trackColor={{ false: Colors.grayLight, true: Colors.teal + '60' }}
                      thumbColor={onlineEnabled ? Colors.teal : Colors.slate}
                    />
                  </View>

                  <View style={styles.csDivider} />

                  {/* Contactless */}
                  <View style={styles.csRow}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.gold + '15' }]}>
                      <Feather name="wifi" size={18} color={Colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Contactless (NFC)</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>Tap-to-pay at terminals</NuveText>
                    </View>
                    <Switch
                      value={contactlessEnabled}
                      onValueChange={v => { setContactlessEnabled(v); Haptics.selectionAsync(); }}
                      trackColor={{ false: Colors.grayLight, true: Colors.teal + '60' }}
                      thumbColor={contactlessEnabled ? Colors.teal : Colors.slate}
                    />
                  </View>

                  <View style={styles.csDivider} />

                  {/* International */}
                  <View style={styles.csRow}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.chart3 + '20' }]}>
                      <Feather name="map-pin" size={18} color={Colors.chart3} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">International Transactions</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>Use card outside Egypt</NuveText>
                    </View>
                    <Switch
                      value={internationalEnabled}
                      onValueChange={v => { setInternationalEnabled(v); Haptics.selectionAsync(); }}
                      trackColor={{ false: Colors.grayLight, true: Colors.teal + '60' }}
                      thumbColor={internationalEnabled ? Colors.teal : Colors.slate}
                    />
                  </View>
                </View>

                {/* Limits */}
                <NuveText variant="caption" weight="semibold" color={Colors.textMuted} style={styles.csSectionLabel}>
                  LIMITS
                </NuveText>

                <View style={styles.csCard}>
                  <TouchableOpacity style={styles.csRow} onPress={() => setCsStep('limit')}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.warning + '15' }]}>
                      <Feather name="sliders" size={18} color={Colors.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Daily Spending Limit</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>
                        EGP {parseInt(dailyLimit).toLocaleString()} per day
                      </NuveText>
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.slate} />
                  </TouchableOpacity>
                </View>

                {/* Security */}
                <NuveText variant="caption" weight="semibold" color={Colors.textMuted} style={styles.csSectionLabel}>
                  SECURITY
                </NuveText>

                <View style={styles.csCard}>
                  <TouchableOpacity style={styles.csRow} onPress={() => setCsStep('change-pin')}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.success + '15' }]}>
                      <Feather name="key" size={18} color={Colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Change PIN</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>Update your 4-digit card PIN</NuveText>
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.slate} />
                  </TouchableOpacity>

                  <View style={styles.csDivider} />

                  <TouchableOpacity style={styles.csRow} onPress={() => setCsStep('report-lost')}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.error + '15' }]}>
                      <Feather name="alert-triangle" size={18} color={Colors.error} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold" color={Colors.error}>Report Lost / Stolen</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>Block card and request replacement</NuveText>
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.error + '80'} />
                  </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            {/* ── CHANGE PIN ── */}
            {csStep === 'change-pin' && (
              <>
                <View style={styles.csHeader}>
                  <TouchableOpacity style={styles.backCircle} onPress={() => setCsStep('main')}>
                    <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Change PIN</NuveText>
                </View>

                <NuveText variant="body" color={Colors.slate} style={{ marginBottom: 24 }}>
                  Enter a new 4-digit PIN for your Nuvé card.
                </NuveText>

                <NuveText variant="caption" weight="semibold" color={Colors.textMuted} style={{ marginBottom: 6 }}>
                  NEW PIN
                </NuveText>
                <View style={styles.pinInputRow}>
                  <TextInput
                    style={[styles.pinInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    value={newPin}
                    onChangeText={v => setNewPin(v.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                    placeholder="••••"
                    placeholderTextColor={Colors.grayLight}
                    autoFocus
                  />
                  <View style={styles.pinDots}>
                    {[0,1,2,3].map(i => (
                      <View key={i} style={[styles.pinDot, newPin.length > i && styles.pinDotFilled]} />
                    ))}
                  </View>
                </View>

                <NuveText variant="caption" weight="semibold" color={Colors.textMuted} style={{ marginBottom: 6, marginTop: 20 }}>
                  CONFIRM PIN
                </NuveText>
                <View style={styles.pinInputRow}>
                  <TextInput
                    style={[styles.pinInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    value={confirmPin}
                    onChangeText={v => setConfirmPin(v.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                    placeholder="••••"
                    placeholderTextColor={Colors.grayLight}
                  />
                  <View style={styles.pinDots}>
                    {[0,1,2,3].map(i => (
                      <View key={i} style={[
                        styles.pinDot,
                        confirmPin.length > i && (confirmPin[i] === newPin[i] ? styles.pinDotFilled : styles.pinDotError),
                      ]} />
                    ))}
                  </View>
                </View>

                {confirmPin.length === 4 && confirmPin !== newPin && (
                  <NuveText variant="caption" color={Colors.error} style={{ marginTop: 8 }}>
                    PINs do not match
                  </NuveText>
                )}

                <TouchableOpacity
                  style={[styles.transferBtn, { marginTop: 32 },
                    (newPin.length < 4 || confirmPin !== newPin) && styles.transferBtnDisabled,
                  ]}
                  onPress={() => {
                    if (newPin.length === 4 && confirmPin === newPin) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setCsStep('pin-success');
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={18} color={Colors.white} />
                  <NuveText variant="body" weight="bold" color={Colors.white}>Save New PIN</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── PIN SUCCESS ── */}
            {csStep === 'pin-success' && (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <Feather name="check" size={32} color={Colors.white} />
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 8 }}>PIN Updated!</NuveText>
                <NuveText variant="body" color={Colors.slate} style={{ textAlign: 'center', marginBottom: 28 }}>
                  Your new PIN is active. Use it at ATMs and card terminals.
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide]} onPress={closeCardSettings}>
                  <NuveText variant="body" weight="bold" color={Colors.white}>Done</NuveText>
                </TouchableOpacity>
              </View>
            )}

            {/* ── REPORT LOST / STOLEN ── */}
            {csStep === 'report-lost' && (
              <>
                <View style={styles.csHeader}>
                  <TouchableOpacity style={styles.backCircle} onPress={() => setCsStep('main')}>
                    <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Report Card</NuveText>
                </View>

                <View style={styles.csReportWarning}>
                  <View style={styles.csReportIcon}>
                    <Feather name="alert-triangle" size={32} color={Colors.error} />
                  </View>
                  <NuveText variant="h3" weight="regular" family="display" color={Colors.error} style={{ marginTop: 16, marginBottom: 8 }}>
                    Report Lost or Stolen?
                  </NuveText>
                  <NuveText variant="body" color={Colors.slate} style={{ textAlign: 'center' }}>
                    Your card will be{' '}
                    <NuveText weight="bold" color={Colors.error}>immediately blocked</NuveText>
                    {' '}and a replacement will be couriered to your registered address within 3–5 business days.
                  </NuveText>
                </View>

                <View style={styles.csReportList}>
                  {['All active sessions will be logged', 'Your transaction history is preserved', 'Existing scheduled payments are paused'].map((item, i) => (
                    <View key={i} style={styles.csReportItem}>
                      <Feather name="info" size={14} color={Colors.textMuted} />
                      <NuveText variant="caption" color={Colors.slate}>{item}</NuveText>
                    </View>
                  ))}
                </View>

                <View style={styles.csReportButtons}>
                  <TouchableOpacity style={styles.csReportCancel} onPress={() => setCsStep('main')}>
                    <NuveText variant="body" weight="semibold" color={Colors.slate}>Cancel</NuveText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.csReportConfirm}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      setCardFrozen(true);
                      setCsStep('report-success');
                    }}
                  >
                    <Feather name="alert-triangle" size={16} color={Colors.white} />
                    <NuveText variant="body" weight="bold" color={Colors.white}>Report Card</NuveText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── REPORT SUCCESS ── */}
            {csStep === 'report-success' && (
              <View style={styles.successState}>
                <View style={[styles.successIcon, { backgroundColor: Colors.error }]}>
                  <Feather name="shield" size={32} color={Colors.white} />
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 8 }}>Card Reported</NuveText>
                <NuveText variant="body" color={Colors.slate} style={{ textAlign: 'center', marginBottom: 6 }}>
                  Your card has been blocked immediately.
                </NuveText>
                <NuveText variant="bodySmall" color={Colors.textMuted} style={{ textAlign: 'center', marginBottom: 28 }}>
                  Replacement card arriving in 3–5 business days.
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide]} onPress={closeCardSettings}>
                  <NuveText variant="body" weight="bold" color={Colors.white}>Done</NuveText>
                </TouchableOpacity>
              </View>
            )}

            {/* ── DAILY LIMIT ── */}
            {csStep === 'limit' && (
              <>
                <View style={styles.csHeader}>
                  <TouchableOpacity style={styles.backCircle} onPress={() => setCsStep('main')}>
                    <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Daily Limit</NuveText>
                </View>

                <NuveText variant="body" color={Colors.slate} style={{ marginBottom: 20 }}>
                  Set the maximum you can spend each day across all transactions.
                </NuveText>

                <View style={styles.amountInputWrap}>
                  <NuveText variant="h3" weight="semibold" color={Colors.textMuted}>EGP</NuveText>
                  <TextInput
                    style={[styles.amountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    value={dailyLimit}
                    onChangeText={v => setDailyLimit(v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.grayLight}
                    autoFocus
                  />
                </View>

                <View style={styles.quickChipsRow}>
                  {['1,000', '2,500', '5,000', '10,000'].map(amt => {
                    const raw = amt.replace(',', '');
                    const active = dailyLimit === raw;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.quickChip, active && styles.quickChipActive]}
                        onPress={() => { setDailyLimit(raw); Haptics.selectionAsync(); }}
                      >
                        <NuveText variant="caption" weight="semibold" color={active ? Colors.white : Colors.teal}>
                          {amt}
                        </NuveText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.csLimitNote}>
                  <Feather name="info" size={14} color={Colors.info} />
                  <NuveText variant="caption" color={Colors.slate}>
                    Maximum allowed limit: <NuveText weight="semibold" color={Colors.teal}>EGP 20,000</NuveText>
                  </NuveText>
                </View>

                <TouchableOpacity
                  style={[styles.transferBtn, { marginTop: 24 }, (!dailyLimit || parseInt(dailyLimit) === 0) && styles.transferBtnDisabled]}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setCsStep('main');
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={18} color={Colors.white} />
                  <NuveText variant="body" weight="bold" color={Colors.white}>Save Limit</NuveText>
                </TouchableOpacity>
              </>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.midnight + '10',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.midnight + '20',
  },
  profileBtn: { position: 'relative' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 0, right: 0,
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  cardVisual: { marginBottom: 24 },
  cardBg: {
    backgroundColor: Colors.midnight,
    borderRadius: 20,
    padding: 24,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
    gap: 0,
  },
  cardCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.white + '08',
    top: -60,
    right: -40,
  },
  cardCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.gold + '15',
    bottom: -50,
    left: -30,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardChip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.gold + '30',
    borderWidth: 1,
    borderColor: Colors.gold + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBalanceSection: { flex: 1, justifyContent: 'center', gap: 4 },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  ctaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  ctaItem: { alignItems: 'center', gap: 8, flex: 1 },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: { marginBottom: 24, gap: 16 },
  breakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.teal + '10',
    borderWidth: 1,
    borderColor: Colors.teal + '20',
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthBadge: {
    backgroundColor: Colors.teal + '12',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
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
    borderBottomColor: Colors.borderLight,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    backgroundColor: Colors.grayLight,
    alignSelf: 'center',
    marginBottom: 24,
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  transferIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  transferModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
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
    borderBottomWidth: 2,
    borderBottomColor: Colors.teal,
    paddingBottom: 8,
    marginBottom: 24,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  quickChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.teal + '40',
    backgroundColor: Colors.teal + '08',
  },
  quickChipActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 16,
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
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnWide: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  p2pSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  p2pSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  p2pContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  p2pContactSelected: {
    backgroundColor: Colors.teal + '10',
    borderWidth: 1,
    borderColor: Colors.teal + '30',
  },
  p2pAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  p2pAvatarSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  p2pCheckBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  p2pEmpty: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  p2pRecipientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  p2pNote: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  // ── Card Settings ──
  csHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  csSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.gray50,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  csFreezeActive: {
    backgroundColor: Colors.error + '08',
    borderColor: Colors.error + '30',
  },
  csSectionLabel: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  csCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
    overflow: 'hidden',
  },
  csRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  csRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  csDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 72,
  },
  pinInputRow: {
    position: 'relative',
    height: 52,
    justifyContent: 'center',
    marginBottom: 4,
  },
  pinInput: {
    position: 'absolute',
    width: '100%',
    height: 52,
    fontSize: 24,
    color: 'transparent',
    zIndex: 1,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 2,
    borderBottomColor: Colors.teal,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.grayLight,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  pinDotError: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  csReportWarning: {
    alignItems: 'center',
    backgroundColor: Colors.error + '08',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.error + '20',
    padding: 24,
    marginBottom: 20,
  },
  csReportIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  csReportList: {
    gap: 12,
    marginBottom: 32,
  },
  csReportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  csReportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  csReportCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: Colors.borderLight,
  },
  csReportConfirm: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: Colors.error,
  },
  csLimitNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
});
