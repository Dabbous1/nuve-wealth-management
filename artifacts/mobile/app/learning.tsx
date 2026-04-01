import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useStrings } from '@/hooks/useStrings';

const ARTICLES = [
  {
    id: '1', category: 'Basics', categoryColor: Colors.info,
    title: 'What is Compound Interest?', titleAr: 'ما هي الفائدة المركبة؟',
    readTime: '4 min', level: 'Beginner',
    summary: "The 8th wonder of the world — Einstein's description of compound interest and why starting early matters.",
  },
  {
    id: '2', category: 'Goals', categoryColor: Colors.success,
    title: 'Setting SMART Financial Goals', titleAr: 'تحديد أهداف مالية ذكية',
    readTime: '6 min', level: 'Beginner',
    summary: 'How to set Specific, Measurable, Achievable, Relevant, and Time-bound financial goals.',
  },
  {
    id: '3', category: 'Portfolio', categoryColor: Colors.gold,
    title: 'Understanding Asset Allocation', titleAr: 'فهم توزيع الأصول',
    readTime: '8 min', level: 'Intermediate',
    summary: 'Why spreading your investments across different asset classes reduces risk and improves returns.',
  },
  {
    id: '4', category: 'Egypt Markets', categoryColor: Colors.primary,
    title: 'EGX Stocks: A Beginner\'s Guide', titleAr: 'دليل المبتدئين في البورصة المصرية',
    readTime: '10 min', level: 'Beginner',
    summary: 'Everything you need to know about investing in the Egyptian Exchange stock market.',
  },
  {
    id: '5', category: 'Fixed Income', categoryColor: Colors.chart4,
    title: 'Treasury Bills Explained', titleAr: 'شرح أذون الخزانة',
    readTime: '5 min', level: 'Beginner',
    summary: 'How Egyptian T-bills work, current yields, and why they\'re the safest investment.',
  },
  {
    id: '6', category: 'Inflation', categoryColor: Colors.error,
    title: 'Beating Inflation: Strategies for Egypt', titleAr: 'التغلب على التضخم: استراتيجيات لمصر',
    readTime: '7 min', level: 'Intermediate',
    summary: 'Practical strategies to protect your purchasing power in Egypt\'s high-inflation environment.',
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: Colors.success,
  Intermediate: Colors.warning,
  Advanced: Colors.error,
};

export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const [activeFilter, setActiveFilter] = useState('All');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const FILTERS = ['All', 'Basics', 'Goals', 'Portfolio', 'Egypt Markets', 'Fixed Income', 'Inflation'];
  const filtered = activeFilter === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === activeFilter);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <NuveText variant="h3" weight="semibold">{s.learningHub}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero */}
      <NuveCard variant="dark" style={styles.hero}>
        <Feather name="book-open" size={32} color={Colors.gold} />
        <NuveText variant="h2" weight="bold" color={Colors.white}>Build Your Knowledge</NuveText>
        <NuveText variant="bodySmall" color={Colors.white + '80'}>
          Institutional-grade financial education, made accessible. No jargon, no FOMO — just clear guidance.
        </NuveText>
        <View style={styles.statsRow}>
          {[
            { icon: 'book', value: '30+', label: 'Articles' },
            { icon: 'play-circle', value: '15+', label: 'Videos' },
            { icon: 'calculator', value: '5', label: 'Tools' },
          ].map((stat, i) => (
            <View key={i} style={styles.stat}>
              <Feather name={stat.icon as any} size={16} color={Colors.gold} />
              <NuveText variant="h3" weight="bold" color={Colors.white}>{stat.value}</NuveText>
              <NuveText variant="caption" color={Colors.white + '70'}>{stat.label}</NuveText>
            </View>
          ))}
        </View>
      </NuveCard>

      {/* Quick Tools */}
      <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>Calculators</NuveText>
      <View style={styles.tools}>
        {[
          { icon: 'percent', label: 'Zakat Calculator', route: '/zakat', color: Colors.gold },
          { icon: 'file-text', label: 'Tax Reporting', route: '/tax', color: Colors.primary },
          { icon: 'trending-up', label: 'Return Calculator', route: null, color: Colors.success },
        ].map((tool, i) => (
          <TouchableOpacity
            key={i}
            style={styles.toolCard}
            onPress={() => tool.route && router.push(tool.route as any)}
          >
            <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
              <Feather name={tool.icon as any} size={22} color={tool.color} />
            </View>
            <NuveText variant="caption" weight="semibold" style={{ textAlign: 'center' }}>{tool.label}</NuveText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Articles */}
      <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>{s.articles}</NuveText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, f === activeFilter && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <NuveText variant="caption" weight="semibold" color={f === activeFilter ? Colors.white : Colors.textSecondary}>{f}</NuveText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map(article => (
        <TouchableOpacity key={article.id} style={styles.articleCard} activeOpacity={0.85}>
          <View style={styles.articleTop}>
            <View style={[styles.catBadge, { backgroundColor: article.categoryColor + '20' }]}>
              <NuveText variant="caption" weight="bold" color={article.categoryColor}>{article.category}</NuveText>
            </View>
            <View style={styles.levelBadge}>
              <NuveText variant="caption" color={LEVEL_COLORS[article.level]}>{article.level}</NuveText>
            </View>
          </View>
          <NuveText variant="h3" style={{ lineHeight: 24 }}>{article.title}</NuveText>
          <NuveText variant="bodySmall" color={Colors.textSecondary} style={{ lineHeight: 20 }} numberOfLines={2}>
            {article.summary}
          </NuveText>
          <View style={styles.articleMeta}>
            <Feather name="clock" size={12} color={Colors.textMuted} />
            <NuveText variant="caption" color={Colors.textMuted}>{article.readTime} read</NuveText>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { marginBottom: 20, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 4 },
  stat: { alignItems: 'center', gap: 4 },
  tools: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  toolCard: {
    flex: 1, alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  toolIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  filters: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  articleCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    gap: 8, marginBottom: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  articleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
