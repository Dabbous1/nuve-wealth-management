import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Platform, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useApp } from '@/context/AppContext';

export default function KYCSuccessScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const botPad = isWeb ? 40 : insets.bottom;
  const { setIsOnboarded } = useApp();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleEnterApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setIsOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={[styles.stepDot, styles.stepDotDone]} />
        ))}
      </View>

      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.successRing, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.successCircle}>
            <Feather name="check" size={48} color={Colors.white} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <NuveText variant="display" weight="bold" color={Colors.textPrimary} style={styles.title}>
            Identity Verified!
          </NuveText>
          <NuveText variant="body" color={Colors.textSecondary} style={styles.subtitle}>
            Step 4 of 4 · Welcome to Nuvé
          </NuveText>
          <NuveText variant="body" color={Colors.textSecondary} style={styles.body}>
            Your identity has been successfully verified. Your account is now active and FRA-compliant.
          </NuveText>

          {/* Details */}
          <View style={styles.detailsCard}>
            {[
              { icon: 'shield', label: 'FRA Compliance', value: 'Verified' },
              { icon: 'check-circle', label: 'eKYC Status', value: 'Approved' },
              { icon: 'lock', label: 'Account Security', value: 'Active' },
              { icon: 'star', label: 'Account Tier', value: 'Premium' },
            ].map((item) => (
              <View key={item.label} style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Feather name={item.icon as any} size={16} color={Colors.primary} />
                </View>
                <NuveText variant="body" color={Colors.textSecondary} style={{ flex: 1 }}>{item.label}</NuveText>
                <View style={styles.verifiedPill}>
                  <NuveText variant="caption" weight="semibold" color={Colors.success}>{item.value}</NuveText>
                </View>
              </View>
            ))}
          </View>

          {/* FRA badge */}
          <View style={styles.fraBadge}>
            <Feather name="award" size={16} color={Colors.gold} />
            <NuveText variant="caption" color={Colors.textMuted} style={{ flex: 1 }}>
              Licensed by the Financial Regulatory Authority (FRA) · License No. 897
            </NuveText>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 24 }}>
        <TouchableOpacity style={styles.enterBtn} onPress={handleEnterApp}>
          <NuveText variant="body" weight="semibold" color={Colors.white}>Enter Nuvé</NuveText>
          <Feather name="arrow-right" size={18} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray200,
  },
  stepDotDone: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPill: {
    backgroundColor: Colors.success + '15',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  fraBadge: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: Colors.gold + '12',
    borderRadius: 10,
    padding: 12,
    width: '100%',
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 12,
  },
});
