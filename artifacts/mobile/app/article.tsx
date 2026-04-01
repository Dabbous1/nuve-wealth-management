import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { ARTICLES } from '@/constants/articles';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const isAr = language === 'ar';

  const [bookmarked, setBookmarked] = useState(false);

  const article = ARTICLES.find(a => a.id === id);

  if (!article) {
    return (
      <View style={[styles.screen, { paddingTop: topPad + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Feather name="file-text" size={40} color={Colors.gray300} />
          <NuveText variant="body" color={Colors.textMuted} style={{ marginTop: 12 }}>
            Article not found.
          </NuveText>
        </View>
      </View>
    );
  }

  const title = isAr ? article.titleAr : article.title;
  const summary = isAr ? article.summaryAr : article.summary;
  const body = isAr ? article.bodyAr : article.body;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.source} · ${article.tag}\n\n${article.title}\n\n${article.summary}\n\n— Nuvé by Acumen`,
        title: article.title,
      });
    } catch {}
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Floating Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setBookmarked(b => !b)}>
            <Feather
              name={bookmarked ? 'bookmark' : 'bookmark'}
              size={18}
              color={bookmarked ? Colors.gold : Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Feather name="share-2" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tag + Meta */}
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: article.isReport ? Colors.gold + '20' : Colors.primary + '15' }]}>
            <NuveText variant="caption" weight="bold" color={article.isReport ? Colors.gold : Colors.primary}>
              {article.tag}
            </NuveText>
          </View>
          {article.isReport && (
            <View style={styles.reportBadge}>
              <Feather name="award" size={10} color={Colors.gold} />
              <NuveText variant="caption" weight="semibold" color={Colors.gold}> Research Report</NuveText>
            </View>
          )}
        </View>

        {/* Title */}
        <NuveText variant="h1" weight="bold" style={styles.title}>
          {title}
        </NuveText>

        {/* Divider line */}
        <View style={styles.titleUnderline} />

        {/* Source / Author / Time */}
        <View style={styles.metaRow}>
          <View style={styles.sourceAvatar}>
            <NuveText variant="caption" weight="bold" color={Colors.white} style={{ fontSize: 10 }}>
              {article.source.slice(0, 2).toUpperCase()}
            </NuveText>
          </View>
          <View style={{ flex: 1 }}>
            <NuveText variant="bodySmall" weight="semibold" color={Colors.textPrimary}>
              {article.author}
            </NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>
              {article.source} · {article.time}
            </NuveText>
          </View>
          <View style={styles.readTimeBadge}>
            <Feather name="clock" size={11} color={Colors.textMuted} />
            <NuveText variant="caption" color={Colors.textMuted}> {article.readTime} read</NuveText>
          </View>
        </View>

        {/* Summary / Lead */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryAccent} />
          <NuveText variant="body" color={Colors.textPrimary} style={styles.summaryText}>
            {summary}
          </NuveText>
        </View>

        {/* Body Paragraphs */}
        <View style={styles.bodySection}>
          {body.map((para, i) => (
            <NuveText key={i} variant="body" color={Colors.textPrimary} style={styles.paragraph}>
              {para}
            </NuveText>
          ))}
        </View>

        {/* Related Instruments */}
        {article.related.length > 0 && (
          <View style={styles.relatedSection}>
            <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>
              Related Instruments
            </NuveText>
            {article.related.map((r, i) => (
              <NuveCard key={i} style={styles.relatedRow}>
                <View style={styles.relatedLogo}>
                  <NuveText variant="caption" weight="bold" color={Colors.primary} style={{ fontSize: 10 }}>
                    {r.ticker.slice(0, 4)}
                  </NuveText>
                </View>
                <View style={{ flex: 1 }}>
                  <NuveText variant="bodySmall" weight="semibold">{r.name}</NuveText>
                  <NuveText variant="caption" color={Colors.textMuted}>{r.ticker}</NuveText>
                </View>
                <View style={[styles.changePill, { backgroundColor: r.change >= 0 ? Colors.success + '15' : Colors.error + '15' }]}>
                  <Feather
                    name={r.change >= 0 ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={r.change >= 0 ? Colors.success : Colors.error}
                  />
                  <NuveText
                    variant="caption"
                    weight="bold"
                    color={r.change >= 0 ? Colors.success : Colors.error}
                  >
                    {r.change >= 0 ? '+' : ''}{r.change}%
                  </NuveText>
                </View>
              </NuveCard>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Feather name="info" size={12} color={Colors.textMuted} />
          <NuveText variant="caption" color={Colors.textMuted} style={{ flex: 1, lineHeight: 18 }}>
            {' '}This content is for informational purposes only and does not constitute investment advice. Acumen Holding is licensed by the FRA (License No. 897). Past performance is not indicative of future results.
          </NuveText>
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '12',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 14,
  },
  titleUnderline: {
    height: 3,
    width: 40,
    backgroundColor: Colors.gold,
    borderRadius: 2,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sourceAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  summaryAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    alignSelf: 'stretch',
  },
  summaryText: {
    flex: 1,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bodySection: {
    marginBottom: 28,
  },
  paragraph: {
    lineHeight: 26,
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    padding: 12,
  },
  relatedLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
