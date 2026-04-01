import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
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
  const C = useColors();
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
    <View style={[styles.screen, { paddingTop: topPad + 8, backgroundColor: C.background }]}>
      {/* Header — fixed */}
      <View style={styles.header}>
        <View>
          <NuveText variant="caption" color={C.slate}>{getGreeting()}</NuveText>
          <NuveText variant="h3" weight="medium" family="display">
            {language === 'ar' ? user?.nameAr : user?.name}
          </NuveText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.marketBtn, { backgroundColor: C.borderLight, borderColor: C.borderLightStrong }]} onPress={() => setShowMarketSheet(true)}>
            <NuveText style={{ fontSize: 16 }}>{getMarketOption(selectedMarket).flag}</NuveText>
            <NuveText variant="caption" weight="semibold" color={C.textPrimary}>{selectedMarket}</NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <NuveText variant="caption" weight="bold" color={'#FAFAF8'} family="display">
                {(language === 'ar' ? user?.nameAr : user?.name)?.charAt(0) ?? 'A'}
              </NuveText>
            </View>
            {unreadCount > 0 && <View style={[styles.notifDot, { borderColor: C.background }]} />}
          </TouchableOpacity>
        </View>
      </View>
      <MarketSwitcherSheet
        visible={showMarketSheet}
        currentMarket={selectedMarket}
        onSelect={setSelectedMarket}
        onClose={() => setShowMarketSheet(false)}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
        showsVerticalScrollIndicator={false}
      >

      {/* Total Wealth Card */}
      <NuveCard variant="dark" padding={16} style={styles.wealthCard}>
        {/* Top row: "Total Wealth" left, balance right */}
        <View style={styles.wealthTopRow}>
          <NuveText variant="label" color={C.gold}>{s.totalWealth}</NuveText>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            {balanceVisible ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <NuveText variant="caption" color={C.slate} family="mono" style={{ fontSize: 14 }}>EGP</NuveText>
                <NuveText variant="h2" weight="bold" color={'#FAFAF8'} family="mono">
                  {user?.totalBalance.toLocaleString()}
                </NuveText>
              </View>
            ) : (
              <NuveText variant="h2" weight="bold" color={'#FAFAF8'} family="mono">
                ••••••
              </NuveText>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom row: eye icon left, total return right */}
        <View style={styles.wealthBottomRow}>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)} style={styles.eyeBtn}>
            <Feather name={balanceVisible ? 'eye' : 'eye-off'} size={16} color={C.slate} />
          </TouchableOpacity>
          <View style={styles.returnSection}>
            <NuveText variant="label" color={C.slate}>{s.totalReturn}</NuveText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="trending-up" size={13} color={C.teal} />
              <NuveText variant="body" weight="bold" color={C.teal} family="mono" style={{ fontSize: 15 }}>
                +EGP {user?.totalReturn.toLocaleString()}
              </NuveText>
            </View>
          </View>
        </View>
      </NuveCard>

      {/* Insights Entry Point */}
      <TouchableOpacity style={styles.insightsBanner} onPress={() => router.push('/insights')} activeOpacity={0.85}>
        <View style={styles.insightsBannerLeft}>
          <View style={styles.insightsBannerIcon}>
            <Feather name="activity" size={16} color={C.gold} />
          </View>
          <View>
            <NuveText variant="bodySmall" weight="semibold" color={C.textPrimary}>Portfolio Insights</NuveText>
            <NuveText variant="caption" color={C.slate}>Performance & Health</NuveText>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={C.gold} />
      </TouchableOpacity>

      {/* Market Pulse */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <NuveText variant="h3" family="display" weight="regular">Market Pulse</NuveText>
          <TouchableOpacity onPress={() => router.push('/insights')}>
            <NuveText variant="caption" weight="semibold" color={C.teal}>See all</NuveText>
          </TouchableOpacity>
        </View>
        {ARTICLES.map(news => (
          <TouchableOpacity
            key={news.id}
            style={[styles.newsCard, { backgroundColor: C.white, borderColor: C.borderLight }]}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/article', params: { id: news.id } })}
          >
            <View style={styles.newsTop}>
              <View style={[styles.newsTag, { backgroundColor: news.isReport ? C.warningLight : C.successLight }]}>
                <NuveText variant="caption" weight="semibold" color={news.isReport ? C.gold : C.teal} style={{ fontSize: 11 }}>
                  {news.tag}
                </NuveText>
              </View>
              <NuveText variant="caption" color={C.slate} family="mono" style={{ fontSize: 11 }}>{news.time}</NuveText>
            </View>
            <NuveText variant="bodySmall" weight="semibold" style={{ lineHeight: 22 }}>{news.title}</NuveText>
            <View style={styles.newsMeta}>
              <NuveText variant="caption" color={C.slate}>{news.source}</NuveText>
              <View style={styles.readTime}>
                <Feather name="clock" size={11} color={C.slate} />
                <NuveText variant="caption" color={C.slate}>{news.readTime}</NuveText>
              </View>
            </View>
            <View style={styles.readMoreRow}>
              <NuveText variant="caption" weight="semibold" color={C.teal}>Read article</NuveText>
              <Feather name="arrow-right" size={12} color={C.teal} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <NuveText variant="h3" family="display" weight="regular" style={{ marginBottom: 16 }}>{s.recentActivity}</NuveText>
        {ACTIVITY.map((act, i) => (
          <View key={i} style={[styles.activityRow, { borderBottomColor: C.borderLight }, i === ACTIVITY.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[styles.activityIcon, { backgroundColor: act.color + '18' }]}>
              <Feather name={act.icon as any} size={16} color={act.color} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">{act.label}</NuveText>
              <NuveText variant="caption" color={C.slate} family="mono" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                {act.date}
              </NuveText>
            </View>
            <NuveText variant="mono" weight="bold" color={act.color} style={{ fontSize: 13 }}>{act.amount}</NuveText>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
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
    borderRadius: 24, paddingHorizontal: 12, paddingVertical: 6,
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
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.teal,
    borderWidth: 2,
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
    backgroundColor: Colors.gold + '12',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
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
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wealthCard: { marginBottom: 24, gap: 40 },
  wealthTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wealthBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  returnSection: {
    alignItems: 'flex-end',
    gap: 2,
  },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
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
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
