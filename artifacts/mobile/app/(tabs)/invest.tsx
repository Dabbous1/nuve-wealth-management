import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Modal, KeyboardAvoidingView,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';
import { MarketSwitcherSheet, getMarketOption } from '@/components/MarketSwitcherSheet';

const ASSET_TYPES = ['All', 'Stocks', 'Funds', 'T-Bills', 'Gold', 'Money Market'];
const PERIODS = ['1W', '1M', '3M', '6M', '1Y', 'All'] as const;
type Period = typeof PERIODS[number];

const PERIOD_POINTS: Record<Period, number> = { '1W': 7, '1M': 30, '3M': 60, '6M': 90, '1Y': 120, All: 180 };

const ASSET_ABOUT: Record<string, string> = {
  '1': 'Commercial International Bank (CIB) is Egypt\'s leading private-sector bank, offering retail, corporate, and investment banking services. Founded in 1975, CIB has a strong track record of profitability and consistent dividend payouts.',
  '2': 'The Acumen Growth Fund is an actively managed equity fund targeting high-growth Egyptian mid and large-cap stocks. Managed by Acumen Holding, it aims to outperform the EGX 30 index over a 3–5 year horizon.',
  '3': 'Egyptian Treasury Bills (T-Bills) are short-term government debt instruments issued by the Central Bank of Egypt. They offer capital-guaranteed returns and are among the safest investments available in Egypt.',
  '4': 'Gold (EGLD) provides exposure to the international gold price in Egyptian Pound terms. It serves as a portfolio hedge against currency depreciation and inflationary pressures.',
  '5': 'The Acumen Money Market Fund invests in high-quality short-term instruments including T-Bills, bank deposits, and CBE instruments. It targets returns closely tracking the prevailing interest rate environment.',
  '6': 'Eastern Tobacco is Egypt\'s dominant tobacco company and one of the oldest listings on the EGX. It benefits from near-monopolistic pricing power and generates stable, growing cash flows.',
  u1: 'Apple Inc. is one of the world\'s most valuable companies, designing and selling consumer electronics, software, and services. Its ecosystem of products and services generates significant recurring revenue.',
  u2: 'The S&P 500 ETF (SPY) tracks the S&P 500 index, providing broad exposure to the 500 largest US-listed companies across all sectors. It is the most liquid ETF in the world.',
  u3: 'US Treasury Bonds (TLT) are long-duration US government bonds. They provide capital preservation and income, and typically appreciate in value when interest rates fall.',
  g1: 'The MSCI World ETF provides diversified exposure to developed-market equities across 23 countries. It is a core holding for global investors seeking broad market participation.',
  g2: 'The Global Gold Fund tracks the price of physical gold through a portfolio of gold-backed instruments. It serves as a global safe-haven asset and inflation hedge.',
  e1: 'The iShares MSCI Emerging Markets ETF offers exposure to large and mid-cap equities across 24 emerging-market countries, including China, India, Brazil, and Egypt.',
  e2: 'The EM Bond Fund provides access to sovereign and corporate bonds issued by emerging-market governments. It offers higher yields than developed-market bonds with moderate duration risk.',
};

const ASSET_FACTS: Record<string, Array<{ label: string; value: string }>> = {
  '1':  [{ label: 'Market Cap', value: 'EGP 142B' }, { label: 'P/E Ratio', value: '9.2×' }, { label: 'Dividend Yield', value: '3.8%' }, { label: 'Beta (1Y)', value: '0.87' }],
  '2':  [{ label: 'AUM', value: 'EGP 4.2B' }, { label: 'Inception Date', value: '2018' }, { label: 'Manager', value: 'Acumen AM' }, { label: 'Benchmark', value: 'EGX 30' }],
  '3':  [{ label: 'Maturity', value: '91 Days' }, { label: 'Issuer', value: 'CBE / MOF' }, { label: 'Settlement', value: 'T+2' }, { label: 'Rating', value: 'AAA' }],
  '4':  [{ label: 'Backing', value: 'Physical Gold' }, { label: 'Expense Ratio', value: '0.15%' }, { label: 'Correlation USD', value: '−0.72' }, { label: 'Volatility (1Y)', value: 'Medium' }],
  '5':  [{ label: 'AUM', value: 'EGP 8.1B' }, { label: 'Liquidity', value: 'Daily' }, { label: 'Inception Date', value: '2015' }, { label: 'Manager', value: 'Acumen AM' }],
  '6':  [{ label: 'Market Cap', value: 'EGP 34B' }, { label: 'P/E Ratio', value: '12.1×' }, { label: 'Dividend Yield', value: '5.2%' }, { label: 'Beta (1Y)', value: '0.61' }],
  u1:   [{ label: 'Market Cap', value: '$2.9T' }, { label: 'P/E Ratio', value: '28×' }, { label: 'Dividend Yield', value: '0.5%' }, { label: 'Beta (1Y)', value: '1.20' }],
  u2:   [{ label: 'AUM', value: '$500B' }, { label: 'Expense Ratio', value: '0.09%' }, { label: 'Holdings', value: '500 stocks' }, { label: 'Inception', value: '1993' }],
  u3:   [{ label: 'Duration', value: '~17 yrs' }, { label: 'AUM', value: '$18B' }, { label: 'Expense Ratio', value: '0.15%' }, { label: 'Yield to Mat.', value: '4.7%' }],
  g1:   [{ label: 'Countries', value: '23' }, { label: 'Holdings', value: '1,400+' }, { label: 'Expense Ratio', value: '0.20%' }, { label: 'AUM', value: '$55B' }],
  g2:   [{ label: 'Backing', value: 'Physical Gold' }, { label: 'Expense Ratio', value: '0.40%' }, { label: 'AUM', value: '$60B' }, { label: 'Currency', value: 'USD' }],
  e1:   [{ label: 'Countries', value: '24' }, { label: 'Holdings', value: '800+' }, { label: 'Expense Ratio', value: '0.68%' }, { label: 'AUM', value: '$18B' }],
  e2:   [{ label: 'Duration', value: '~7 yrs' }, { label: 'Holdings', value: '600+' }, { label: 'Expense Ratio', value: '0.39%' }, { label: 'AUM', value: '$14B' }],
};

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateChartData(basePrice: number, id: string, points: number): number[] {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRand(seed + points);
  const volatility = basePrice * 0.003;
  const data: number[] = [basePrice * 0.92];
  for (let i = 1; i < points; i++) {
    const prev = data[i - 1];
    const delta = (rand() - 0.46) * volatility * 2;
    data.push(Math.max(prev + delta, basePrice * 0.5));
  }
  data[data.length - 1] = basePrice;
  return data;
}

const CHART_W = 340;
const CHART_H = 130;

function LineChart({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * CHART_W;
    const y = CHART_H - ((v - min) / range) * CHART_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyPts = pts.join(' ');
  const firstX = 0;
  const lastX = CHART_W;
  const areaPath = `M ${pts[0]} L ${pts.join(' L ')} L ${lastX},${CHART_H} L ${firstX},${CHART_H} Z`;
  const lineColor = positive ? Colors.success : Colors.error;
  const gradId = positive ? 'gradGreen' : 'gradRed';

  return (
    <Svg width={CHART_W} height={CHART_H} style={{ marginVertical: 8 }}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={lineColor} stopOpacity="0.22" />
          <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradId})`} />
      <Polyline points={polyPts} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

const ASSETS_BY_MARKET: Record<string, Asset[]> = {
  EGX: [
    { id: '1', name: 'Commercial International Bank', nameAr: 'البنك التجاري الدولي', type: 'Stocks', ticker: 'COMI', price: 78.50, change: 2.4, risk: 4, minInvestment: 500, expectedReturn: '12–18%', isAcumen: false },
    { id: '2', name: 'Acumen Growth Fund', nameAr: 'صندوق النمو', type: 'Funds', ticker: 'AGF', price: 112.30, change: 0.8, risk: 3, minInvestment: 1000, expectedReturn: '10–15%', isAcumen: true },
    { id: '3', name: '91-Day Treasury Bill', nameAr: 'أذون خزانة 91 يوماً', type: 'T-Bills', ticker: 'T-BILL-91', price: 100, change: 0, risk: 1, minInvestment: 10000, expectedReturn: '27.5%', isAcumen: false },
    { id: '4', name: 'Gold (EGLD)', nameAr: 'الذهب', type: 'Gold', ticker: 'GOLD', price: 3180, change: -0.5, risk: 2, minInvestment: 500, expectedReturn: '8–12%', isAcumen: true },
    { id: '5', name: 'Acumen Money Market Fund', nameAr: 'صندوق سوق المال', type: 'Money Market', ticker: 'AMM', price: 100, change: 0.1, risk: 1, minInvestment: 500, expectedReturn: '25–27%', isAcumen: true },
    { id: '6', name: 'Eastern Tobacco', nameAr: 'الشركة الشرقية للدخان', type: 'Stocks', ticker: 'EAST', price: 23.80, change: 1.2, risk: 3, minInvestment: 500, expectedReturn: '10–14%', isAcumen: false },
  ],
  US: [
    { id: 'u1', name: 'Apple Inc.', nameAr: 'آبل', type: 'Stocks', ticker: 'AAPL', price: 172.50, change: 1.8, risk: 3, minInvestment: 500, expectedReturn: '8–15%', isAcumen: false },
    { id: 'u2', name: 'S&P 500 ETF', nameAr: 'صندوق S&P 500', type: 'Funds', ticker: 'SPY', price: 510.00, change: 0.6, risk: 3, minInvestment: 1000, expectedReturn: '10–12%', isAcumen: false },
    { id: 'u3', name: 'US Treasury Bonds', nameAr: 'سندات الخزانة', type: 'T-Bills', ticker: 'TLT', price: 100, change: -0.2, risk: 1, minInvestment: 5000, expectedReturn: '4.5–5%', isAcumen: false },
  ],
  Global: [
    { id: 'g1', name: 'MSCI World ETF', nameAr: 'صندوق MSCI العالمي', type: 'Funds', ticker: 'IWRD', price: 88.40, change: 0.4, risk: 3, minInvestment: 1000, expectedReturn: '8–11%', isAcumen: false },
    { id: 'g2', name: 'Global Gold Fund', nameAr: 'صندوق الذهب العالمي', type: 'Gold', ticker: 'GLD', price: 220.00, change: -0.3, risk: 2, minInvestment: 500, expectedReturn: '7–10%', isAcumen: false },
  ],
  EM: [
    { id: 'e1', name: 'iShares MSCI EM ETF', nameAr: 'صندوق الأسواق الناشئة', type: 'Funds', ticker: 'EEM', price: 43.20, change: 1.1, risk: 4, minInvestment: 1000, expectedReturn: '10–16%', isAcumen: false },
    { id: 'e2', name: 'EM Bond Fund', nameAr: 'صندوق سندات الأسواق الناشئة', type: 'T-Bills', ticker: 'EMB', price: 90.50, change: 0.3, risk: 2, minInvestment: 2000, expectedReturn: '6–9%', isAcumen: false },
  ],
};

type Asset = {
  id: string; name: string; nameAr: string; type: string;
  ticker: string; price: number; change: number; risk: number;
  minInvestment: number; expectedReturn: string; isAcumen: boolean;
};

const ALL_ASSETS: Asset[] = Object.values(ASSETS_BY_MARKET).flat();
const RISK_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
const RISK_COLORS = ['', Colors.success, Colors.success, Colors.warning, Colors.error, Colors.error];

function parseReturnRate(str: string): number {
  const nums = str.match(/[\d.]+/g);
  if (!nums) return 0.1;
  const vals = nums.map(Number);
  return (vals.reduce((a, b) => a + b, 0) / vals.length) / 100;
}

function AssetProfile({
  asset, market, onClose,
}: { asset: Asset; market: string; onClose: () => void }) {
  const [period, setPeriod] = useState<Period>('3M');
  const [showCalc, setShowCalc] = useState(false);
  const [calcAmount, setCalcAmount] = useState('10000');
  const [calcYears, setCalcYears] = useState('5');

  // Invest flow
  const [investStep, setInvestStep] = useState<null | 1 | 2 | 3>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [orderRef] = useState(() => `NV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  const currency = market === 'EGX' ? 'EGP' : 'USD';
  const mockBalance = market === 'EGX' ? 50000 : 10000;
  const positive = asset.change >= 0;

  const investAmountNum = parseFloat(investAmount.replace(/,/g, '')) || 0;
  const estimatedUnits = investAmountNum > 0 ? investAmountNum / asset.price : 0;
  const platformFee = investAmountNum * 0.005;
  const totalDebit = investAmountNum + platformFee;
  const remainingBalance = mockBalance - totalDebit;
  const canContinue = investAmountNum >= asset.minInvestment;

  const openInvest = () => {
    setInvestAmount(String(asset.minInvestment));
    setInvestStep(1);
  };

  const quickAmounts = [asset.minInvestment, asset.minInvestment * 2, asset.minInvestment * 5, asset.minInvestment * 10]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);

  const chartData = useMemo(
    () => generateChartData(asset.price, asset.id, PERIOD_POINTS[period]),
    [asset.id, asset.price, period],
  );

  const chartMin = Math.min(...chartData);
  const chartMax = Math.max(...chartData);

  const projectedValue = useMemo(() => {
    const amt = parseFloat(calcAmount.replace(/,/g, '')) || 0;
    const yrs = parseFloat(calcYears) || 0;
    const rate = parseReturnRate(asset.expectedReturn);
    return amt * Math.pow(1 + rate, yrs);
  }, [calcAmount, calcYears, asset.expectedReturn]);

  const relatedAssets = ALL_ASSETS.filter(
    a => a.id !== asset.id && (a.type === asset.type || (ASSETS_BY_MARKET[market] ?? []).some(m => m.id === a.id)),
  ).slice(0, 4);

  const facts = ASSET_FACTS[asset.id] ?? [];
  const about = ASSET_ABOUT[asset.id] ?? `${asset.name} is a ${asset.type} instrument traded on the ${market} market.`;

  // ── STEP 1: Amount Entry ────────────────────────────────────────────────
  if (investStep === 1) return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={iStyles.flowHeader}>
        <TouchableOpacity onPress={() => setInvestStep(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="bodySmall" weight="semibold">Invest in {asset.ticker}</NuveText>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={iStyles.flowContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={iStyles.amountBox}>
          <NuveText variant="label" color={Colors.textMuted} style={{ marginBottom: 8 }}>INVESTMENT AMOUNT</NuveText>
          <View style={iStyles.amountInputRow}>
            <NuveText variant="h3" weight="semibold" color={Colors.textMuted}>{currency}</NuveText>
            <TextInput
              style={[iStyles.amountInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              value={investAmount}
              onChangeText={setInvestAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.gray300}
            />
          </View>
          <View style={iStyles.minRow}>
            <Feather name="info" size={12} color={Colors.textMuted} />
            <NuveText variant="caption" color={Colors.textMuted}>
              Minimum: {currency} {asset.minInvestment.toLocaleString()}
            </NuveText>
          </View>
        </View>

        <View style={iStyles.balancePill}>
          <Feather name="credit-card" size={14} color={Colors.primary} />
          <NuveText variant="caption" weight="semibold" color={Colors.primary}>
            Available: {currency} {mockBalance.toLocaleString()}
          </NuveText>
        </View>

        <NuveText variant="label" color={Colors.textMuted} style={{ marginBottom: 10 }}>QUICK AMOUNTS</NuveText>
        <View style={iStyles.quickRow}>
          {quickAmounts.map(q => (
            <TouchableOpacity
              key={q}
              style={[iStyles.quickPill, investAmount === String(q) && iStyles.quickPillActive]}
              onPress={() => setInvestAmount(String(q))}
            >
              <NuveText variant="caption" weight="semibold"
                color={investAmount === String(q) ? Colors.white : Colors.textSecondary}>
                {currency} {q >= 1000 ? `${q / 1000}K` : q}
              </NuveText>
            </TouchableOpacity>
          ))}
        </View>

        {investAmountNum > 0 && (
          <NuveCard style={{ marginTop: 24, gap: 0 }}>
            {[
              { label: 'Est. Units / Shares', value: estimatedUnits.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
              { label: 'Price per Unit', value: `${currency} ${asset.price.toLocaleString()}` },
              { label: 'Platform Fee (0.5%)', value: `${currency} ${platformFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            ].map((r, i) => (
              <View key={i} style={[iStyles.summaryRow, i > 0 && iStyles.summaryBorder]}>
                <NuveText variant="bodySmall" color={Colors.textMuted}>{r.label}</NuveText>
                <NuveText variant="bodySmall" weight="semibold">{r.value}</NuveText>
              </View>
            ))}
          </NuveCard>
        )}

        {!canContinue && investAmountNum > 0 && (
          <View style={iStyles.errorBanner}>
            <Feather name="alert-circle" size={14} color={Colors.error} />
            <NuveText variant="caption" color={Colors.error} style={{ flex: 1 }}>
              Amount is below the minimum of {currency} {asset.minInvestment.toLocaleString()}
            </NuveText>
          </View>
        )}
      </ScrollView>

      <View style={iStyles.flowFooter}>
        <TouchableOpacity
          style={[iStyles.primaryBtn, !canContinue && { opacity: 0.4 }]}
          disabled={!canContinue}
          onPress={() => setInvestStep(2)}
        >
          <NuveText variant="body" weight="semibold" color={Colors.white}>Review Order</NuveText>
          <Feather name="arrow-right" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // ── STEP 2: Order Review ────────────────────────────────────────────────
  if (investStep === 2) return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={iStyles.flowHeader}>
        <TouchableOpacity onPress={() => setInvestStep(1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="bodySmall" weight="semibold">Review Order</NuveText>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={iStyles.flowContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={iStyles.reviewAssetRow}>
          <View style={[iStyles.reviewBadge, { backgroundColor: asset.isAcumen ? Colors.gold + '22' : Colors.primary + '14' }]}>
            <NuveText variant="bodySmall" weight="bold" color={asset.isAcumen ? Colors.gold : Colors.primary}>
              {asset.ticker.slice(0, 4)}
            </NuveText>
          </View>
          <View style={{ flex: 1 }}>
            <NuveText variant="body" weight="semibold">{asset.name}</NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>{asset.type} · {market}</NuveText>
          </View>
        </View>

        <NuveCard style={{ gap: 0, marginBottom: 16 }}>
          {[
            { label: 'Investment Amount', value: `${currency} ${investAmountNum.toLocaleString()}`, highlight: true },
            { label: 'Price per Unit', value: `${currency} ${asset.price.toLocaleString()}` },
            { label: 'Estimated Units', value: estimatedUnits.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
            { label: 'Platform Fee (0.5%)', value: `${currency} ${platformFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
          ].map((r, i) => (
            <View key={i} style={[iStyles.summaryRow, i > 0 && iStyles.summaryBorder]}>
              <NuveText variant="bodySmall" color={Colors.textMuted}>{r.label}</NuveText>
              <NuveText variant="bodySmall" weight={r.highlight ? 'bold' : 'semibold'}
                color={r.highlight ? Colors.primary : Colors.textPrimary}>{r.value}</NuveText>
            </View>
          ))}
          <View style={[iStyles.totalRow]}>
            <NuveText variant="body" weight="bold">Total Debit</NuveText>
            <NuveText variant="body" weight="bold" color={Colors.primary}>
              {currency} {totalDebit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </NuveText>
          </View>
        </NuveCard>

        <View style={iStyles.balanceAfterRow}>
          <NuveText variant="caption" color={Colors.textMuted}>Balance after investment</NuveText>
          <NuveText variant="bodySmall" weight="semibold" color={remainingBalance >= 0 ? Colors.success : Colors.error}>
            {currency} {Math.max(0, remainingBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </NuveText>
        </View>

        <View style={iStyles.disclaimer}>
          <Feather name="alert-triangle" size={14} color={Colors.warning} />
          <NuveText variant="caption" color={Colors.textMuted} style={{ flex: 1, lineHeight: 17 }}>
            Investments carry risk. Past performance does not guarantee future returns. By confirming, you acknowledge these risks.
          </NuveText>
        </View>
      </ScrollView>

      <View style={iStyles.flowFooter}>
        <TouchableOpacity
          style={iStyles.primaryBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setInvestStep(3);
          }}
        >
          <Feather name="lock" size={16} color={Colors.white} style={{ marginRight: 8 }} />
          <NuveText variant="body" weight="semibold" color={Colors.white}>Confirm & Invest</NuveText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── STEP 3: Success ─────────────────────────────────────────────────────
  if (investStep === 3) return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={iStyles.successContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={iStyles.successCircle}>
          <Feather name="check" size={44} color={Colors.white} />
        </View>

        <NuveText variant="h1" weight="bold" style={{ textAlign: 'center', marginTop: 24 }}>
          Investment Placed!
        </NuveText>
        <NuveText variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 8, marginBottom: 8 }}>
          Your order has been submitted successfully.
        </NuveText>

        <View style={iStyles.orderRefPill}>
          <NuveText variant="caption" color={Colors.textMuted}>Order Reference</NuveText>
          <NuveText variant="bodySmall" weight="bold" color={Colors.primary}>{orderRef}</NuveText>
        </View>

        <NuveCard style={{ width: '100%', gap: 0, marginTop: 24 }}>
          {[
            { label: 'Asset', value: `${asset.ticker} — ${asset.name}` },
            { label: 'Amount Invested', value: `${currency} ${investAmountNum.toLocaleString()}` },
            { label: 'Units Acquired', value: estimatedUnits.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
            { label: 'Total Debited', value: `${currency} ${totalDebit.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
            { label: 'New Balance', value: `${currency} ${Math.max(0, remainingBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
          ].map((r, i) => (
            <View key={i} style={[iStyles.summaryRow, i > 0 && iStyles.summaryBorder]}>
              <NuveText variant="bodySmall" color={Colors.textMuted}>{r.label}</NuveText>
              <NuveText variant="bodySmall" weight="semibold" numberOfLines={1} style={{ maxWidth: '55%', textAlign: 'right' }}>{r.value}</NuveText>
            </View>
          ))}
        </NuveCard>

        <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginTop: 16, lineHeight: 17 }}>
          Settlement within 2 business days. A confirmation will be sent to your registered email.
        </NuveText>
      </ScrollView>

      <View style={[iStyles.flowFooter, { flexDirection: 'row', gap: 12 }]}>
        <TouchableOpacity style={iStyles.outlineBtn} onPress={() => { router.push('/(tabs)/portfolio?fromInvest=1'); onClose(); }}>
          <Feather name="pie-chart" size={16} color={Colors.primary} />
          <NuveText variant="body" weight="semibold" color={Colors.primary}>Portfolio</NuveText>
        </TouchableOpacity>
        <TouchableOpacity style={[iStyles.primaryBtn, { flex: 1 }]} onPress={onClose}>
          <NuveText variant="body" weight="semibold" color={Colors.white}>Done</NuveText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── DEFAULT: Asset Profile ──────────────────────────────────────────────
  return (
    <View style={pStyles.container}>
      {/* Header */}
      <View style={pStyles.header}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="chevron-down" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="bodySmall" weight="semibold" color={Colors.textMuted}>{asset.ticker}</NuveText>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="share-2" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Price Hero */}
        <View style={pStyles.priceHero}>
          <View style={[pStyles.tickerBadge, { backgroundColor: asset.isAcumen ? Colors.gold + '22' : Colors.primary + '14' }]}>
            <NuveText variant="h3" weight="bold" color={asset.isAcumen ? Colors.gold : Colors.primary}>
              {asset.ticker.slice(0, 4)}
            </NuveText>
          </View>
          <NuveText variant="caption" color={Colors.textMuted} style={{ marginTop: 4 }}>{asset.type} · {market}</NuveText>
          <NuveText variant="h1" weight="bold" style={{ marginTop: 2 }}>
            {currency} {asset.price.toLocaleString()}
          </NuveText>
          <View style={pStyles.changeRow}>
            <Feather name={positive ? 'arrow-up-right' : 'arrow-down-right'} size={14} color={positive ? Colors.success : Colors.error} />
            <NuveText variant="bodySmall" weight="semibold" color={positive ? Colors.success : Colors.error}>
              {positive ? '+' : ''}{asset.change}% today
            </NuveText>
          </View>
        </View>

        {/* Growth Chart */}
        <View style={pStyles.chartCard}>
          <View style={pStyles.chartAxisRow}>
            <NuveText variant="caption" color={Colors.textMuted}>{currency} {chartMax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>{currency} {chartMin.toLocaleString(undefined, { maximumFractionDigits: 0 })}</NuveText>
          </View>
          <ScrollView horizontal={false} scrollEnabled={false}>
            <LineChart data={chartData} positive={positive} />
          </ScrollView>
          <View style={pStyles.periodRow}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[pStyles.periodPill, period === p && pStyles.periodPillActive]}
                onPress={() => setPeriod(p)}
              >
                <NuveText variant="caption" weight="semibold" color={period === p ? Colors.white : Colors.textMuted}>
                  {p}
                </NuveText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={pStyles.section}>
          <NuveText variant="label" color={Colors.textMuted} style={pStyles.sectionLabel}>ABOUT</NuveText>
          <NuveCard>
            <NuveText variant="body" color={Colors.textSecondary} style={{ lineHeight: 22 }}>
              {about}
            </NuveText>
          </NuveCard>
        </View>

        {/* Fact Sheet */}
        <View style={pStyles.section}>
          <NuveText variant="label" color={Colors.textMuted} style={pStyles.sectionLabel}>FACT SHEET</NuveText>
          <NuveCard style={{ gap: 0 }}>
            {[
              { label: 'Expected Return', value: asset.expectedReturn + ' p.a.' },
              { label: 'Min. Investment', value: `${currency} ${asset.minInvestment.toLocaleString()}` },
              { label: 'Risk Level', value: RISK_LABELS[asset.risk] },
              ...facts,
            ].map((row, i) => (
              <View key={i} style={[pStyles.factRow, i > 0 && pStyles.factRowBorder]}>
                <NuveText variant="bodySmall" color={Colors.textMuted}>{row.label}</NuveText>
                <NuveText variant="bodySmall" weight="semibold"
                  color={row.label === 'Risk Level' ? RISK_COLORS[asset.risk] : Colors.textPrimary}>
                  {row.value}
                </NuveText>
              </View>
            ))}
            <TouchableOpacity style={pStyles.calcCta} onPress={() => setShowCalc(true)}>
              <View style={pStyles.calcCtaLeft}>
                <Feather name="trending-up" size={16} color={Colors.gold} />
                <NuveText variant="bodySmall" weight="semibold" color={Colors.gold}>Growth Calculator</NuveText>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.gold} />
            </TouchableOpacity>
          </NuveCard>
        </View>

        {/* Related Assets */}
        {relatedAssets.length > 0 && (
          <View style={pStyles.section}>
            <NuveText variant="label" color={Colors.textMuted} style={pStyles.sectionLabel}>RELATED ASSETS</NuveText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
              {relatedAssets.map(a => (
                <View key={a.id} style={pStyles.relatedCard}>
                  <View style={[pStyles.relatedBadge, { backgroundColor: a.isAcumen ? Colors.gold + '20' : Colors.primary + '12' }]}>
                    <NuveText variant="caption" weight="bold" color={a.isAcumen ? Colors.gold : Colors.primary}>
                      {a.ticker.slice(0, 4)}
                    </NuveText>
                  </View>
                  <NuveText variant="caption" weight="semibold" style={{ maxWidth: 90 }} numberOfLines={2}>{a.name}</NuveText>
                  <NuveText variant="caption" color={a.change >= 0 ? Colors.success : Colors.error} weight="semibold">
                    {a.change >= 0 ? '+' : ''}{a.change}%
                  </NuveText>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Invest Now CTA */}
      <View style={iStyles.flowFooter}>
        <TouchableOpacity style={iStyles.primaryBtn} onPress={openInvest}>
          <NuveText variant="body" weight="semibold" color={Colors.white}>Invest Now</NuveText>
        </TouchableOpacity>
      </View>

      {/* Growth Calculator Sheet */}
      <Modal visible={showCalc} transparent animationType="slide" onRequestClose={() => setShowCalc(false)}>
        <TouchableOpacity style={pStyles.calcOverlay} activeOpacity={1} onPress={() => setShowCalc(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={pStyles.calcSheet}>
            <View style={pStyles.calcHandle} />
            <View style={pStyles.calcHeader}>
              <View style={{ width: 32 }} />
              <NuveText variant="h3" weight="semibold" style={{ flex: 1, textAlign: 'center' }}>Growth Calculator</NuveText>
              <TouchableOpacity onPress={() => setShowCalc(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginBottom: 20 }}>
              Based on {asset.expectedReturn} p.a. expected return
            </NuveText>

            <View style={pStyles.calcInputGroup}>
              <NuveText variant="bodySmall" weight="semibold" color={Colors.textSecondary} style={{ marginBottom: 6 }}>
                Initial Investment ({currency})
              </NuveText>
              <View style={pStyles.calcInputRow}>
                <NuveText variant="body" color={Colors.textMuted}>{currency}</NuveText>
                <TextInput
                  style={[pStyles.calcInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  value={calcAmount}
                  onChangeText={setCalcAmount}
                  keyboardType="numeric"
                  placeholder="10,000"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={pStyles.calcInputGroup}>
              <NuveText variant="bodySmall" weight="semibold" color={Colors.textSecondary} style={{ marginBottom: 6 }}>
                Investment Period (Years)
              </NuveText>
              <View style={pStyles.calcYearRow}>
                {[1, 3, 5, 10, 15].map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[pStyles.yearPill, calcYears === String(y) && pStyles.yearPillActive]}
                    onPress={() => setCalcYears(String(y))}
                  >
                    <NuveText variant="caption" weight="semibold"
                      color={calcYears === String(y) ? Colors.white : Colors.textSecondary}>{y}Y</NuveText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={pStyles.calcResult}>
              <NuveText variant="caption" color={Colors.textMuted}>Projected Value after {calcYears} year{Number(calcYears) !== 1 ? 's' : ''}</NuveText>
              <NuveText variant="display" weight="bold" color={Colors.primary}>
                {currency} {projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>
                Growth: {currency} {Math.max(0, projectedValue - (parseFloat(calcAmount) || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </NuveText>
            </View>

            <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', lineHeight: 16, marginTop: 8 }}>
              For illustrative purposes only. Actual returns may vary.
            </NuveText>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default function InvestScreen() {
  const insets = useSafeAreaInsets();
  const { user, notifications, selectedMarket, setSelectedMarket } = useApp();
  const s = useStrings();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;

  const [showMarketSheet, setShowMarketSheet] = useState(false);
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const marketAssets = ASSETS_BY_MARKET[selectedMarket] ?? [];
  const filtered = marketAssets.filter(a => {
    const matchType = activeType === 'All' || a.type === activeType;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.ticker.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const openAsset = (asset: Asset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAsset(asset);
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <NuveText variant="h1" weight="bold">Invest</NuveText>
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

      <MarketSwitcherSheet
        visible={showMarketSheet}
        currentMarket={selectedMarket}
        onSelect={(m) => { setSelectedMarket(m); setActiveType('All'); setSearch(''); }}
        onClose={() => setShowMarketSheet(false)}
      />

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          placeholder={`Search ${selectedMarket} assets…`}
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={styles.typeScrollContent}>
        {ASSET_TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.typePill, activeType === t && styles.typePillActive]} onPress={() => setActiveType(t)}>
            <NuveText variant="caption" weight="semibold" color={activeType === t ? Colors.white : Colors.textSecondary}>{t}</NuveText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={Colors.gray300} />
            <NuveText variant="body" color={Colors.textMuted} style={{ textAlign: 'center' }}>No assets found</NuveText>
          </View>
        ) : (
          filtered.map(asset => (
            <TouchableOpacity key={asset.id} style={styles.assetCard} onPress={() => openAsset(asset)} activeOpacity={0.85}>
              <View style={styles.assetLeft}>
                <View style={[styles.tickerBadge, { backgroundColor: asset.isAcumen ? Colors.gold + '20' : Colors.primary + '12' }]}>
                  <NuveText variant="caption" weight="bold" color={asset.isAcumen ? Colors.gold : Colors.primary}>
                    {asset.ticker.slice(0, 4)}
                  </NuveText>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.assetNameRow}>
                    <NuveText variant="bodySmall" weight="semibold" style={{ flex: 1 }}>{asset.name}</NuveText>
                    {asset.isAcumen && (
                      <View style={styles.acumenBadge}>
                        <NuveText variant="caption" color={Colors.gold} style={{ fontSize: 9 }}>ACUMEN</NuveText>
                      </View>
                    )}
                  </View>
                  <View style={styles.assetMeta}>
                    <NuveText variant="caption" color={Colors.textMuted}>{asset.type}</NuveText>
                    <View style={[styles.riskBadge, { backgroundColor: RISK_COLORS[asset.risk] + '18' }]}>
                      <NuveText variant="caption" color={RISK_COLORS[asset.risk]} style={{ fontSize: 10 }}>
                        {RISK_LABELS[asset.risk]}
                      </NuveText>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.assetRight}>
                <NuveText variant="bodySmall" weight="bold">
                  {selectedMarket === 'EGX' ? 'EGP' : 'USD'} {asset.price.toLocaleString()}
                </NuveText>
                <NuveText variant="caption" weight="semibold" color={asset.change >= 0 ? Colors.success : Colors.error}>
                  {asset.change >= 0 ? '+' : ''}{asset.change}%
                </NuveText>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selectedAsset} animationType="slide" presentationStyle="pageSheet">
        {selectedAsset && (
          <AssetProfile asset={selectedAsset} market={selectedMarket} onClose={() => setSelectedAsset(null)} />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '10', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.primary + '20' },
  profileBtn: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error, borderWidth: 1.5, borderColor: Colors.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.gray100 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textPrimary },
  typeScroll: { maxHeight: 44, marginBottom: 12 },
  typeScrollContent: { paddingHorizontal: 20, gap: 8 },
  typePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray200 },
  typePillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  list: { flex: 1 },
  emptyState: { alignItems: 'center', gap: 12, paddingTop: 60 },
  assetCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.gray100 },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  tickerBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  assetNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  acumenBadge: { backgroundColor: Colors.gold + '20', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  assetMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  assetRight: { alignItems: 'flex-end', gap: 4 },
});

const pStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  priceHero: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  tickerBadge: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  chartCard: { backgroundColor: Colors.white, marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.gray100 },
  chartAxisRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  periodPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  periodPillActive: { backgroundColor: Colors.primary },
  section: { paddingHorizontal: 20, marginTop: 8, marginBottom: 4 },
  sectionLabel: { marginBottom: 8, letterSpacing: 0.5 },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  factRowBorder: { borderTopWidth: 1, borderTopColor: Colors.gray100 },
  calcCta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  calcCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  relatedCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: 'flex-start', gap: 8, width: 120, borderWidth: 1, borderColor: Colors.gray100 },
  relatedBadge: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  investBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  calcOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  calcSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  calcHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray200, alignSelf: 'center', marginBottom: 20 },
  calcHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  calcInputGroup: { marginBottom: 16 },
  calcInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.gray50, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: Colors.gray200 },
  calcInput: { flex: 1, fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  calcYearRow: { flexDirection: 'row', gap: 8 },
  yearPill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray200 },
  yearPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  calcResult: { backgroundColor: Colors.primary + '08', borderRadius: 16, padding: 20, alignItems: 'center', gap: 4, marginVertical: 8 },
});

const iStyles = StyleSheet.create({
  flowHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
    backgroundColor: Colors.background,
  },
  flowContent: {
    padding: 20, paddingBottom: 24,
  },
  flowFooter: {
    padding: 20, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: Colors.gray100,
    backgroundColor: Colors.background,
  },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  outlineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 14, paddingVertical: 16,
  },
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '10', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-end', marginBottom: 20,
  },
  amountBox: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.gray100, marginBottom: 6,
  },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  amountInput: {
    flex: 1, fontSize: 36, fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  minRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  quickRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  quickPill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray200,
  },
  quickPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  summaryBorder: { borderTopWidth: 1, borderTopColor: Colors.gray100 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.error + '10', borderRadius: 12,
    padding: 12, marginTop: 12,
  },
  reviewAssetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.gray100, marginBottom: 16,
  },
  reviewBadge: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12, marginTop: 4,
    backgroundColor: Colors.primary + '07', borderRadius: 10,
    borderTopWidth: 1, borderTopColor: Colors.gray100,
  },
  balanceAfterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 4, marginBottom: 16,
  },
  disclaimer: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Colors.warning + '12', borderRadius: 12, padding: 14,
  },
  successContainer: {
    padding: 24, alignItems: 'center', paddingBottom: 32,
  },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.success, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
    marginTop: 16,
  },
  orderRefPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary + '10', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10, marginTop: 12,
  },
});
