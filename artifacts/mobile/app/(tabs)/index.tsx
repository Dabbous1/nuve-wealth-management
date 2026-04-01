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
  { icon: 'arrow-up-right', label: 'Invested in Treasury Bills', amount: '+EGP 5,000', date: 'Mar 25', color: Colors.teal },
  { icon: 'refresh-cw', label: 'Portfolio Rebalanced', amount: 'Automated', date: 'Mar 20', color: Colors.blue },
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <NuveText variant="caption" color={Colors.slate}>{getGreeting()}</NuveText>
          <NuveText variant="h3" weight="medium" family="display">
            {language === 'ar' ? user?.nameAr : user?.name}
          </NuveText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.marketBtn} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="semibold" color={Colors.midnight}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={Colors.white} family="display">
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
      <NuveCard variant="dark" padding={24} style={styles.wealthCard}>
        <NuveText variant="label" color={Colors.gold}>{s.totalWealth}</NuveText>
        <View style={styles.balanceRow}>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            {balanceVisible ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <NuveText variant="caption" color={Colors.slate} family="mono" style={{ fontSize: 14 }}>EGP</NuveText>
                <NuveText variant="display" weight="light" color={Colors.white} style={{ fontSize: 34, lineHeight: 42 }}>
                  {user?.totalBalance.toLocaleString()}
                </NuveText>
              </View>
            ) : (
              <NuveText variant="display" weight="light" color={Colors.white} style={{ fontSize: 34, lineHeight: 42 }}>
                ••••••••
              </NuveText>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            <View style={styles.eyeBtn}>
              <Feather name={balanceVisible ? 'eye' : 'eye-off'} size={16} color={Colors.slate} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.returnRow}>
          <View>
            <NuveText variant="caption" color={Colors.slate} family="mono" style={{ fontSize: 11, letterSpacing: 1 }}>
              {s.totalReturn}
            </NuveText>
            <NuveText variant="body" weight="bold" color={Colors.teal} family="mono" style={{ fontSize: 15 }}>
              +EGP {user?.totalReturn.toLocaleString()}
            </NuveText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <NuveText variant="caption" color={Colors.slate} family="mono" style={{ fontSize: 11, letterSpacing: 1 }}>
              ALL TIME
            </NuveText>
            <View style={styles.returnPill}>
              <Feather name="trending-up" size={12} color={Colors.teal} />
              <NuveText variant="mono" weight="bold" color={Colors.teal} style={{ fontSize: 13 }}>
                +{user?.totalReturnPct}%
              </NuveText>
            </View>
          </View>
        </View>

        {(user?.streakDays ?? 0) > 0 && (
          <View style={styles.streak}>
            <Feather name="zap" size={14} color={Colors.gold} />
            <NuveText variant="caption" color={Colors.gold} family="mono" style={{ fontSize: 11 }}>
              {user?.streakDays} day investment streak
            </NuveText>
          </View>
        )}
      </NuveCard>

      {/* Insights Entry Point */}
      <TouchableOpacity style={styles.insightsBanner} onPress={() => router.push('/insights')} activeOpacity={0.85}>
        <View style={styles.insightsBannerLeft}>
          <View style={styles.insightsBannerIcon}>
            <Feather name="activity" size={16} color={Colors.teal} />
          </View>
          <View>
            <NuveText variant="bodySmall" weight="semibold" color={Colors.textPrimary}>Portfolio Insights</NuveText>
            <NuveText variant="caption" color={Colors.slate}>Performance & Health</NuveText>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={Colors.teal} />
      </TouchableOpacity>

      {/* Market Pulse */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" family="display" weight="regular">Market Pulse</NuveText>
          <TouchableOpacity onPress={() => router.push('/insights')}>
            <NuveText variant="caption" weight="semibold" color={Colors.teal}>See all</NuveText>
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
              <View style={[styles.newsTag, { backgroundColor: news.isReport ? Colors.warningLight : Colors.successLight }]}>
                <NuveText variant="caption" weight="semibold" color={news.isReport ? Colors.gold : Colors.teal} style={{ fontSize: 11 }}>
                  {news.tag}
                </NuveText>
              </View>
              <NuveText variant="caption" color={Colors.slate} family="mono" style={{ fontSize: 11 }}>{news.time}</NuveText>
            </View>
            <NuveText variant="bodySmall" weight="semibold" style={{ lineHeight: 22 }}>{news.title}</NuveText>
            <View style={styles.newsMeta}>
              <NuveText variant="caption" color={Colors.slate}>{news.source}</NuveText>
              <View style={styles.readTime}>
                <Feather name="clock" size={11} color={Colors.slate} />
                <NuveText variant="caption" color={Colors.slate}>{news.readTime}</NuveText>
              </View>
            </View>
            <View style={styles.readMoreRow}>
              <NuveText variant="caption" weight="semibold" color={Colors.teal}>Read article</NuveText>
              <Feather name="arrow-right" size={12} color={Colors.teal} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <NuveText variant="h3" family="display" weight="regular" style={{ marginBottom: 16 }}>{s.recentActivity}</NuveText>
        {ACTIVITY.map((act, i) => (
          <View key={i} style={[styles.activityRow, i === ACTIVITY.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[styles.activityIcon, { backgroundColor: act.color + '18' }]}>
              <Feather name={act.icon as any} size={16} color={act.color} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{act.label}</NuveText>
              <NuveText variant="caption" color={Colors.slate} family="mono" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                {act.date}
              </NuveText>
            </View>
            <NuveText variant="mono" weight="bold" color={act.color} style={{ fontSize: 13 }}>{act.amount}</NuveText>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
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
    backgroundColor: Colors.borderLight,
    borderRadius: 24, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.borderLightStrong,
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
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.teal,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.successLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(46,196,182,0.15)',
  },
  insightsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightsBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(46,196,182,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wealthCard: { marginBottom: 24, gap: 16 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  returnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 16,
    marginTop: 4,
  },
  returnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46,196,182,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 24,
    marginTop: 4,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212,168,67,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  newsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    marginTop: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
