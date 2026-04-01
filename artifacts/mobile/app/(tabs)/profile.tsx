import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch,
  Modal, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const DEFAULT_ACCOUNTS = [
  { bank: 'Commercial International Bank', last4: '1234', logo: 'CIB', verified: true },
  { bank: 'Banque Misr', last4: '5678', logo: 'BM', verified: true },
];

const EGYPT_BANKS = [
  { name: 'Commercial International Bank', abbr: 'CIB' },
  { name: 'Banque Misr', abbr: 'BM' },
  { name: 'National Bank of Egypt', abbr: 'NBE' },
  { name: 'QNB Al Ahli', abbr: 'QNB' },
  { name: 'HSBC Egypt', abbr: 'HSBC' },
  { name: 'Arab African Int\'l Bank', abbr: 'AAIB' },
  { name: 'Banque du Caire', abbr: 'BdC' },
  { name: 'Faisal Islamic Bank', abbr: 'FIB' },
];

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  conservative: { label: 'Conservative Saver', color: '#2980B9' },
  moderate: { label: 'Balanced Investor', color: '#27AE60' },
  growth: { label: 'Growth-Oriented', color: Colors.gold },
  aggressive: { label: 'Ambitious Investor', color: '#E74C3C' },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, language, setLanguage, setIsOnboarded, updateUser, notifications, markNotificationRead } = useApp();
  const s = useStrings();
  const [biometric, setBiometric] = useState(user?.biometricEnabled ?? false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  const [linkedAccounts, setLinkedAccounts] = useState(DEFAULT_ACCOUNTS);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [selectedBank, setSelectedBank] = useState<{ name: string; abbr: string } | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [showMilestoneInfo, setShowMilestoneInfo] = useState(false);

  const MILESTONES = [
    { icon: 'star',        label: 'First Investment', unlocked: true,  description: 'Awarded when you make your first investment into any goal portfolio.' },
    { icon: 'target',      label: 'Goal Created',     unlocked: true,  description: 'Awarded when you set up your first financial goal in the app.' },
    { icon: 'trending-up', label: '10% Return',       unlocked: false, description: 'Awarded when your total portfolio achieves a 10% cumulative return.' },
    { icon: 'calendar',    label: '30-Day Streak',    unlocked: false, description: 'Awarded for opening the app and reviewing your portfolio for 30 consecutive days.' },
    { icon: 'award',       label: 'EGP 200K Club',    unlocked: false, description: 'Awarded when your total invested portfolio value reaches EGP 200,000.' },
  ];

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;

  const riskInfo = RISK_LABELS[user?.riskProfile ?? 'moderate'];

  useEffect(() => {
    AsyncStorage.getItem('linkedAccounts').then(data => {
      if (data) setLinkedAccounts(JSON.parse(data));
    }).catch(() => {});
  }, []);

  const saveAccounts = (accounts: typeof linkedAccounts) => {
    setLinkedAccounts(accounts);
    AsyncStorage.setItem('linkedAccounts', JSON.stringify(accounts)).catch(() => {});
  };

  const openAddSheet = () => {
    setAddStep(1);
    setSelectedBank(null);
    setAccountNumber('');
    setBankSearch('');
    setShowAddSheet(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectBank = (bank: { name: string; abbr: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBank(bank);
    setAddStep(2);
  };

  const handleAddAccount = () => {
    if (!selectedBank || accountNumber.trim().length < 4) return;
    const last4 = accountNumber.trim().slice(-4);
    const newAccount = { bank: selectedBank.name, last4, logo: selectedBank.abbr, verified: false };
    saveAccounts([...linkedAccounts, newAccount]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddSheet(false);
  };

  const handleRemoveAccount = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveAccounts(linkedAccounts.filter((_, i) => i !== index));
  };

  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsOnboarded(false);
    router.replace('/onboarding');
  };

  const handleToggleBiometric = (val: boolean) => {
    setBiometric(val);
    updateUser({ biometricEnabled: val });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <NuveText variant="label" color={Colors.slate} style={{ marginBottom: 8, paddingHorizontal: 4 }}>{title}</NuveText>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const Row = ({ icon, label, value, onPress, isToggle, toggleValue, onToggle, isDestructive, showArrow = true }: {
    icon: string; label: string; value?: string; onPress?: () => void;
    isToggle?: boolean; toggleValue?: boolean; onToggle?: (v: boolean) => void;
    isDestructive?: boolean; showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={isToggle || !onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: isDestructive ? Colors.error + '15' : Colors.teal + '12' }]}>
        <Feather name={icon as any} size={17} color={isDestructive ? Colors.error : Colors.teal} />
      </View>
      <NuveText variant="body" style={{ flex: 1 }} color={isDestructive ? Colors.error : Colors.textPrimary}>{label}</NuveText>
      {isToggle && <Switch value={toggleValue} onValueChange={onToggle} trackColor={{ true: Colors.gold }} thumbColor={Colors.white} />}
      {value && !isToggle && <NuveText variant="bodySmall" color={Colors.textMuted}>{value}</NuveText>}
      {!isToggle && showArrow && <Feather name="chevron-right" size={16} color={Colors.slate} style={{ marginLeft: 6 }} />}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h2" weight="semibold" family="display">Profile</NuveText>
        <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifs(!showNotifs)}>
          <Feather name="bell" size={20} color={Colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <NuveText variant="caption" color={Colors.white} style={{ fontSize: 10 }}>{unreadCount}</NuveText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications panel */}
      {showNotifs && (
        <View style={styles.notifsPanel}>
          <NuveText variant="h3" weight="semibold" family="display" style={{ marginBottom: 12 }}>Notifications</NuveText>
          {notifications.length === 0 ? (
            <NuveText variant="body" color={Colors.textMuted} style={{ textAlign: 'center', paddingVertical: 20 }}>
              No notifications
            </NuveText>
          ) : (
            notifications.map(n => (
              <TouchableOpacity
                key={n.id}
                style={[styles.notifRow, !n.read && styles.notifRowUnread]}
                onPress={() => markNotificationRead?.(n.id)}
              >
                <View style={[styles.notifDot, { backgroundColor: n.read ? Colors.gray200 : Colors.teal }]} />
                <View style={{ flex: 1 }}>
                  <NuveText variant="bodySmall" weight={n.read ? 'regular' : 'semibold'}>{n.title}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>{n.body}</NuveText>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <NuveText variant="h1" weight="bold" color={Colors.white}>
            {(language === 'ar' ? user?.nameAr : user?.name)?.charAt(0) ?? 'A'}
          </NuveText>
        </View>
        <View style={{ flex: 1 }}>
          <NuveText variant="h2" weight="semibold" family="display">
            {language === 'ar' ? user?.nameAr : user?.name}
          </NuveText>
          <NuveText variant="caption" color={Colors.slate}>{user?.email}</NuveText>
        </View>
        <View style={[styles.kycBadge, { backgroundColor: user?.kycStatus === 'verified' ? Colors.successLight : Colors.warningLight }]}>
          <Feather name={user?.kycStatus === 'verified' ? 'check-circle' : 'clock'} size={12} color={user?.kycStatus === 'verified' ? Colors.success : Colors.warning} />
          <NuveText variant="caption" weight="semibold" color={user?.kycStatus === 'verified' ? Colors.success : Colors.warning}>
            {user?.kycStatus === 'verified' ? 'Verified' : 'Pending'}
          </NuveText>
        </View>
      </View>

      {/* Risk Profile Card */}
      <TouchableOpacity style={[styles.riskCard, { borderColor: riskInfo?.color }]} onPress={() => router.push('/risk-profiler')}>
        <View>
          <NuveText variant="label" color={Colors.slate}>{s.riskProfile}</NuveText>
          <NuveText variant="h3" weight="semibold" family="display" color={riskInfo?.color}>{riskInfo?.label}</NuveText>
          <NuveText variant="caption" family="mono" color={Colors.slate}>Score: {user?.riskScore?.toFixed(1)} / 10</NuveText>
        </View>
        <TouchableOpacity style={[styles.retakeBtn, { backgroundColor: riskInfo?.color + '20' }]} onPress={() => router.push('/risk-profiler')}>
          <NuveText variant="caption" weight="semibold" color={riskInfo?.color}>{s.retakeRisk}</NuveText>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Milestones */}
      <NuveCard style={styles.milestonesCard}>
        <View style={styles.milestonesHeader}>
          <NuveText variant="h3" weight="semibold" family="display">Milestones & Streaks</NuveText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.streakPill}>
              <Feather name="zap" size={12} color={Colors.gold} />
              <NuveText variant="caption" weight="bold" family="mono" color={Colors.gold}>{user?.streakDays} days</NuveText>
            </View>
            <TouchableOpacity
              onPress={() => setShowMilestoneInfo(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="info" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {MILESTONES.map((m, i) => (
              <View key={i} style={[styles.milestone, { opacity: m.unlocked ? 1 : 0.4 }]}>
                <View style={[styles.milestoneIcon, { backgroundColor: m.unlocked ? Colors.gold + '20' : Colors.borderLight }]}>
                  <Feather name={m.icon as any} size={20} color={m.unlocked ? Colors.gold : Colors.slate} />
                </View>
                <NuveText variant="caption" style={{ textAlign: 'center', maxWidth: 70 }} color={m.unlocked ? Colors.textPrimary : Colors.textMuted}>
                  {m.label}
                </NuveText>
              </View>
            ))}
          </View>
        </ScrollView>
      </NuveCard>

      {/* Linked Bank Accounts */}
      <View style={styles.linkedSection}>
        <View style={styles.linkedHeader}>
          <NuveText variant="label" color={Colors.textMuted} style={{ paddingHorizontal: 4 }}>LINKED BANK ACCOUNTS</NuveText>
          <TouchableOpacity style={styles.addAccountBtn} onPress={openAddSheet}>
            <Feather name="plus" size={14} color={Colors.gold} />
            <NuveText variant="bodySmall" weight="semibold" color={Colors.gold}>Add Account</NuveText>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionCard}>
          {linkedAccounts.length === 0 ? (
            <View style={styles.emptyAccounts}>
              <Feather name="credit-card" size={28} color={Colors.grayLight} />
              <NuveText variant="bodySmall" color={Colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
                No linked accounts yet.{'\n'}Tap "Add Account" to link your bank.
              </NuveText>
            </View>
          ) : (
            linkedAccounts.map((acct, i) => (
              <View key={i} style={[styles.bankRow, i < linkedAccounts.length - 1 && styles.bankRowBorder]}>
                <View style={styles.bankLogo}>
                  <NuveText variant="caption" weight="bold" color={Colors.midnight}>{acct.logo}</NuveText>
                </View>
                <View style={{ flex: 1 }}>
                  <NuveText variant="bodySmall" weight="semibold">{acct.bank}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>Account ending ···{acct.last4}</NuveText>
                </View>
                <View style={[styles.verifiedPill, !acct.verified && styles.pendingPill]}>
                  <Feather name={acct.verified ? 'check' : 'clock'} size={11} color={acct.verified ? Colors.success : Colors.warning} />
                  <NuveText variant="caption" weight="semibold" color={acct.verified ? Colors.success : Colors.warning}>
                    {acct.verified ? 'Verified' : 'Pending'}
                  </NuveText>
                </View>
                <TouchableOpacity onPress={() => handleRemoveAccount(i)} style={{ marginLeft: 8, padding: 4 }}>
                  <Feather name="x" size={15} color={Colors.slate} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Add Bank Account Modal */}
      <Modal visible={showAddSheet} animationType="slide" presentationStyle="pageSheet" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAddSheet(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              {addStep === 1 ? (
                <>
                  <View style={styles.modalTitleRow}>
                    <NuveText variant="h2" weight="semibold" family="display">Choose Your Bank</NuveText>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setShowAddSheet(false)}>
                      <Feather name="x" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Search */}
                  <View style={styles.bankSearchBar}>
                    <Feather name="search" size={16} color={Colors.textMuted} />
                    <TextInput
                      style={[styles.bankSearchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                      placeholder="Search banks…"
                      placeholderTextColor={Colors.textMuted}
                      value={bankSearch}
                      onChangeText={setBankSearch}
                      autoCorrect={false}
                    />
                    {bankSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setBankSearch('')}>
                        <Feather name="x" size={15} color={Colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
                    {EGYPT_BANKS
                      .filter(b =>
                        b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
                        b.abbr.toLowerCase().includes(bankSearch.toLowerCase())
                      )
                      .map((bank, i) => {
                        const alreadyLinked = linkedAccounts.some(a => a.logo === bank.abbr);
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[styles.bankPickerRow, alreadyLinked && styles.bankPickerRowLinked]}
                            onPress={() => !alreadyLinked && handleSelectBank(bank)}
                            activeOpacity={alreadyLinked ? 1 : 0.8}
                          >
                            <View style={styles.bankPickerLogo}>
                              <NuveText variant="caption" weight="bold" color={alreadyLinked ? Colors.textMuted : Colors.midnight}>
                                {bank.abbr}
                              </NuveText>
                            </View>
                            <NuveText variant="body" weight="semibold" style={{ flex: 1 }} color={alreadyLinked ? Colors.textMuted : Colors.textPrimary}>
                              {bank.name}
                            </NuveText>
                            {alreadyLinked ? (
                              <NuveText variant="caption" color={Colors.textMuted}>Linked</NuveText>
                            ) : (
                              <Feather name="chevron-right" size={18} color={Colors.slate} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    {EGYPT_BANKS.filter(b =>
                      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
                      b.abbr.toLowerCase().includes(bankSearch.toLowerCase())
                    ).length === 0 && (
                      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <Feather name="search" size={24} color={Colors.grayLight} />
                        <NuveText variant="bodySmall" color={Colors.textMuted} style={{ marginTop: 8 }}>
                          No banks match "{bankSearch}"
                        </NuveText>
                      </View>
                    )}
                  </ScrollView>
                </>
              ) : (
                <>
                  <View style={styles.modalTitleRow}>
                    <TouchableOpacity onPress={() => setAddStep(1)} style={styles.modalBackArrow}>
                      <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <NuveText variant="h2" weight="semibold" family="display" style={{ flex: 1 }}>Account Details</NuveText>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setShowAddSheet(false)}>
                      <Feather name="x" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.selectedBankRow}>
                    <View style={styles.bankPickerLogo}>
                      <NuveText variant="caption" weight="bold" color={Colors.midnight}>{selectedBank?.abbr}</NuveText>
                    </View>
                    <NuveText variant="body" weight="semibold">{selectedBank?.name}</NuveText>
                  </View>

                  <NuveText variant="label" color={Colors.textMuted} style={{ marginBottom: 8 }}>ACCOUNT NUMBER</NuveText>
                  <TextInput
                    style={[styles.accountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="Enter your account / IBAN number"
                    placeholderTextColor={Colors.textMuted}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                    maxLength={28}
                    autoFocus
                  />
                  <NuveText variant="caption" color={Colors.textMuted} style={{ marginBottom: 24 }}>
                    We use the last 4 digits for display only. Your full number is encrypted.
                  </NuveText>

                  <TouchableOpacity
                    style={[styles.linkBtn, accountNumber.trim().length < 4 && { opacity: 0.4 }]}
                    onPress={handleAddAccount}
                    disabled={accountNumber.trim().length < 4}
                  >
                    <Feather name="link" size={17} color={Colors.white} />
                    <NuveText variant="body" weight="bold" color={Colors.white}>Link Account</NuveText>
                  </TouchableOpacity>

                  <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginTop: 12 }}>
                    Verification may take 1–2 business days. FRA regulated.
                  </NuveText>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Section title="SECURITY">
        <Row icon="fingerprint" label={s.biometric} isToggle toggleValue={biometric} onToggle={handleToggleBiometric} />
        <Row icon="file-text" label={s.auditTrail} onPress={() => router.push('/audit-trail')} />
      </Section>

      <Section title="PREFERENCES">
        <Row
          icon="globe"
          label={s.language}
          value={language === 'ar' ? 'العربية' : 'English'}
          onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        />
        <Row
          icon="bell"
          label={s.notifications}
          isToggle
          toggleValue={notifEnabled}
          onToggle={setNotifEnabled}
        />
      </Section>

      <Section title="TOOLS">
        <Row icon="percent" label={s.zakatCalc} onPress={() => router.push('/zakat')} />
        <Row icon="file" label="Tax Reporting" onPress={() => router.push('/tax')} />
        <Row icon="users" label={s.familyPortfolio} onPress={() => router.push('/family')} />
        <Row icon="book-open" label={s.learningHub} onPress={() => router.push('/learning')} />
      </Section>

      <Section title="TRUST & COMPLIANCE">
        <Row icon="shield" label={s.fraCompliance} onPress={() => router.push('/compliance')} />
        <Row icon="message-circle" label={s.advisorChat} onPress={() => router.push('/(tabs)/advisor')} />
      </Section>

      <Section title="ACCOUNT">
        <Row icon="log-out" label={s.signOut} onPress={handleSignOut} isDestructive showArrow={false} />
      </Section>

      <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginVertical: 16 }}>
        Nuvé by Acumen Holding · v1.0.0{'\n'}FRA Licensed · License No. 897
      </NuveText>

      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Milestone info modal */}
    <Modal
      visible={showMilestoneInfo}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMilestoneInfo(false)}
    >
      <TouchableOpacity
        style={styles.milestoneOverlay}
        activeOpacity={1}
        onPress={() => setShowMilestoneInfo(false)}
      />
      <View style={styles.milestoneSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.milestonePopupHeader}>
          <View style={{ width: 32 }} />
          <NuveText variant="h3" weight="semibold" family="display" style={{ flex: 1, textAlign: 'center' }}>
            Milestones & Streaks
          </NuveText>
          <TouchableOpacity
            onPress={() => setShowMilestoneInfo(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 32, alignItems: 'flex-end' }}
          >
            <Feather name="x" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        {MILESTONES.map((m, i) => (
          <View key={i} style={styles.milestoneInfoRow}>
            <View style={[styles.milestoneInfoIcon, { backgroundColor: m.unlocked ? Colors.gold + '20' : Colors.borderLight }]}>
              <Feather name={m.icon as any} size={16} color={m.unlocked ? Colors.gold : Colors.slate} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <NuveText variant="bodySmall" weight="semibold" color={m.unlocked ? Colors.textPrimary : Colors.textMuted}>
                {m.label}{m.unlocked ? ' ✓' : ''}
              </NuveText>
              <NuveText variant="caption" color={Colors.textMuted} style={{ lineHeight: 17 }}>
                {m.description}
              </NuveText>
            </View>
          </View>
        ))}
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24 },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifsPanel: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  notifRowUnread: {
    backgroundColor: Colors.teal + '06',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  retakeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  milestoneOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  milestoneSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    gap: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.gray200,
    alignSelf: 'center', marginBottom: 20,
  },
  milestonePopupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  milestoneInfoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  milestoneInfoIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  milestonesCard: { marginBottom: 20 },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 24,
  },
  milestone: { alignItems: 'center', gap: 6, width: 80 },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedSection: { marginBottom: 20 },
  linkedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addAccountBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gold + '15', borderRadius: 24,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  emptyAccounts: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  bankRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.midnight + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingPill: {
    backgroundColor: Colors.warningLight,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 44,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.grayLight, alignSelf: 'center', marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 10,
  },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  modalBackArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  bankSearchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.gray50, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray200,
    paddingHorizontal: 12, height: 44, marginBottom: 12,
  },
  bankSearchInput: {
    flex: 1, fontSize: 15, color: Colors.textPrimary,
  },
  bankPickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, marginBottom: 6,
    backgroundColor: Colors.gray50,
    borderWidth: 1, borderColor: 'transparent',
  },
  bankPickerRowLinked: {
    opacity: 0.5,
  },
  bankPickerLogo: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.midnight + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  selectedBankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.midnight + '08', borderRadius: 12,
    padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.midnight + '20',
  },
  accountInput: {
    height: 52, borderRadius: 12,
    backgroundColor: Colors.gray50, borderWidth: 1, borderColor: Colors.gray200,
    paddingHorizontal: 14, marginBottom: 8,
    fontSize: 16, color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.teal, borderRadius: 14, paddingVertical: 15,
  },
  section: { marginBottom: 20 },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
