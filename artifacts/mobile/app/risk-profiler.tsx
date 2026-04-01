import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const QUESTIONS = [
  {
    id: 1,
    en: 'What is your primary financial goal?',
    ar: 'ما هو هدفك المالي الأساسي؟',
    options: [
      { en: 'Preserve my capital at all costs', ar: 'الحفاظ على رأس المال بكل الأحوال', score: 1 },
      { en: 'Grow steadily with minimal risk', ar: 'نمو مستقر مع مخاطرة منخفضة', score: 3 },
      { en: 'Balance growth with some risk', ar: 'التوازن بين النمو والمخاطرة', score: 6 },
      { en: 'Maximize returns, accept volatility', ar: 'تعظيم العوائد مع قبول التقلبات', score: 9 },
    ],
  },
  {
    id: 2,
    en: 'How long until you need this money?',
    ar: 'متى ستحتاج إلى هذه الأموال؟',
    options: [
      { en: 'Less than 1 year', ar: 'أقل من سنة', score: 1 },
      { en: '1–3 years', ar: '1–3 سنوات', score: 3 },
      { en: '3–7 years', ar: '3–7 سنوات', score: 6 },
      { en: '7+ years', ar: 'أكثر من 7 سنوات', score: 9 },
    ],
  },
  {
    id: 3,
    en: 'If your portfolio dropped 20%, what would you do?',
    ar: 'إذا انخفضت محفظتك 20%، ماذا ستفعل؟',
    options: [
      { en: 'Sell everything immediately', ar: 'البيع الفوري لكل شيء', score: 1 },
      { en: 'Move to safer investments', ar: 'الانتقال إلى استثمارات أكثر أماناً', score: 3 },
      { en: 'Hold and wait for recovery', ar: 'الانتظار حتى التعافي', score: 6 },
      { en: 'Buy more — great opportunity', ar: 'الشراء أكثر — فرصة رائعة', score: 9 },
    ],
  },
  {
    id: 4,
    en: 'What is your investment experience?',
    ar: 'ما هي خبرتك في الاستثمار؟',
    options: [
      { en: 'None — this is my first time', ar: 'لا توجد — هذه المرة الأولى', score: 2 },
      { en: 'Some — saving accounts or funds', ar: 'بعض — حسابات توفير أو صناديق', score: 4 },
      { en: 'Moderate — stocks and bonds', ar: 'متوسطة — أسهم وسندات', score: 7 },
      { en: 'Experienced — diverse portfolio', ar: 'متمرس — محفظة متنوعة', score: 10 },
    ],
  },
  {
    id: 5,
    en: 'What percentage of your monthly income do you invest?',
    ar: 'ما نسبة دخلك الشهري التي تستثمرها؟',
    options: [
      { en: 'Less than 5%', ar: 'أقل من 5%', score: 2 },
      { en: '5–15%', ar: '5–15%', score: 4 },
      { en: '15–30%', ar: '15–30%', score: 7 },
      { en: 'More than 30%', ar: 'أكثر من 30%', score: 9 },
    ],
  },
  {
    id: 6,
    en: 'How stable is your income?',
    ar: 'ما مدى استقرار دخلك؟',
    options: [
      { en: 'Unstable — freelance or variable', ar: 'غير مستقر — عمل حر أو متغير', score: 2 },
      { en: 'Somewhat stable — employed', ar: 'مستقر نسبياً — موظف', score: 5 },
      { en: 'Very stable — government or corporate', ar: 'مستقر جداً — حكومي أو شركة كبرى', score: 7 },
      { en: 'Multiple income streams', ar: 'مصادر دخل متعددة', score: 9 },
    ],
  },
  {
    id: 7,
    en: 'Do you have an emergency fund covering 6+ months of expenses?',
    ar: 'هل لديك صندوق طوارئ يغطي 6 أشهر أو أكثر من النفقات؟',
    options: [
      { en: 'No emergency fund', ar: 'لا يوجد صندوق طوارئ', score: 1 },
      { en: 'Less than 3 months covered', ar: 'أقل من 3 أشهر', score: 3 },
      { en: '3–6 months covered', ar: '3–6 أشهر', score: 6 },
      { en: 'More than 6 months covered', ar: 'أكثر من 6 أشهر', score: 9 },
    ],
  },
  {
    id: 8,
    en: 'Which best describes your attitude to risk?',
    ar: 'ما الذي يصف موقفك من المخاطرة بشكل أفضل؟',
    options: [
      { en: 'I lose sleep over any loss', ar: 'أي خسارة تقلقني كثيراً', score: 1 },
      { en: 'I can handle small fluctuations', ar: 'أتحمل التقلبات الصغيرة', score: 4 },
      { en: 'Short-term loss for long-term gain', ar: 'خسارة قصيرة المدى لربح طويل المدى', score: 7 },
      { en: 'High risk is part of high reward', ar: 'المخاطرة العالية جزء من المكافأة العالية', score: 10 },
    ],
  },
];

const getRiskProfile = (score: number) => {
  if (score <= 3) return 'conservative';
  if (score <= 5.5) return 'moderate';
  if (score <= 7.5) return 'growth';
  return 'aggressive';
};

const RISK_CONFIG = {
  conservative: { color: '#2980B9', icon: 'shield' as const },
  moderate: { color: '#27AE60', icon: 'bar-chart-2' as const },
  growth: { color: Colors.gold, icon: 'trending-up' as const },
  aggressive: { color: '#E74C3C', icon: 'zap' as const },
};

export default function RiskProfilerScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { setRiskScore, setIsOnboarded, language } = useApp();
  const s = useStrings();
  const isAr = language === 'ar';

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const question = QUESTIONS[currentQ];
  const progress = (currentQ / QUESTIONS.length) * 100;

  const handleAnswer = (score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers, score];
    if (currentQ < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
    } else {
      const total = newAnswers.reduce((a, b) => a + b, 0);
      const avg = total / newAnswers.length;
      const normalized = Math.max(1, Math.min(10, avg));
      setFinalScore(Math.round(normalized * 10) / 10);
      setAnswers(newAnswers);
      setShowResult(true);
      setRiskScore(normalized);
    }
  };

  const handleContinue = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setIsOnboarded(true);
    router.replace('/(tabs)');
  };

  const profile = getRiskProfile(finalScore);
  const config = RISK_CONFIG[profile];

  if (showResult) {
    return (
      <View style={[styles.container, { paddingTop: topPad + 20, paddingBottom: botPad + 20, backgroundColor: C.background }]}>
        <View style={styles.resultCard}>
          <View style={[styles.resultIcon, { backgroundColor: config.color + '20' }]}>
            <Feather name={config.icon} size={40} color={config.color} />
          </View>
          <NuveText variant="h1" family="display" style={{ textAlign: 'center' }} color={C.textPrimary}>
            {s.riskResultTitle}
          </NuveText>

          {/* Score gauge */}
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBar, { backgroundColor: C.gray200 }]}>
              <View style={[styles.scoreFill, { width: `${(finalScore / 10) * 100}%` as any, backgroundColor: config.color }]} />
              <View style={[styles.scoreKnob, { left: `${(finalScore / 10) * 100 - 3}%` as any, backgroundColor: config.color, borderColor: C.white }]} />
            </View>
            <View style={styles.scoreLabels}>
              <NuveText variant="caption" color={C.textMuted}>1</NuveText>
              <NuveText variant="h2" weight="bold" color={config.color}>{finalScore.toFixed(1)}</NuveText>
              <NuveText variant="caption" color={C.textMuted}>10</NuveText>
            </View>
          </View>

          <NuveText variant="h2" weight="bold" color={config.color} style={{ textAlign: 'center' }}>
            {s[profile as keyof typeof s] as string}
          </NuveText>
          <NuveText variant="body" color={C.textSecondary} style={{ textAlign: 'center', lineHeight: 24 }}>
            {s[`${profile}Desc` as keyof typeof s] as string}
          </NuveText>

          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.teal }]} onPress={handleContinue}>
            <NuveText variant="body" weight="semibold" color={Colors.midnight}>{s.continue}</NuveText>
            <Feather name="arrow-right" size={18} color={Colors.midnight} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad, backgroundColor: C.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {currentQ > 0 && (
          <TouchableOpacity onPress={() => setCurrentQ(currentQ - 1)} style={[styles.backBtn, { backgroundColor: C.white }]}>
            <Feather name="arrow-left" size={20} color={C.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <NuveText variant="body" weight="semibold" color={C.teal}>{s.riskProfilerTitle}</NuveText>
          <NuveText variant="caption" color={C.textSecondary}>
            {currentQ + 1} / {QUESTIONS.length}
          </NuveText>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressBar, { backgroundColor: C.gray200 }]}>
        <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: C.gold }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NuveText variant="h2" style={styles.questionText}>
          {isAr ? question.ar : question.en}
        </NuveText>

        <View style={styles.options}>
          {question.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: C.white, shadowColor: Colors.midnight }]}
              onPress={() => handleAnswer(opt.score)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionNumber, { backgroundColor: C.gold + '20' }]}>
                <NuveText variant="caption" weight="bold" color={C.gold}>
                  {String.fromCharCode(65 + i)}
                </NuveText>
              </View>
              <NuveText variant="body" style={{ flex: 1 }} color={C.textPrimary}>
                {isAr ? opt.ar : opt.en}
              </NuveText>
              <Feather name="chevron-right" size={16} color={C.slate} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  progressBar: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  questionText: {
    marginBottom: 24,
    lineHeight: 28,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  optionNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreContainer: {
    width: '100%',
    gap: 8,
  },
  scoreBar: {
    height: 10,
    borderRadius: 5,
    position: 'relative',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 5,
  },
  scoreKnob: {
    position: 'absolute',
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  scoreLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
});
