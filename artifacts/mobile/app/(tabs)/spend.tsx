import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
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
  const C = useColors();
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
    <View style={[styles.screen, { paddingTop: topPad + 8, backgroundColor: C.background }]}>
      {/* Header — fixed */}
      <View style={styles.header}>
        <NuveText variant="h1" weight="light" family="display">Spend</NuveText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.marketBtn, { backgroundColor: C.textPrimary + '10', borderColor: C.textPrimary + '20' }]} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="bold" color={C.textPrimary}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={'#FAFAF8'}>
                {user?.name?.charAt(0) ?? 'A'}
              </NuveText>
            </View>
            {unreadCount > 0 && <View style={[styles.notifDot, { backgroundColor: C.error, borderColor: C.background }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

      {/* Pre-paid Card Visual */}
      <View style={styles.cardVisual}>
        <View style={styles.cardBg}>
          {/* Card decorative circles */}
          <View style={styles.cardCircle1} />
          <View style={[styles.cardCircle2, { backgroundColor: C.gold + '15' }]} />

          <View style={styles.cardTop}>
            <NuveText variant="h2" weight="light" family="display" color={'#FAFAF8'}>Nuvé</NuveText>
            <View style={styles.mastercardLogo}>
              <View style={[styles.mcCircle, { backgroundColor: '#EB001B' }]} />
              <View style={[styles.mcCircle, styles.mcCircleRight, { backgroundColor: '#F79E1B' }]} />
            </View>
          </View>

          <View style={styles.cardBalanceSection}>
            <NuveText variant="caption" color={'#FAFAF8' + 'AA'}>Card Balance</NuveText>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? (
                <NuveText variant="display" weight="light" family="display" color={'#FAFAF8'}>EGP 3,200</NuveText>
              ) : (
                <NuveText variant="display" weight="light" family="display" color={'#FAFAF8'}>•••••••</NuveText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.cardBottom}>
            <NuveText variant="caption" weight="semibold" color={'#FAFAF8' + 'CC'} style={{ letterSpacing: 2 }}>
              ···· ···· ···· 4421
            </NuveText>
            <NuveText variant="caption" color={'#FAFAF8' + 'AA'}>
              {user?.name?.toUpperCase()}
            </NuveText>
          </View>
        </View>
      </View>

      {/* Card CTAs */}
      <View style={styles.ctaGrid}>
        {[
          { icon: 'plus-circle', label: 'Top-up', color: C.success, action: () => router.push('/deposit') },
          { icon: 'arrow-down-circle', label: 'Withdraw', color: C.warning, action: () => router.push('/withdraw') },
          { icon: 'send', label: 'Transfer', color: C.teal, action: () => setShowTransfer(true) },
          { icon: 'settings', label: 'Settings', color: C.gold, action: () => setShowCardSettings(true) },
        ].map((cta, i) => (
          <TouchableOpacity key={i} style={styles.ctaItem} onPress={cta.action} activeOpacity={0.75}>
            <View style={[styles.ctaIcon, { backgroundColor: cta.color + '15' }]}>
              <Feather name={cta.icon as any} size={22} color={cta.color} />
            </View>
            <NuveText variant="caption" weight="semibold" color={C.slate} style={{ textAlign: 'center' }}>
              {cta.label}
            </NuveText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spending Summary */}
      <NuveCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <NuveText variant="caption" color={C.textMuted}>This Month</NuveText>
            <NuveText variant="h2" weight="regular" family="display" color={C.error}>
              -EGP {SPEND_MONTH_TOTAL.toLocaleString('en-EG')}
            </NuveText>
          </View>
          <View style={[styles.monthBadge, { backgroundColor: C.teal + '12' }]}>
            <NuveText variant="caption" weight="semibold" color={C.teal}>{SPEND_MONTH_LABEL}</NuveText>
          </View>
        </View>

        {/* Category allocation bar + legend */}
        <AllocationBars data={SPEND_CATEGORIES} />

        {/* CTA */}
        <TouchableOpacity
          style={[styles.breakdownBtn, { backgroundColor: C.teal + '10', borderColor: C.teal + '20' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/spend-breakdown');
          }}
          activeOpacity={0.8}
        >
          <NuveText variant="bodySmall" weight="semibold" color={C.teal}>
            View Full Breakdown
          </NuveText>
          <Feather name="arrow-right" size={14} color={C.teal} />
        </TouchableOpacity>
      </NuveCard>

      {/* Card Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" weight="regular" family="display">Card Transactions</NuveText>
          <TouchableOpacity onPress={() => router.push('/card-transactions')}>
            <NuveText variant="caption" weight="semibold" color={C.teal}>See all</NuveText>
          </TouchableOpacity>
        </View>
        {CARD_TRANSACTIONS.slice(0, 4).map((tx, i) => (
          <View key={i} style={[styles.txRow, { borderBottomColor: C.borderLight }]}>
            <View style={[styles.txIcon, { backgroundColor: C.textPrimary + '10' }]}>
              <Feather name={tx.icon as any} size={16} color={C.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{tx.merchant}</NuveText>
              <NuveText variant="caption" color={C.textMuted}>{tx.category} · {tx.date}</NuveText>
            </View>
            <NuveText variant="bodySmall" weight="semibold" color={C.error}>-{tx.amount}</NuveText>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />

      {/* Transfer Modal */}
      <Modal visible={showTransfer} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeTransfer} />
          <View style={[styles.modalSheet, { backgroundColor: C.white }]}>
            <View style={[styles.modalHandle, { backgroundColor: C.grayLight }]} />

            {/* ── STEP 1: Destination choice ── */}
            {transferStep === 1 && (
              <>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginBottom: 8 }}>Transfer Funds</NuveText>
                <NuveText variant="body" color={C.slate} style={{ marginBottom: 24 }}>
                  Where would you like to send funds from your card?
                </NuveText>

                <TouchableOpacity style={[styles.transferOption, { backgroundColor: C.background, borderColor: C.borderLight }]} onPress={() => handleTransfer('wallet')}>
                  <View style={[styles.transferIcon, { backgroundColor: C.teal + '15' }]}>
                    <Feather name="briefcase" size={22} color={C.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NuveText variant="body" weight="semibold">Transfer to Wallet</NuveText>
                    <NuveText variant="caption" color={C.textMuted}>Move funds to invest or withdraw</NuveText>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.slate} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.transferOption, { backgroundColor: C.background, borderColor: C.borderLight }]} onPress={() => handleTransfer('p2p')}>
                  <View style={[styles.transferIcon, { backgroundColor: C.gold + '15' }]}>
                    <Feather name="users" size={22} color={C.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NuveText variant="body" weight="semibold">Transfer P2P</NuveText>
                    <NuveText variant="caption" color={C.textMuted}>Send to another Nuvé user</NuveText>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.slate} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeTransfer}>
                  <NuveText variant="body" weight="semibold" color={C.textMuted}>Cancel</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2a: Wallet — Amount entry ── */}
            {transferStep === 2 && transferType === 'wallet' && (
              <>
                <View style={styles.transferModalHeader}>
                  <TouchableOpacity style={[styles.backCircle, { backgroundColor: C.borderLight }]} onPress={() => setTransferStep(1)}>
                    <Feather name="arrow-left" size={18} color={C.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Enter Amount</NuveText>
                </View>

                <View style={[styles.dirBanner, { borderColor: C.teal + '30', backgroundColor: C.teal + '08' }]}>
                  <View style={styles.dirBannerSide}>
                    <Feather name="credit-card" size={14} color={C.textMuted} />
                    <NuveText variant="bodySmall" weight="semibold" color={C.teal}>Nuvé Card</NuveText>
                  </View>
                  <Feather name="arrow-right" size={16} color={C.teal} />
                  <View style={styles.dirBannerSide}>
                    <Feather name="briefcase" size={14} color={C.textMuted} />
                    <NuveText variant="bodySmall" weight="semibold" color={C.teal}>Wallet</NuveText>
                  </View>
                </View>

                <NuveText variant="caption" color={C.textMuted} style={{ marginBottom: 6 }}>
                  Available: <NuveText variant="caption" weight="bold" color={C.textPrimary}>EGP 12,800.00</NuveText>
                </NuveText>

                <View style={[styles.amountInputWrap, { borderBottomColor: C.teal }]}>
                  <NuveText variant="h3" weight="semibold" color={C.textMuted}>EGP</NuveText>
                  <TextInput
                    style={[styles.amountInput, { color: C.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="0.00"
                    placeholderTextColor={C.grayLight}
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
                        style={[styles.quickChip, { borderColor: C.teal + '40', backgroundColor: C.teal + '08' }, active && { backgroundColor: C.teal, borderColor: C.teal }]}
                        onPress={() => { setTransferAmount(raw); Haptics.selectionAsync(); }}
                      >
                        <NuveText variant="caption" weight="semibold" color={active ? '#FAFAF8' : C.teal}>
                          {amt}
                        </NuveText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.transferBtn, { backgroundColor: C.teal }, (!transferAmount || parseFloat(transferAmount) <= 0) && styles.transferBtnDisabled]}
                  onPress={confirmTransfer}
                  activeOpacity={0.85}
                >
                  <Feather name="send" size={18} color={'#FAFAF8'} />
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Transfer Now</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 3a: Wallet — Success ── */}
            {transferStep === 3 && transferType === 'wallet' && (
              <View style={styles.successState}>
                <View style={[styles.successIcon, { backgroundColor: C.success }]}>
                  <Feather name="check" size={32} color={'#FAFAF8'} />
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 8 }}>Transfer Sent!</NuveText>
                <NuveText variant="body" color={C.slate} style={{ textAlign: 'center', marginBottom: 6 }}>
                  EGP {parseFloat(transferAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </NuveText>
                <NuveText variant="bodySmall" color={C.textMuted} style={{ textAlign: 'center', marginBottom: 28 }}>
                  Nuvé Card → Wallet · Instant
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide, { backgroundColor: C.teal }]} onPress={closeTransfer}>
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Done</NuveText>
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
                    <TouchableOpacity style={[styles.backCircle, { backgroundColor: C.borderLight }]} onPress={() => setTransferStep(1)}>
                      <Feather name="arrow-left" size={18} color={C.textPrimary} />
                    </TouchableOpacity>
                    <NuveText variant="h2" weight="regular" family="display">Send to</NuveText>
                  </View>

                  {/* Search bar */}
                  <View style={[styles.p2pSearch, { backgroundColor: C.gray50, borderColor: C.borderLight }]}>
                    <Feather name="search" size={16} color={C.textMuted} />
                    <TextInput
                      style={[styles.p2pSearchInput, { color: C.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                      placeholder="Name or phone number"
                      placeholderTextColor={C.grayLight}
                      value={p2pSearch}
                      onChangeText={setP2pSearch}
                      autoFocus
                    />
                    {p2pSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setP2pSearch('')}>
                        <Feather name="x-circle" size={16} color={C.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Contacts list */}
                  <NuveText variant="caption" color={C.textMuted} style={{ marginBottom: 12 }}>
                    {q ? 'Search results' : 'Recent contacts'}
                  </NuveText>

                  {filtered.map(c => (
                    <TouchableOpacity
                      key={c.phone}
                      style={[styles.p2pContact, p2pRecipient?.phone === c.phone && { backgroundColor: C.teal + '10', borderWidth: 1, borderColor: C.teal + '30' }]}
                      onPress={() => { setP2pRecipient(c); Haptics.selectionAsync(); }}
                    >
                      <View style={[styles.p2pAvatar, { backgroundColor: c.color }]}>
                        <NuveText variant="caption" weight="bold" color={'#FAFAF8'}>{c.initials}</NuveText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <NuveText variant="body" weight="semibold">{c.name}</NuveText>
                        <NuveText variant="caption" color={C.textMuted}>{c.phone}</NuveText>
                      </View>
                      {p2pRecipient?.phone === c.phone && (
                        <View style={[styles.p2pCheckBadge, { backgroundColor: C.teal }]}>
                          <Feather name="check" size={14} color={'#FAFAF8'} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}

                  {filtered.length === 0 && (
                    <View style={styles.p2pEmpty}>
                      <Feather name="user-x" size={28} color={C.grayLight} />
                      <NuveText variant="bodySmall" color={C.textMuted} style={{ marginTop: 8 }}>
                        No Nuvé users found
                      </NuveText>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.transferBtn, { marginTop: 20, backgroundColor: C.teal }, !p2pRecipient && styles.transferBtnDisabled]}
                    onPress={() => { if (p2pRecipient) setTransferStep(3); }}
                    activeOpacity={0.85}
                  >
                    <NuveText variant="body" weight="bold" color={'#FAFAF8'}>
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
                  <TouchableOpacity style={[styles.backCircle, { backgroundColor: C.borderLight }]} onPress={() => setTransferStep(2)}>
                    <Feather name="arrow-left" size={18} color={C.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Enter Amount</NuveText>
                </View>

                {/* Recipient banner */}
                <View style={[styles.p2pRecipientBanner, { backgroundColor: C.gray50, borderColor: C.borderLight }]}>
                  <View style={[styles.p2pAvatarSm, { backgroundColor: p2pRecipient?.color ?? C.teal }]}>
                    <NuveText variant="caption" weight="bold" color={'#FAFAF8'}>
                      {p2pRecipient?.initials}
                    </NuveText>
                  </View>
                  <View>
                    <NuveText variant="body" weight="semibold">{p2pRecipient?.name}</NuveText>
                    <NuveText variant="caption" color={C.textMuted}>{p2pRecipient?.phone}</NuveText>
                  </View>
                  <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setTransferStep(2)}>
                    <NuveText variant="caption" color={C.gold} weight="semibold">Change</NuveText>
                  </TouchableOpacity>
                </View>

                <NuveText variant="caption" color={C.textMuted} style={{ marginBottom: 6 }}>
                  Available: <NuveText variant="caption" weight="bold" color={C.textPrimary}>EGP 12,800.00</NuveText>
                </NuveText>

                <View style={[styles.amountInputWrap, { borderBottomColor: C.teal }]}>
                  <NuveText variant="h3" weight="semibold" color={C.textMuted}>EGP</NuveText>
                  <TextInput
                    style={[styles.amountInput, { color: C.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="0.00"
                    placeholderTextColor={C.grayLight}
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
                        style={[styles.quickChip, { borderColor: C.teal + '40', backgroundColor: C.teal + '08' }, active && { backgroundColor: C.teal, borderColor: C.teal }]}
                        onPress={() => { setTransferAmount(raw); Haptics.selectionAsync(); }}
                      >
                        <NuveText variant="caption" weight="semibold" color={active ? '#FAFAF8' : C.teal}>
                          {amt}
                        </NuveText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Note / memo field */}
                <TextInput
                  style={[styles.p2pNote, { backgroundColor: C.gray50, borderColor: C.borderLight, color: C.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={C.grayLight}
                  value={undefined}
                  maxLength={80}
                />

                <TouchableOpacity
                  style={[styles.transferBtn, { marginTop: 16, backgroundColor: C.teal }, (!transferAmount || parseFloat(transferAmount) <= 0) && styles.transferBtnDisabled]}
                  onPress={confirmTransfer}
                  activeOpacity={0.85}
                >
                  <Feather name="send" size={18} color={'#FAFAF8'} />
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Send Now</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 4: P2P — Success ── */}
            {transferStep === 4 && transferType === 'p2p' && (
              <View style={styles.successState}>
                <View style={[styles.p2pAvatar, { width: 72, height: 72, borderRadius: 36, backgroundColor: p2pRecipient?.color ?? C.success }]}>
                  <NuveText variant="h3" weight="regular" family="display" color={'#FAFAF8'}>{p2pRecipient?.initials}</NuveText>
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 4 }}>Money Sent!</NuveText>
                <NuveText variant="body" color={C.slate} style={{ marginBottom: 4 }}>
                  EGP {parseFloat(transferAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </NuveText>
                <NuveText variant="bodySmall" color={C.textMuted} style={{ marginBottom: 28, textAlign: 'center' }}>
                  Sent to {p2pRecipient?.name} · Instant
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide, { backgroundColor: C.teal }]} onPress={closeTransfer}>
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Done</NuveText>
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
          <View style={[styles.modalSheet, { maxHeight: '90%', backgroundColor: C.white }]}>
            <View style={[styles.modalHandle, { backgroundColor: C.grayLight }]} />

            {/* ── MAIN settings page ── */}
            {csStep === 'main' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.csHeader}>
                  <NuveText variant="h2" weight="regular" family="display">Card Settings</NuveText>
                  <TouchableOpacity onPress={closeCardSettings}>
                    <Feather name="x" size={22} color={C.slate} />
                  </TouchableOpacity>
                </View>

                {/* Freeze card */}
                <View style={[styles.csSection, { backgroundColor: C.gray50, borderColor: C.borderLight }, cardFrozen && { backgroundColor: C.error + '08', borderColor: C.error + '30' }]}>
                  <View style={[styles.csRowIcon, { backgroundColor: cardFrozen ? C.error + '20' : C.info + '15' }]}>
                    <Feather name={cardFrozen ? 'lock' : 'unlock'} size={20} color={cardFrozen ? C.error : C.info} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NuveText variant="body" weight="semibold" color={cardFrozen ? C.error : C.textPrimary}>
                      {cardFrozen ? 'Card Frozen' : 'Card Active'}
                    </NuveText>
                    <NuveText variant="caption" color={C.textMuted}>
                      {cardFrozen ? 'All transactions are blocked' : 'Freeze to block all transactions instantly'}
                    </NuveText>
                  </View>
                  <Switch
                    value={!cardFrozen}
                    onValueChange={v => { setCardFrozen(!v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                    trackColor={{ false: C.error + '60', true: C.success + '60' }}
                    thumbColor={cardFrozen ? C.error : C.success}
                  />
                </View>

                {/* Payment Controls */}
                <NuveText variant="caption" weight="semibold" color={C.textMuted} style={styles.csSectionLabel}>
                  PAYMENT CONTROLS
                </NuveText>

                <View style={[styles.csCard, { backgroundColor: C.white, borderColor: C.borderLight }]}>
                  {/* Online Payments */}
                  <View style={styles.csRow}>
                    <View style={[styles.csRowIcon, { backgroundColor: C.teal + '15' }]}>
                      <Feather name="globe" size={18} color={C.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Online Payments</NuveText>
                      <NuveText variant="caption" color={C.textMuted}>E-commerce & card-not-present</NuveText>
                    </View>
                    <Switch
                      value={onlineEnabled}
                      onValueChange={v => { setOnlineEnabled(v); Haptics.selectionAsync(); }}
                      trackColor={{ false: C.grayLight, true: C.teal + '60' }}
                      thumbColor={onlineEnabled ? C.teal : C.slate}
                    />
                  </View>

                  <View style={[styles.csDivider, { backgroundColor: C.borderLight }]} />

                  {/* Contactless */}
                  <View style={styles.csRow}>
                    <View style={[styles.csRowIcon, { backgroundColor: C.gold + '15' }]}>
                      <Feather name="wifi" size={18} color={C.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Contactless (NFC)</NuveText>
                      <NuveText variant="caption" color={C.textMuted}>Tap-to-pay at terminals</NuveText>
                    </View>
                    <Switch
                      value={contactlessEnabled}
                      onValueChange={v => { setContactlessEnabled(v); Haptics.selectionAsync(); }}
                      trackColor={{ false: C.grayLight, true: C.teal + '60' }}
                      thumbColor={contactlessEnabled ? C.teal : C.slate}
                    />
                  </View>

                  <View style={[styles.csDivider, { backgroundColor: C.borderLight }]} />

                  {/* International */}
                  <View style={styles.csRow}>
                    <View style={[styles.csRowIcon, { backgroundColor: Colors.chart3 + '20' }]}>
                      <Feather name="map-pin" size={18} color={Colors.chart3} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">International Transactions</NuveText>
                      <NuveText variant="caption" color={C.textMuted}>Use card outside Egypt</NuveText>
                    </View>
                    <Switch
                      value={internationalEnabled}
                      onValueChange={v => { setInternationalEnabled(v); Haptics.selectionAsync(); }}
                      trackColor={{ false: C.grayLight, true: C.teal + '60' }}
                      thumbColor={internationalEnabled ? C.teal : C.slate}
                    />
                  </View>
                </View>

                {/* Limits */}
                <NuveText variant="caption" weight="semibold" color={C.textMuted} style={styles.csSectionLabel}>
                  LIMITS
                </NuveText>

                <View style={[styles.csCard, { backgroundColor: C.white, borderColor: C.borderLight }]}>
                  <TouchableOpacity style={styles.csRow} onPress={() => setCsStep('limit')}>
                    <View style={[styles.csRowIcon, { backgroundColor: C.warning + '15' }]}>
                      <Feather name="sliders" size={18} color={C.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Daily Spending Limit</NuveText>
                      <NuveText variant="caption" color={C.textMuted}>
                        EGP {parseInt(dailyLimit).toLocaleString()} per day
                      </NuveText>
                    </View>
                    <Feather name="chevron-right" size={18} color={C.slate} />
                  </TouchableOpacity>
                </View>

                {/* Security */}
                <NuveText variant="caption" weight="semibold" color={C.textMuted} style={styles.csSectionLabel}>
                  SECURITY
                </NuveText>

                <View style={[styles.csCard, { backgroundColor: C.white, borderColor: C.borderLight }]}>
                  <TouchableOpacity style={styles.csRow} onPress={() => setCsStep('change-pin')}>
                    <View style={[styles.csRowIcon, { backgroundColor: C.success + '15' }]}>
                      <Feather name="key" size={18} color={C.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold">Change PIN</NuveText>
                      <NuveText variant="caption" color={C.textMuted}>Update your 4-digit card PIN</NuveText>
                    </View>
                    <Feather name="chevron-right" size={18} color={C.slate} />
                  </TouchableOpacity>

                  <View style={[styles.csDivider, { backgroundColor: C.borderLight }]} />

                  <TouchableOpacity style={styles.csRow} onPress={() => setCsStep('report-lost')}>
                    <View style={[styles.csRowIcon, { backgroundColor: C.error + '15' }]}>
                      <Feather name="alert-triangle" size={18} color={C.error} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="body" weight="semibold" color={C.error}>Report Lost / Stolen</NuveText>
                      <NuveText variant="caption" color={C.textMuted}>Block card and request replacement</NuveText>
                    </View>
                    <Feather name="chevron-right" size={18} color={C.error + '80'} />
                  </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            {/* ── CHANGE PIN ── */}
            {csStep === 'change-pin' && (
              <>
                <View style={styles.csHeader}>
                  <TouchableOpacity style={[styles.backCircle, { backgroundColor: C.borderLight }]} onPress={() => setCsStep('main')}>
                    <Feather name="arrow-left" size={18} color={C.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Change PIN</NuveText>
                </View>

                <NuveText variant="body" color={C.slate} style={{ marginBottom: 24 }}>
                  Enter a new 4-digit PIN for your Nuvé card.
                </NuveText>

                <NuveText variant="caption" weight="semibold" color={C.textMuted} style={{ marginBottom: 6 }}>
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
                    placeholderTextColor={C.grayLight}
                    autoFocus
                  />
                  <View style={[styles.pinDots, { borderBottomColor: C.teal }]}>
                    {[0,1,2,3].map(i => (
                      <View key={i} style={[styles.pinDot, { borderColor: C.grayLight }, newPin.length > i && { backgroundColor: C.teal, borderColor: C.teal }]} />
                    ))}
                  </View>
                </View>

                <NuveText variant="caption" weight="semibold" color={C.textMuted} style={{ marginBottom: 6, marginTop: 20 }}>
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
                    placeholderTextColor={C.grayLight}
                  />
                  <View style={[styles.pinDots, { borderBottomColor: C.teal }]}>
                    {[0,1,2,3].map(i => (
                      <View key={i} style={[
                        styles.pinDot,
                        { borderColor: C.grayLight },
                        confirmPin.length > i && (confirmPin[i] === newPin[i] ? { backgroundColor: C.teal, borderColor: C.teal } : { backgroundColor: C.error, borderColor: C.error }),
                      ]} />
                    ))}
                  </View>
                </View>

                {confirmPin.length === 4 && confirmPin !== newPin && (
                  <NuveText variant="caption" color={C.error} style={{ marginTop: 8 }}>
                    PINs do not match
                  </NuveText>
                )}

                <TouchableOpacity
                  style={[styles.transferBtn, { marginTop: 32, backgroundColor: C.teal },
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
                  <Feather name="check" size={18} color={'#FAFAF8'} />
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Save New PIN</NuveText>
                </TouchableOpacity>
              </>
            )}

            {/* ── PIN SUCCESS ── */}
            {csStep === 'pin-success' && (
              <View style={styles.successState}>
                <View style={[styles.successIcon, { backgroundColor: C.success }]}>
                  <Feather name="check" size={32} color={'#FAFAF8'} />
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 8 }}>PIN Updated!</NuveText>
                <NuveText variant="body" color={C.slate} style={{ textAlign: 'center', marginBottom: 28 }}>
                  Your new PIN is active. Use it at ATMs and card terminals.
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide, { backgroundColor: C.teal }]} onPress={closeCardSettings}>
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Done</NuveText>
                </TouchableOpacity>
              </View>
            )}

            {/* ── REPORT LOST / STOLEN ── */}
            {csStep === 'report-lost' && (
              <>
                <View style={styles.csHeader}>
                  <TouchableOpacity style={[styles.backCircle, { backgroundColor: C.borderLight }]} onPress={() => setCsStep('main')}>
                    <Feather name="arrow-left" size={18} color={C.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Report Card</NuveText>
                </View>

                <View style={[styles.csReportWarning, { backgroundColor: C.error + '08', borderColor: C.error + '20' }]}>
                  <View style={[styles.csReportIcon, { backgroundColor: C.error + '15' }]}>
                    <Feather name="alert-triangle" size={32} color={C.error} />
                  </View>
                  <NuveText variant="h3" weight="regular" family="display" color={C.error} style={{ marginTop: 16, marginBottom: 8 }}>
                    Report Lost or Stolen?
                  </NuveText>
                  <NuveText variant="body" color={C.slate} style={{ textAlign: 'center' }}>
                    Your card will be{' '}
                    <NuveText weight="bold" color={C.error}>immediately blocked</NuveText>
                    {' '}and a replacement will be couriered to your registered address within 3–5 business days.
                  </NuveText>
                </View>

                <View style={styles.csReportList}>
                  {['All active sessions will be logged', 'Your transaction history is preserved', 'Existing scheduled payments are paused'].map((item, i) => (
                    <View key={i} style={styles.csReportItem}>
                      <Feather name="info" size={14} color={C.textMuted} />
                      <NuveText variant="caption" color={C.slate}>{item}</NuveText>
                    </View>
                  ))}
                </View>

                <View style={styles.csReportButtons}>
                  <TouchableOpacity style={[styles.csReportCancel, { backgroundColor: C.borderLight }]} onPress={() => setCsStep('main')}>
                    <NuveText variant="body" weight="semibold" color={C.slate}>Cancel</NuveText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.csReportConfirm, { backgroundColor: C.error }]}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      setCardFrozen(true);
                      setCsStep('report-success');
                    }}
                  >
                    <Feather name="alert-triangle" size={16} color={'#FAFAF8'} />
                    <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Report Card</NuveText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── REPORT SUCCESS ── */}
            {csStep === 'report-success' && (
              <View style={styles.successState}>
                <View style={[styles.successIcon, { backgroundColor: C.error }]}>
                  <Feather name="shield" size={32} color={'#FAFAF8'} />
                </View>
                <NuveText variant="h2" weight="regular" family="display" style={{ marginTop: 20, marginBottom: 8 }}>Card Reported</NuveText>
                <NuveText variant="body" color={C.slate} style={{ textAlign: 'center', marginBottom: 6 }}>
                  Your card has been blocked immediately.
                </NuveText>
                <NuveText variant="bodySmall" color={C.textMuted} style={{ textAlign: 'center', marginBottom: 28 }}>
                  Replacement card arriving in 3–5 business days.
                </NuveText>
                <TouchableOpacity style={[styles.transferBtn, styles.doneBtnWide, { backgroundColor: C.teal }]} onPress={closeCardSettings}>
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Done</NuveText>
                </TouchableOpacity>
              </View>
            )}

            {/* ── DAILY LIMIT ── */}
            {csStep === 'limit' && (
              <>
                <View style={styles.csHeader}>
                  <TouchableOpacity style={[styles.backCircle, { backgroundColor: C.borderLight }]} onPress={() => setCsStep('main')}>
                    <Feather name="arrow-left" size={18} color={C.textPrimary} />
                  </TouchableOpacity>
                  <NuveText variant="h2" weight="regular" family="display">Daily Limit</NuveText>
                </View>

                <NuveText variant="body" color={C.slate} style={{ marginBottom: 20 }}>
                  Set the maximum you can spend each day across all transactions.
                </NuveText>

                <View style={[styles.amountInputWrap, { borderBottomColor: C.teal }]}>
                  <NuveText variant="h3" weight="semibold" color={C.textMuted}>EGP</NuveText>
                  <TextInput
                    style={[styles.amountInput, { color: C.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    value={dailyLimit}
                    onChangeText={v => setDailyLimit(v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={C.grayLight}
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
                        style={[styles.quickChip, { borderColor: C.teal + '40', backgroundColor: C.teal + '08' }, active && { backgroundColor: C.teal, borderColor: C.teal }]}
                        onPress={() => { setDailyLimit(raw); Haptics.selectionAsync(); }}
                      >
                        <NuveText variant="caption" weight="semibold" color={active ? '#FAFAF8' : C.teal}>
                          {amt}
                        </NuveText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={[styles.csLimitNote, { backgroundColor: C.infoLight }]}>
                  <Feather name="info" size={14} color={C.info} />
                  <NuveText variant="caption" color={C.slate}>
                    Maximum allowed limit: <NuveText weight="semibold" color={C.teal}>EGP 20,000</NuveText>
                  </NuveText>
                </View>

                <TouchableOpacity
                  style={[styles.transferBtn, { marginTop: 24, backgroundColor: C.teal }, (!dailyLimit || parseInt(dailyLimit) === 0) && styles.transferBtnDisabled]}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setCsStep('main');
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={18} color={'#FAFAF8'} />
                  <NuveText variant="body" weight="bold" color={'#FAFAF8'}>Save Limit</NuveText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      </ScrollView>

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
  screen: { flex: 1 },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1,
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
    borderWidth: 1.5,
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
    backgroundColor: '#FFFFFF08',
    top: -60,
    right: -40,
  },
  cardCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastercardLogo: {
    flexDirection: 'row',
    width: 40,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mcCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    opacity: 0.9,
  },
  mcCircleRight: {
    marginLeft: -8,
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
    borderWidth: 1,
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthBadge: {
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    paddingBottom: 8,
    marginBottom: 24,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
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
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  p2pSearchInput: {
    flex: 1,
    fontSize: 15,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  p2pNote: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  csSectionLabel: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  csCard: {
    borderRadius: 20,
    borderWidth: 1,
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
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  csReportWarning: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
  },
  csReportIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  },
  csReportConfirm: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  csLimitNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
});
