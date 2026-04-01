import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Share,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';

const METHODS = [
  {
    id: 'instapay', icon: 'zap', color: '#8B5CF6',
    label: 'InstaPay', labelAr: 'إنستاباي',
    sub: 'Connect via InstaPay registered number',
    limit: 'EGP 50,000 / day', fee: 0, instant: true,
    badge: 'Instant',
  },
  {
    id: 'vodafone', icon: 'smartphone', color: '#E53E3E',
    label: 'Vodafone Cash', labelAr: 'فودافون كاش',
    sub: 'Top up from your Vodafone Cash wallet',
    limit: 'EGP 30,000 / day', fee: 0, instant: true,
    badge: 'Instant',
  },
  {
    id: 'orange', icon: 'smartphone', color: '#DD6B20',
    label: 'Orange Cash', labelAr: 'أورانج كاش',
    sub: 'Top up from your Orange Cash wallet',
    limit: 'EGP 20,000 / day', fee: 0, instant: true,
    badge: 'Instant',
  },
  {
    id: 'etisalat', icon: 'smartphone', color: '#38A169',
    label: 'e& Cash', labelAr: 'إي آند كاش',
    sub: 'Top up from your e& wallet',
    limit: 'EGP 20,000 / day', fee: 0, instant: true,
    badge: 'Instant',
  },
  {
    id: 'meeza', icon: 'credit-card', color: Colors.info,
    label: 'Meeza Card', labelAr: 'ميزة',
    sub: 'Pay securely with your Meeza debit card',
    limit: 'EGP 100,000 / day', fee: 0, instant: true,
    badge: 'Instant',
  },
  {
    id: 'visa', icon: 'credit-card', color: '#1A56DB',
    label: 'Visa / Mastercard', labelAr: 'فيزا / ماستركارد',
    sub: 'International debit or credit card',
    limit: 'EGP 100,000 / day', fee: 1.5, instant: true,
    badge: 'Instant',
  },
  {
    id: 'fawry', icon: 'map-pin', color: '#D69E2E',
    label: 'Fawry', labelAr: 'فوري',
    sub: 'Pay at any Fawry outlet near you',
    limit: 'EGP 10,000 / tx', fee: 5, instant: false,
    badge: null,
  },
  {
    id: 'bank', icon: 'home', color: Colors.midnight,
    label: 'Bank Transfer', labelAr: 'تحويل بنكي',
    sub: 'Wire from any Egyptian bank account',
    limit: 'Unlimited', fee: 0, instant: false,
    badge: null,
  },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];

type Step = 'method' | 'amount' | 'instructions';

type DepositDetail = { label: string; value: string; copyable?: boolean };
type DepositInstructions = {
  headline: string;
  subline: string;
  note?: string;
  details: DepositDetail[];
  isCardPayment?: boolean;
};

function getDepositInstructions(methodId: string, ref: string, amount: string): DepositInstructions {
  switch (methodId) {
    case 'bank':
      return {
        headline: 'Bank Transfer Details',
        subline: 'Send your deposit to the account below from any Egyptian bank.',
        note: 'Funds arrive in 1–2 business days. Include your reference number in the transfer description.',
        details: [
          { label: 'Account Name',   value: 'Acumen Holding S.A.E.',               copyable: true },
          { label: 'Bank',           value: 'Banque Misr',                         copyable: true },
          { label: 'Account Number', value: '000-123456789-01',                    copyable: true },
          { label: 'IBAN',           value: 'EG080002000156789012345678901',        copyable: true },
          { label: 'SWIFT / BIC',    value: 'BMISEGCX',                            copyable: true },
          { label: 'Branch',         value: 'Cairo — Smart Village Digital',       copyable: true },
          { label: 'Amount',         value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}`, copyable: true },
          { label: 'Reference',      value: ref,                                   copyable: true },
        ],
      };
    case 'instapay':
      return {
        headline: 'Send via InstaPay',
        subline: 'Open your bank app or InstaPay, then send to the alias or number below.',
        note: 'Add your reference in the payment note so we can credit your wallet instantly.',
        details: [
          { label: 'InstaPay Alias', value: 'nuve.acumen@instapay', copyable: true },
          { label: 'Mobile Number',  value: '+20 100 123 4567',       copyable: true },
          { label: 'Amount',         value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}`, copyable: true },
          { label: 'Reference',      value: ref, copyable: true },
        ],
      };
    case 'vodafone':
      return {
        headline: 'Vodafone Cash Transfer',
        subline: 'Send via *9# or the My Vodafone app to the number below.',
        note: 'Your wallet will be credited as soon as we receive confirmation from Vodafone.',
        details: [
          { label: 'Vodafone Number', value: '+20 100 987 6543', copyable: true },
          { label: 'Amount',          value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}`, copyable: true },
          { label: 'Reference',       value: ref, copyable: true },
        ],
      };
    case 'orange':
      return {
        headline: 'Orange Cash Transfer',
        subline: 'Send via the Orange Cash app or *7# to the number below.',
        note: 'Your wallet will be credited as soon as we receive confirmation from Orange.',
        details: [
          { label: 'Orange Number', value: '+20 122 987 6543', copyable: true },
          { label: 'Amount',        value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}`, copyable: true },
          { label: 'Reference',     value: ref, copyable: true },
        ],
      };
    case 'etisalat':
      return {
        headline: 'e& Cash Transfer',
        subline: 'Send via the e& app or *888# to the number below.',
        note: 'Your wallet will be credited as soon as we receive confirmation from e&.',
        details: [
          { label: 'e& Number', value: '+20 111 987 6543', copyable: true },
          { label: 'Amount',    value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}`, copyable: true },
          { label: 'Reference', value: ref, copyable: true },
        ],
      };
    case 'fawry':
      return {
        headline: 'Pay at a Fawry Outlet',
        subline: 'Visit any Fawry point or use FawryPlus and quote the code below.',
        note: 'This code expires in 48 hours. Funds arrive within 1 business day after payment.',
        details: [
          { label: 'Fawry Code',  value: `FW-${ref.replace('NV-DEP-', '')}`, copyable: true },
          { label: 'Biller Name', value: 'Acumen Holding — Nuvé' },
          { label: 'Amount',      value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}`, copyable: true },
          { label: 'Expires',     value: '48 hours from now' },
        ],
      };
    default: // meeza, visa — card payments processed immediately
      return {
        headline: 'Payment Processed',
        subline: 'Your card payment was authorised and funds have been credited to your wallet.',
        details: [
          { label: 'Amount',     value: `EGP ${parseFloat(amount || '0').toLocaleString('en-EG')}` },
          { label: 'Status',     value: 'Completed' },
          { label: 'Reference',  value: ref },
        ],
        isCardPayment: true,
      };
  }
}

function StepBar({ step }: { step: Step }) {
  const C = useColors();
  const steps: Step[] = ['method', 'amount', 'instructions'];
  const idx = steps.indexOf(step);
  return (
    <View style={sb.bar}>
      {steps.slice(0, 3).map((s, i) => (
        <React.Fragment key={s}>
          <View style={[sb.dot, { backgroundColor: C.gray200 }, i <= idx && { backgroundColor: C.teal }]}>
            {i < idx ? (
              <Feather name="check" size={10} color={'#FAFAF8'} />
            ) : (
              <NuveText variant="caption" weight="bold" color={i <= idx ? '#FAFAF8' : C.slate}>
                {i + 1}
              </NuveText>
            )}
          </View>
          {i < 2 && <View style={[sb.line, { backgroundColor: C.gray200 }, i < idx && { backgroundColor: C.teal }]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const sb = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  line: { flex: 1, height: 2, marginHorizontal: 4 },
});

export default function DepositScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<typeof METHODS[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [ref] = useState(`NV-DEP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyField = (label: string, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const parsed = parseFloat(amount.replace(/,/g, '') || '0');
  const fee = method ? (method.fee > 0 && method.fee < 1 ? parsed * method.fee / 100 : method.fee) : 0;
  const receive = parsed; // fee paid by sender; user receives full amount

  const go = (s: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s);
  };

  // ── Step 1: Choose Method ──────────────────────────────────────────────────
  if (step === 'method') {
    return (
      <View style={[styles.screen, { paddingTop: topPad, backgroundColor: C.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.white }]}>
            <Feather name="arrow-left" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">Deposit Funds</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <StepBar step="method" />

          <NuveText variant="h2" weight="bold" family="display" style={{ marginBottom: 4 }}>Choose payment method</NuveText>
          <NuveText variant="body" color={C.textSecondary} style={{ marginBottom: 20 }}>
            All deposits are protected by 256-bit encryption.
          </NuveText>

          {METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, { backgroundColor: C.white, shadowColor: Colors.midnight }, method?.id === m.id && { borderColor: C.teal, backgroundColor: C.teal + '08' }]}
              onPress={() => setMethod(m)}
              activeOpacity={0.85}
            >
              <View style={[styles.methodIcon, { backgroundColor: m.color + '18' }]}>
                <Feather name={m.icon as any} size={22} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <NuveText variant="bodySmall" weight="semibold">{m.label}</NuveText>
                  {m.badge && (
                    <View style={[styles.instantPill, { backgroundColor: C.successLight }]}>
                      <NuveText variant="caption" weight="bold" color={C.success}>{m.badge}</NuveText>
                    </View>
                  )}
                </View>
                <NuveText variant="caption" color={C.textMuted}>{m.sub}</NuveText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <NuveText variant="caption" color={C.textMuted}>{m.limit}</NuveText>
                <NuveText variant="caption" weight="semibold" color={m.fee === 0 ? C.success : C.textSecondary}>
                  {m.fee === 0 ? 'Free' : m.fee < 1 ? `${m.fee}% fee` : `EGP ${m.fee} fee`}
                </NuveText>
              </View>
              {method?.id === m.id && (
                <View style={[styles.checkBadge, { backgroundColor: C.teal }]}>
                  <Feather name="check" size={12} color={'#FAFAF8'} />
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: C.background, borderTopColor: C.borderLight }]}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: C.teal, opacity: method ? 1 : 0.4 }]}
            onPress={() => method && go('amount')}
            disabled={!method}
          >
            <NuveText variant="body" weight="bold" color={Colors.midnight}>Continue</NuveText>
            <Feather name="arrow-right" size={18} color={Colors.midnight} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Step 2: Enter Amount ───────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <View style={[styles.screen, { paddingTop: topPad, backgroundColor: C.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => go('method')} style={[styles.backBtn, { backgroundColor: C.white }]}>
            <Feather name="arrow-left" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <NuveText variant="h3" weight="semibold">Enter Amount</NuveText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false}>
          <StepBar step="amount" />

          {/* Selected method chip */}
          <View style={[styles.methodChip, { backgroundColor: C.white, borderColor: C.gray200 }]}>
            <View style={[styles.methodIconSm, { backgroundColor: method!.color + '18' }]}>
              <Feather name={method!.icon as any} size={16} color={method!.color} />
            </View>
            <NuveText variant="bodySmall" weight="semibold" style={{ flex: 1 }}>{method!.label}</NuveText>
            <TouchableOpacity onPress={() => go('method')} style={[styles.changeBtn, { backgroundColor: C.teal + '12' }]}>
              <NuveText variant="caption" weight="semibold" color={C.teal}>Change</NuveText>
            </TouchableOpacity>
          </View>

          {/* Big amount input */}
          <NuveCard style={styles.amountCard}>
            <NuveText variant="label" color={C.textMuted} style={{ marginBottom: 8 }}>DEPOSIT AMOUNT</NuveText>
            <View style={styles.amountRow}>
              <NuveText variant="h2" weight="bold" color={C.textMuted} style={{ marginRight: 8 }}>EGP</NuveText>
              <TextInput
                style={[styles.amountInput, { color: C.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={C.grayLight}
                value={amount}
                onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
              />
            </View>
              <View style={styles.quickRow}>
                {QUICK_AMOUNTS.map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.quickChip, { backgroundColor: C.teal + '10', borderColor: C.teal + '20' }, parsed === a && { backgroundColor: C.teal, borderColor: C.teal }]}
                    onPress={() => setAmount(String(a))}
                  >
                    <NuveText
                      variant="caption"
                      weight="semibold"
                      color={parsed === a ? Colors.midnight : C.teal}
                    >
                      {(a / 1000).toFixed(0)}K
                    </NuveText>
                  </TouchableOpacity>
                ))}
              </View>
            </NuveCard>

            {/* Fee / Limit note */}
            <NuveCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <NuveText variant="caption" color={C.textSecondary}>Daily limit</NuveText>
                <NuveText variant="caption" weight="semibold">{method!.limit}</NuveText>
              </View>
              <View style={styles.infoRow}>
                <NuveText variant="caption" color={C.textSecondary}>Transaction fee</NuveText>
                <NuveText variant="caption" weight="semibold" color={method!.fee === 0 ? C.success : C.textPrimary}>
                  {method!.fee === 0 ? 'Free' : method!.fee < 1 ? `${method!.fee}%` : `EGP ${method!.fee}`}
                </NuveText>
              </View>
              <View style={styles.infoRow}>
                <NuveText variant="caption" color={C.textSecondary}>Processing time</NuveText>
                <NuveText variant="caption" weight="semibold" color={method!.instant ? C.success : C.warning}>
                  {method!.instant ? 'Instant' : '1–2 business days'}
                </NuveText>
              </View>
              {parsed > 0 && (
                <View style={[styles.infoRow, styles.totalRow, { borderTopColor: C.borderLight }]}>
                  <NuveText variant="bodySmall" weight="bold">You will receive</NuveText>
                  <NuveText variant="bodySmall" weight="bold" family="mono" color={C.teal}>
                    EGP {receive.toLocaleString('en-EG')}
                  </NuveText>
                </View>
              )}
            </NuveCard>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: C.background, borderTopColor: C.borderLight }]}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: C.teal, opacity: parsed >= 100 ? 1 : 0.4 }]}
              onPress={() => parsed >= 100 && go('instructions')}
              disabled={parsed < 100}
            >
              <NuveText variant="body" weight="bold" color={Colors.midnight}>Continue</NuveText>
              <Feather name="arrow-right" size={18} color={Colors.midnight} />
            </TouchableOpacity>
            {parsed > 0 && parsed < 100 && (
              <NuveText variant="caption" color={C.error} style={{ textAlign: 'center', marginTop: 8 }}>
                Minimum deposit is EGP 100
              </NuveText>
            )}
          </View>
      </View>
    );
  }

  // ── Step 3: Payment Instructions ──────────────────────────────────────────
  const instructions = getDepositInstructions(method!.id, ref, amount);

  return (
    <View style={[styles.screen, { paddingTop: topPad, backgroundColor: C.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go('amount')} style={[styles.backBtn, { backgroundColor: C.white }]}>
          <Feather name="arrow-left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">
          {instructions.isCardPayment ? 'Deposit Complete' : 'Payment Instructions'}
        </NuveText>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: C.white }]}
          onPress={() => {
            Share.share({
              message: instructions.details.map(d => `${d.label}: ${d.value}`).join('\n') + `\n\nNuvé by Acumen`,
              title: instructions.headline,
            }).catch(() => {});
          }}
        >
          <Feather name="share-2" size={18} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false}>
        <StepBar step="instructions" />

        {/* Icon + headline */}
        <View style={styles.instrHero}>
          <View style={[styles.instrIcon, { backgroundColor: instructions.isCardPayment ? C.success + '18' : C.teal + '12' }]}>
            <Feather
              name={instructions.isCardPayment ? 'check-circle' : 'send'}
              size={28}
              color={instructions.isCardPayment ? C.success : C.teal}
            />
          </View>
          <NuveText variant="h2" weight="bold" style={{ textAlign: 'center', marginBottom: 6 }}>
            {instructions.headline}
          </NuveText>
          <NuveText variant="body" color={C.textSecondary} style={{ textAlign: 'center', lineHeight: 22 }}>
            {instructions.subline}
          </NuveText>
        </View>

        {/* Amount banner */}
        <View style={[styles.amountBanner, { backgroundColor: C.teal + '08', borderColor: C.teal + '18' }]}>
          <NuveText variant="caption" color={C.textMuted}>Deposit amount</NuveText>
          <NuveText variant="h2" weight="bold" family="mono" color={C.teal}>
            EGP {parsed.toLocaleString('en-EG')}
          </NuveText>
          <View style={[styles.refPill, { backgroundColor: C.borderLight }]}>
            <Feather name="hash" size={11} color={C.textMuted} />
            <NuveText variant="caption" color={C.textMuted}>{ref}</NuveText>
          </View>
        </View>

        {/* Detail rows */}
        <NuveCard style={{ gap: 0 }}>
          {instructions.details.map((d, i) => (
            <View
              key={d.label}
              style={[
                styles.detailRow,
                i < instructions.details.length - 1 && [styles.detailRowBorder, { borderBottomColor: C.borderLight }],
              ]}
            >
              <View style={{ flex: 1 }}>
                <NuveText variant="caption" color={C.textMuted}>{d.label}</NuveText>
                <NuveText variant="bodySmall" weight="semibold" style={{ marginTop: 2 }}>
                  {d.value}
                </NuveText>
              </View>
              {d.copyable && (
                <TouchableOpacity
                  style={[styles.copyBtn, { backgroundColor: C.teal + '12', borderColor: C.teal + '20' }, copiedField === d.label && { backgroundColor: C.success + '12', borderColor: C.success + '30' }]}
                  onPress={() => copyField(d.label, d.value)}
                >
                  <Feather
                    name={copiedField === d.label ? 'check' : 'copy'}
                    size={14}
                    color={copiedField === d.label ? C.success : C.teal}
                  />
                  <NuveText
                    variant="caption"
                    weight="semibold"
                    color={copiedField === d.label ? C.success : C.teal}
                  >
                    {copiedField === d.label ? 'Copied!' : 'Copy'}
                  </NuveText>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </NuveCard>

        {/* Important note */}
        {instructions.note && (
          <View style={[styles.noteBox, { backgroundColor: C.warning + '10', borderColor: C.warning + '25' }]}>
            <Feather name="alert-circle" size={15} color={C.warning} />
            <NuveText variant="caption" color={C.textSecondary} style={{ flex: 1, lineHeight: 18 }}>
              {' '}{instructions.note}
            </NuveText>
          </View>
        )}

        {/* FRA disclaimer */}
        <View style={[styles.securityNote, { backgroundColor: C.successLight }]}>
          <Feather name="shield" size={14} color={C.success} />
          <NuveText variant="caption" color={C.textSecondary} style={{ flex: 1 }}>
            {' '}Your deposit is protected by 256-bit TLS encryption. FRA License #897.
          </NuveText>
        </View>

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: C.background, borderTopColor: C.borderLight }]}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: C.teal }]} onPress={() => router.replace('/(tabs)/wallet')}>
          <Feather name="check" size={18} color={Colors.midnight} />
          <NuveText variant="body" weight="bold" color={Colors.midnight}>Done — Back to Wallet</NuveText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.replace('/(tabs)')}>
          <NuveText variant="body" color={C.textSecondary}>Go to Home</NuveText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 32,
    borderTopWidth: 1,
  },
  btn: {
    borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ghostBtn: {
    borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  // Method cards
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  methodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodIconSm: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  instantPill: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  checkBadge: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', marginLeft: 6,
  },

  // Amount entry
  methodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, padding: 10, marginBottom: 16,
    borderWidth: 1,
  },
  changeBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  amountCard: { marginBottom: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, minHeight: 56 },
  amountInput: {
    flex: 1,
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 40,
    height: 56,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickChip: {
    flex: 1, paddingVertical: 8, borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  infoCard: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 10, marginTop: 4,
  },

  // Review
  summaryHero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingBottom: 16, marginBottom: 0,
  },
  divider: { height: 1, marginBottom: 14 },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1,
  },
  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: 12, padding: 12,
    marginTop: 12,
  },

  // Payment Instructions
  instrHero: {
    alignItems: 'center', marginBottom: 20, paddingTop: 8,
  },
  instrIcon: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  amountBanner: {
    alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1,
  },
  refPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 4, gap: 8,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
  },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1,
  },
  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: 12, padding: 12, marginTop: 12,
    borderWidth: 1,
  },

  // Success (legacy — kept for reference)
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  successRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successInner: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  receipt: { width: '100%', gap: 0 },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1,
  },
});
