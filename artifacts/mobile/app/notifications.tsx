import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useApp, Notification } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const NOTIF_ICONS: Record<Notification['type'], string> = {
  rebalance: 'refresh-cw',
  milestone: 'award',
  research: 'book',
  market: 'trending-up',
  payment: 'dollar-sign',
};

const NOTIF_COLORS: Record<Notification['type'], string> = {
  rebalance: Colors.warning,
  milestone: Colors.gold,
  research: Colors.midnight,
  market: Colors.info,
  payment: Colors.success,
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead, language } = useApp();
  const s = useStrings();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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
        <NuveText variant="h3" weight="semibold">{s.notificationsTitle}</NuveText>
        <View style={{ width: 36 }} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bell-off" size={48} color={Colors.grayLight} />
          <NuveText variant="body" color={Colors.textMuted}>{s.noNotifications}</NuveText>
        </View>
      ) : (
        notifications.map(notif => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notifCard, !notif.read && styles.notifUnread]}
            onPress={() => markNotificationRead(notif.id)}
          >
            {!notif.read && <View style={styles.unreadDot} />}
            <View style={[styles.notifIcon, { backgroundColor: NOTIF_COLORS[notif.type] + '20' }]}>
              <Feather name={NOTIF_ICONS[notif.type] as any} size={20} color={NOTIF_COLORS[notif.type]} />
            </View>
            <View style={{ flex: 1 }}>
              <NuveText variant="bodySmall" weight="semibold">
                {language === 'ar' ? notif.titleAr : notif.title}
              </NuveText>
              <NuveText variant="caption" color={Colors.textSecondary} style={{ marginTop: 2, lineHeight: 18 }}>
                {language === 'ar' ? notif.bodyAr : notif.body}
              </NuveText>
              <NuveText variant="caption" color={Colors.textMuted} style={{ marginTop: 4 }}>
                {formatTime(notif.createdAt)}
              </NuveText>
            </View>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 60 }} />
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
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, position: 'relative',
    shadowColor: Colors.midnight, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  notifUnread: { backgroundColor: Colors.teal + '08', borderLeftWidth: 3, borderLeftColor: Colors.teal },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal,
  },
  notifIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
