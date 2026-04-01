import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';

const AVAILABLE = 125000;

const BANK_ACCOUNTS = [
  { id: 'cib', bank: 'CIB', type: 'Current Account', last4: '4821', icon: 'home' },
  { id: 'banquemisr', bank: 'Banque Misr', type: 'Savings Account', last4: '3390', icon: 'home' },
];

const METHODS = [
  {
    id: 'bank', icon: 'home', color: Colors.primary,
    label: 'Bank Account', sub: 'Transfer to your linked bank account',
    fee: 0, processingTime: '1–2 business days', instant: false,
    requiresAccount: true,
  },
  {
    id: 'instapay', icon: 'zap', color: '#8B5CF6',
    label: 'InstaPay', sub: 'Send to any InstaPay registered number',
    fee: 0.1, processingTime: 'Within minutes', instant: true,
    requiresAccount: false,
  },
  {
    id: 'vodafone', icon: 'smartphone', color: '#E53E3E',
    label: 'Vodafone Cash', sub: 'Withdraw to Vodafone Cash wallet',
    fee: 0.1, processingTime: 'Instant', instant: true,
    requiresAccount: false,
  },
  {
    id: 'orange', icon: 'smartphone', color: '#DD6B20',
    label: 'Orange Cash', sub: 'Withdraw to Orange Cash wallet',
    fee: 0.1, processingTime: 'Instant', instant: true,
    requiresAccount: false,
  },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];

type Step = 'method' | 'amount' | 'review' | 'success';

function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ['method', 'amount', 'review', 'success'];
  const idx = steps.indexOf(step);
  return (
    <View style={sb.bar}>
      {steps.slice(0, 3).map((s, i) => (
        <React.Fragment key={s}>
          <View style={[sb.dot, i <= idx && sb.dotActive]}>
            {i < idx ? (
              <Feather name="check" size={10} color={Colors.white} />
            ) : (
              <NuveText variant="caption" weight="bold" color={i <= idx ? Colors.white : Colors.gray400}>
                {i + 1}
              </NuveText>
            )}
          </View>
          {i < 2 && <View style={[sb.line, i < idx && sb.lineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const sb = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.gray200, alignItems: 'center', justifyContent: 'center',
  },
  dotActive: { backgroundColor: Colors.primary },
  line: { flex: 1, height: 2, backgroundColor: Colors.gray200, marginHorizontal: 4 },
  lineActive: { backgroundColor: Colors.primary },
});

export default function WithdrawScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<typeof METHODS[0] | null>(null);
  const [selectedAccount, setSelectedAccount] = useState(BANK_ACCOUNTS[0]);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [ref] = useState(`NV-WD-${Math.floor(100000 + Math.random() * 900000)}`);

  const parsed = parseFloat(amount.replace(/,/g, '') || '0');
  const feeAmt = method ? (method.fee > 0 ? Math.round(parsed * method.fee / 100) : 0) : 0;
  const youGet = parsed - feeAmt;

  const go = (s: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s);
  };

  const canProceedFromAmount = parsed >= 100 && parsed <= AVAILABLE &&
    (!method?.requiresAccount || true) &&
    (method?.id === 'bank' || phone.replace(/\D/g, '').length >= 10);

  // ── Step 1: Choose Method ──────────────────────────────────────────────────
  if (step === 'method') {
    return (
      <View style={[styles.screen, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">Withdraw Funds</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <StepBar step="method" />

          {/* Balance pill */}
          <View style={styles.balancePill}>
            <Feather name="briefcase" size={14} color={Colors.primary} />
            <NuveText variant="bodySmall" color={Colors.textSecondary}>
              Available: <NuveText weight="bold" color={Colors.primary}>EGP {AVAILABLE.toLocaleString('en-EG')}</NuveText>
            </NuveText>
          </View>

          <NuveText variant="h2" weight="bold" style={{ marginBottom: 4 }}>Where to withdraw?</NuveText>
          <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 20 }}>
            Choose your preferred withdrawal destination.
          </NuveText>

          {METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, method?.id === m.id && styles.methodCardActive]}
              onPress={() => setMethod(m)}
              activeOpacity={0.85}
            >
              <View style={[styles.methodIcon, { backgroundColor: m.color + '18' }]}>
                <Feather name={m.icon as any} size={22} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <NuveText variant="bodySmall" weight="semibold">{m.label}</NuveText>
                  {m.instant && (
                    <View style={styles.instantPill}>
                      <NuveText variant="caption" weight="bold" color={Colors.success}>Instant</NuveText>
                    </View>
                  )}
                </View>
                <NuveText variant="caption" color={Colors.textMuted}>{m.sub}</NuveText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <NuveText variant="caption" color={Colors.textMuted}>{m.processingTime}</NuveText>
                <NuveText variant="caption" weight="semibold" color={m.fee === 0 ? Colors.success : Colors.textSecondary}>
                  {m.fee === 0 ? 'Free' : `${m.fee}% fee`}
                </NuveText>
              </View>
              {method?.id === m.id && (
                <View style={styles.checkBadge}>
                  <Feather name="check" size={12} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, { opacity: method ? 1 : 0.4 }]}
            onPress={() => method && go('amount')}
            disabled={!method}
          >
            <NuveText variant="body" weight="bold" color={Colors.white}>Continue</NuveText>
            <Feather name="arrow-right" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Step 2: Destination + Amount ───────────────────────────────────────────
  if (step === 'amount') {
    return (
      <View style={[styles.screen, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => go('method')} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">Amount & Destination</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 160 }]} showsVerticalScrollIndicator={false}>
          <StepBar step="amount" />

          {/* Method chip */}
          <View style={styles.methodChip}>
            <View style={[styles.methodIconSm, { backgroundColor: method!.color + '18' }]}>
              <Feather name={method!.icon as any} size={16} color={method!.color} />
            </View>
            <NuveText variant="bodySmall" weight="semibold" style={{ flex: 1 }}>{method!.label}</NuveText>
            <TouchableOpacity onPress={() => go('method')} style={styles.changeBtn}>
              <NuveText variant="caption" weight="semibold" color={Colors.primary}>Change</NuveText>
            </TouchableOpacity>
          </View>

            {/* Bank account selector */}
            {method!.id === 'bank' && (
              <NuveCard style={{ marginBottom: 14, gap: 8 }}>
                <NuveText variant="label" color={Colors.textMuted}>SELECT ACCOUNT</NuveText>
                {BANK_ACCOUNTS.map(acct => (
                  <TouchableOpacity
                    key={acct.id}
                    style={[styles.acctRow, selectedAccount.id === acct.id && styles.acctRowActive]}
                    onPress={() => setSelectedAccount(acct)}
                  >
                    <View style={styles.bankBadge}>
                      <NuveText variant="caption" weight="bold" color={Colors.white}>
                        {acct.bank.charAt(0)}
                      </NuveText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <NuveText variant="bodySmall" weight="semibold">{acct.bank}</NuveText>
                      <NuveText variant="caption" color={Colors.textMuted}>{acct.type} ···· {acct.last4}</NuveText>
                    </View>
                    {selectedAccount.id === acct.id && (
                      <Feather name="check-circle" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </NuveCard>
            )}

            {/* Phone / wallet number */}
            {method!.id !== 'bank' && (
              <NuveCard style={{ marginBottom: 14 }}>
                <NuveText variant="label" color={Colors.textMuted} style={{ marginBottom: 8 }}>
                  {method!.id === 'instapay' ? 'INSTAPAY NUMBER' : 'MOBILE WALLET NUMBER'}
                </NuveText>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <NuveText variant="bodySmall" weight="semibold">+20</NuveText>
                  </View>
                  <TextInput
                    style={[styles.phoneInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="01X XXXX XXXX"
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.gray300}
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={14}
                  />
                </View>
              </NuveCard>
            )}

            {/* Amount input */}
            <NuveCard style={{ marginBottom: 14 }}>
              <NuveText variant="label" color={Colors.textMuted} style={{ marginBottom: 8 }}>WITHDRAWAL AMOUNT</NuveText>
              <View style={styles.amountRow}>
                <NuveText variant="h2" weight="bold" color={Colors.textMuted} style={{ marginRight: 8 }}>EGP</NuveText>
                <TextInput
                  style={[styles.amountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.gray300}
                  value={amount}
                  onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
                />
              </View>
              <View style={styles.quickRow}>
                {QUICK_AMOUNTS.map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.quickChip, parsed === a && styles.quickChipActive]}
                    onPress={() => setAmount(String(a))}
                  >
                    <NuveText variant="caption" weight="semibold" color={parsed === a ? Colors.white : Colors.primary}>
                      {(a / 1000).toFixed(0)}K
                    </NuveText>
                  </TouchableOpacity>
                ))}
              </View>
            </NuveCard>

            {/* Fee breakdown */}
            <NuveCard style={{ gap: 8 }}>
              <View style={styles.infoRow}>
                <NuveText variant="caption" color={Colors.textSecondary}>Available balance</NuveText>
                <NuveText variant="caption" weight="semibold" color={Colors.primary}>
                  EGP {AVAILABLE.toLocaleString('en-EG')}
                </NuveText>
              </View>
              <View style={styles.infoRow}>
                <NuveText variant="caption" color={Colors.textSecondary}>Withdrawal fee</NuveText>
                <NuveText variant="caption" weight="semibold" color={method!.fee === 0 ? Colors.success : Colors.textPrimary}>
                  {method!.fee === 0 ? 'Free' : `${method!.fee}% (EGP ${feeAmt.toLocaleString('en-EG')})`}
                </NuveText>
              </View>
              <View style={styles.infoRow}>
                <NuveText variant="caption" color={Colors.textSecondary}>Processing time</NuveText>
                <NuveText variant="caption" weight="semibold" color={method!.instant ? Colors.success : Colors.warning}>
                  {method!.processingTime}
                </NuveText>
              </View>
              {parsed >= 100 && (
                <View style={[styles.infoRow, styles.totalRow]}>
                  <NuveText variant="bodySmall" weight="bold">You will receive</NuveText>
                  <NuveText variant="bodySmall" weight="bold" color={Colors.primary}>
                    EGP {youGet.toLocaleString('en-EG')}
                  </NuveText>
                </View>
              )}
            </NuveCard>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, { opacity: canProceedFromAmount ? 1 : 0.4 }]}
              onPress={() => canProceedFromAmount && go('review')}
              disabled={!canProceedFromAmount}
            >
              <NuveText variant="body" weight="bold" color={Colors.white}>Review Withdrawal</NuveText>
              <Feather name="arrow-right" size={18} color={Colors.white} />
            </TouchableOpacity>
            {parsed > 0 && parsed < 100 && (
              <NuveText variant="caption" color={Colors.error} style={{ textAlign: 'center', marginTop: 8 }}>
                Minimum withdrawal is EGP 100
              </NuveText>
            )}
            {parsed > AVAILABLE && (
              <NuveText variant="caption" color={Colors.error} style={{ textAlign: 'center', marginTop: 8 }}>
                Amount exceeds available balance
              </NuveText>
            )}
          </View>
      </View>
    );
  }

  // ── Step 3: Review & Confirm ───────────────────────────────────────────────
  if (step === 'review') {
    const destination = method!.id === 'bank'
      ? `${selectedAccount.bank} ···· ${selectedAccount.last4}`
      : phone;

    return (
      <View style={[styles.screen, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => go('amount')} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">Review</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <StepBar step="review" />

          <NuveText variant="h2" weight="bold" style={{ marginBottom: 4 }}>Confirm withdrawal</NuveText>
          <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 20 }}>
            Please review all details carefully before confirming.
          </NuveText>

          <NuveCard style={{ marginBottom: 16, gap: 0 }}>
            <View style={styles.summaryHero}>
              <View style={[styles.methodIcon, { backgroundColor: method!.color + '18' }]}>
                <Feather name={method!.icon as any} size={22} color={method!.color} />
              </View>
              <View>
                <NuveText variant="h1" weight="bold" color={Colors.primary}>
                  EGP {parsed.toLocaleString('en-EG')}
                </NuveText>
                <NuveText variant="body" color={Colors.textSecondary}>via {method!.label}</NuveText>
              </View>
            </View>

            <View style={styles.divider} />

            {[
              { label: 'From', value: 'Nuvé Wallet', icon: 'briefcase' },
              { label: 'To', value: destination, icon: method!.icon },
              { label: 'Withdrawal fee', value: method!.fee === 0 ? 'Free' : `EGP ${feeAmt.toLocaleString('en-EG')}`, icon: 'percent' },
              { label: 'You receive', value: `EGP ${youGet.toLocaleString('en-EG')}`, icon: 'arrow-up-circle' },
              { label: 'Remaining balance', value: `EGP ${(AVAILABLE - parsed).toLocaleString('en-EG')}`, icon: 'pie-chart' },
              { label: 'Processing time', value: method!.processingTime, icon: 'clock' },
              { label: 'Reference', value: ref, icon: 'hash' },
            ].map(row => (
              <View key={row.label} style={styles.reviewRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name={row.icon as any} size={14} color={Colors.textMuted} />
                  <NuveText variant="bodySmall" color={Colors.textSecondary}>{row.label}</NuveText>
                </View>
                <NuveText variant="bodySmall" weight="semibold">{row.value}</NuveText>
              </View>
            ))}
          </NuveCard>

          {/* Warning for large amounts */}
          {parsed >= 50000 && (
            <View style={styles.warningNote}>
              <Feather name="alert-triangle" size={16} color={Colors.warning} />
              <NuveText variant="caption" color={Colors.textSecondary} style={{ flex: 1 }}>
                Large withdrawals above EGP 50,000 may require additional verification per FRA regulations.
              </NuveText>
            </View>
          )}

          <View style={styles.securityNote}>
            <Feather name="shield" size={16} color={Colors.success} />
            <NuveText variant="caption" color={Colors.textSecondary} style={{ flex: 1 }}>
              Secured by 256-bit encryption. FRA-regulated — license #897.
            </NuveText>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.error }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              go('success');
            }}
          >
            <Feather name="lock" size={16} color={Colors.white} />
            <NuveText variant="body" weight="bold" color={Colors.white}>Confirm Withdrawal</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => go('amount')}>
            <NuveText variant="body" weight="semibold" color={Colors.textSecondary}>Edit amount</NuveText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Step 4: Success ────────────────────────────────────────────────────────
  const destination = method!.id === 'bank'
    ? `${selectedAccount.bank} ···· ${selectedAccount.last4}`
    : phone;

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      <View style={styles.successContainer}>
        <View style={styles.successRing}>
          <View style={styles.successInner}>
            <Feather name="check" size={40} color={Colors.success} />
          </View>
        </View>

        <NuveText variant="h1" weight="bold" style={{ textAlign: 'center', marginBottom: 8 }}>
          Withdrawal {method!.instant ? 'Successful!' : 'Initiated!'}
        </NuveText>
        <NuveText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
          {method!.instant
            ? `EGP ${youGet.toLocaleString('en-EG')} is on its way to ${destination}.`
            : `Your withdrawal will arrive in ${method!.processingTime}.`}
        </NuveText>

        <NuveCard style={styles.receipt}>
          {[
            { label: 'Amount withdrawn', value: `EGP ${parsed.toLocaleString('en-EG')}`, highlight: true },
            { label: 'You receive', value: `EGP ${youGet.toLocaleString('en-EG')}`, highlight: true },
            { label: 'Destination', value: destination },
            { label: 'Method', value: method!.label },
            { label: 'Status', value: method!.instant ? 'Completed' : 'Processing', status: true },
            { label: 'Remaining balance', value: `EGP ${(AVAILABLE - parsed).toLocaleString('en-EG')}` },
            { label: 'Date & time', value: new Date().toLocaleDateString('en-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
            { label: 'Reference', value: ref },
          ].map(r => (
            <View key={r.label} style={styles.receiptRow}>
              <NuveText variant="caption" color={Colors.textMuted}>{r.label}</NuveText>
              <NuveText
                variant="bodySmall"
                weight={r.highlight ? 'bold' : 'semibold'}
                color={r.highlight ? Colors.primary : r.status ? (method!.instant ? Colors.success : Colors.warning) : Colors.textPrimary}
              >
                {r.value}
              </NuveText>
            </View>
          ))}
        </NuveCard>

        <TouchableOpacity style={[styles.btn, { marginTop: 24, width: '100%' }]} onPress={() => router.replace('/(tabs)/wallet')}>
          <NuveText variant="body" weight="bold" color={Colors.white}>Back to Wallet</NuveText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ghostBtn, { marginTop: 8 }]} onPress={() => router.replace('/(tabs)')}>
          <NuveText variant="body" color={Colors.textSecondary}>Go to Home</NuveText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.gray100,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ghostBtn: {
    borderRadius: 14, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  // Balance pill
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '0C', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16,
    alignSelf: 'flex-start',
  },

  // Method cards
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  methodCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '04' },
  methodIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodIconSm: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  instantPill: {
    backgroundColor: Colors.successLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  checkBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginLeft: 6,
  },

  // Amount / destination
  methodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12, padding: 10, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  changeBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: Colors.primary + '12', borderRadius: 8,
  },
  acctRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'transparent', backgroundColor: Colors.gray50,
    marginBottom: 6,
  },
  acctRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '05' },
  bankBadge: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryCode: {
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.gray100, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  phoneInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: Colors.textPrimary,
    height: 44,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, minHeight: 56 },
  amountInput: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: Colors.textPrimary,
    height: 56,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickChip: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.primary + '10', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '20',
  },
  quickChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: {
    borderTopWidth: 1, borderTopColor: Colors.gray100,
    paddingTop: 10, marginTop: 4,
  },

  // Review
  summaryHero: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 16,
  },
  divider: { height: 1, backgroundColor: Colors.gray100, marginBottom: 14 },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.successLight, borderRadius: 12, padding: 12, marginTop: 12,
  },
  warningNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.warningLight, borderRadius: 12, padding: 12, marginBottom: 10,
  },

  // Success
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  successRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.successLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successInner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.successLight,
    alignItems: 'center', justifyContent: 'center',
  },
  receipt: { width: '100%', gap: 0 },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
});
