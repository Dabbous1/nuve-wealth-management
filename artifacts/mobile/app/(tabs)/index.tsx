import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveCard } from '@/components/NuveCard';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';
import { MarketSwitcherSheet, getMarketOption } from '@/components/MarketSwitcherSheet';
import { ARTICLES } from '@/constants/articles';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ACTIVITY = [
  { icon: 'arrow-up-right', label: 'Invested in Treasury Bills', amount: '+EGP 5,000', date: 'Mar 25', color: Colors.success },
  { icon: 'refresh-cw', label: 'Portfolio Rebalanced', amount: 'Automated', date: 'Mar 20', color: Colors.info },
  { icon: 'arrow-down-left', label: 'Monthly Return', amount: '+EGP 2,340', date: 'Mar 01', color: Colors.gold },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, notifications, language, selectedMarket, setSelectedMarket } = useApp();
  const s = useStrings();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showMarketSheet, setShowMarketSheet] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const unreadCount = notifications.filter(n => !n.read).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <NuveText variant="caption" color={Colors.textMuted}>{getGreeting()}</NuveText>
          <NuveText variant="h2" weight="bold">{language === 'ar' ? user?.nameAr : user?.name}</NuveText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.marketBtn} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="bold" color={Colors.primary}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={Colors.white}>
                {(language === 'ar' ? user?.nameAr : user?.name)?.charAt(0) ?? 'A'}
              </NuveText>
            </View>
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>
      <MarketSwitcherSheet
        visible={showMarketSheet}
        currentMarket={selectedMarket}
        onSelect={setSelectedMarket}
        onClose={() => setShowMarketSheet(false)}
      />

      {/* Total Wealth Card */}
      <NuveCard variant="dark" style={styles.wealthCard}>
        <NuveText variant="label" color={Colors.gold}>{s.totalWealth}</NuveText>
        <View style={styles.balanceRow}>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            {balanceVisible ? (
              <NuveText variant="display" weight="bold" color={Colors.white}>
                EGP {user?.totalBalance.toLocaleString()}
              </NuveText>
            ) : (
              <NuveText variant="display" weight="bold" color={Colors.white}>••••••••</NuveText>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            <Feather name={balanceVisible ? 'eye' : 'eye-off'} size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        <View style={styles.returnRow}>
          <View>
            <NuveText variant="caption" color={Colors.gray400}>{s.totalReturn}</NuveText>
            <NuveText variant="body" weight="semibold" color={Colors.success}>
              +EGP {user?.totalReturn.toLocaleString()}
            </NuveText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <NuveText variant="caption" color={Colors.gray400}>All Time</NuveText>
            <View style={styles.returnPill}>
              <Feather name="trending-up" size={12} color={Colors.success} />
              <NuveText variant="caption" weight="bold" color={Colors.success}>
                +{user?.totalReturnPct}%
              </NuveText>
            </View>
          </View>
        </View>

        {(user?.streakDays ?? 0) > 0 && (
          <View style={styles.streak}>
            <Feather name="zap" size={14} color={Colors.gold} />
            <NuveText variant="caption" color={Colors.gold}>{user?.streakDays} day investment streak</NuveText>
          </View>
        )}
      </NuveCard>

      {/* Insights Entry Point */}
      <TouchableOpacity style={styles.insightsBanner} onPress={() => router.push('/insights')} activeOpacity={0.85}>
        <View style={styles.insightsBannerLeft}>
          <View style={styles.insightsBannerIcon}>
            <Feather name="activity" size={16} color={Colors.primary} />
          </View>
          <View>
            <NuveText variant="bodySmall" weight="semibold" color={Colors.textPrimary}>Portfolio Insights</NuveText>
            <NuveText variant="caption" color={Colors.textMuted}>Performance & Health · Tap to explore</NuveText>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={Colors.primary} />
      </TouchableOpacity>

      {/* Market Pulse */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" weight="semibold">Market Pulse</NuveText>
          <TouchableOpacity onPress={() => router.push('/insights')}>
            <NuveText variant="bodySmall" color={Colors.gold}>See all</NuveText>
          </TouchableOpacity>
        </View>
        {ARTICLES.map(news => (
          <TouchableOpacity
            key={news.id}
            style={styles.newsCard}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/article', params: { id: news.id } })}
          >
            <View style={styles.newsTop}>
              <View style={[styles.newsTag, { backgroundColor: news.isReport ? Colors.gold + '20' : Colors.primary + '15' }]}>
                <NuveText variant="caption" weight="semibold" color={news.isReport ? Colors.gold : Colors.primary}>
                  {news.tag}
                </NuveText>
              </View>
              <NuveText variant="caption" color={Colors.textMuted}>{news.time}</NuveText>
            </View>
            <NuveText variant="body" weight="semibold" style={{ lineHeight: 22 }}>{news.title}</NuveText>
            <View style={styles.newsMeta}>
              <NuveText variant="caption" color={Colors.textMuted}>{news.source}</NuveText>
              <View style={styles.readTime}>
                <Feather name="clock" size={11} color={Colors.textMuted} />
                <NuveText variant="caption" color={Colors.textMuted}>{news.readTime}</NuveText>
              </View>
            </View>
            <View style={styles.readMoreRow}>
              <NuveText variant="caption" weight="semibold" color={Colors.primary}>Read article</NuveText>
              <Feather name="arrow-right" size={12} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <NuveText variant="h3" weight="semibold" style={{ marginBottom: 12 }}>{s.recentActivity}</NuveText>
        {ACTIVITY.map((act, i) => (
          <View key={i} style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: act.color + '18' }]}>
              <Feather name={act.icon as any} size={16} color={act.color} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="medium">{act.label}</NuveText>
              <NuveText variant="caption" color={Colors.textMuted}>{act.date}</NuveText>
            </View>
            <NuveText variant="bodySmall" weight="semibold" color={act.color}>{act.amount}</NuveText>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  insightsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '0E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  insightsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightsBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wealthCard: { marginBottom: 20, gap: 12 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  returnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.white + '20',
    paddingTop: 12,
    marginTop: 4,
  },
  returnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  newsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
