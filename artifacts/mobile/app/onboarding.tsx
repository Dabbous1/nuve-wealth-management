import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useApp } from '@/context/AppContext';
import { useStrings } from '@/hooks/useStrings';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'target' as const,
    titleKey: 'onboarding1Title' as const,
    bodyKey: 'onboarding1Body' as const,
    color: Colors.primary,
  },
  {
    icon: 'activity' as const,
    titleKey: 'onboarding2Title' as const,
    bodyKey: 'onboarding2Body' as const,
    color: '#2980B9',
  },
  {
    icon: 'eye' as const,
    titleKey: 'onboarding3Title' as const,
    bodyKey: 'onboarding3Body' as const,
    color: Colors.gold,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setLanguage } = useApp();
  const s = useStrings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLastSlide) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }
  };

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const handleCreateAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/register');
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/sign-in');
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Language toggle */}
      <View style={styles.langRow}>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLanguage('en')}>
          <NuveText variant="caption" weight="semibold" color={Colors.textSecondary}>EN</NuveText>
        </TouchableOpacity>
        <NuveText variant="caption" color={Colors.gray300}> | </NuveText>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLanguage('ar')}>
          <NuveText variant="caption" weight="semibold" color={Colors.textSecondary}>عر</NuveText>
        </TouchableOpacity>
      </View>

      {/* Brand */}
      <View style={styles.brand}>
        <NuveText variant="display" weight="bold" color={Colors.primary}>Nuvé</NuveText>
        <View style={styles.goldLine} />
        <NuveText variant="caption" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
          {s.tagline}
        </NuveText>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.slides}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.color + '18' }]}>
              <Feather name={slide.icon} size={40} color={slide.color} />
            </View>
            <NuveText variant="h1" style={styles.slideTitle} color={Colors.textPrimary}>
              {s[slide.titleKey]}
            </NuveText>
            <NuveText variant="body" style={styles.slideBody} color={Colors.textSecondary}>
              {s[slide.bodyKey]}
            </NuveText>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA — last slide shows two buttons, others show Continue */}
      {isLastSlide ? (
        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateAccount}>
            <Feather name="user-plus" size={18} color={Colors.white} />
            <NuveText variant="body" weight="semibold" color={Colors.white}>
              Create Account
            </NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSignIn}>
            <Feather name="log-in" size={18} color={Colors.primary} />
            <NuveText variant="body" weight="semibold" color={Colors.primary}>
              Sign In
            </NuveText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
          <NuveText variant="body" weight="semibold" color={Colors.white}>
            {s.continue}
          </NuveText>
          <Feather name="arrow-right" size={18} color={Colors.white} />
        </TouchableOpacity>
      )}

      <NuveText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginTop: 12 }}>
        By Acumen Holding · FRA Licensed since 2010
      </NuveText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  langRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 16,
  },
  langBtn: {
    padding: 4,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  goldLine: {
    width: 40,
    height: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  slides: {
    flex: 1,
    marginHorizontal: -24,
  },
  slide: {
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    textAlign: 'center',
  },
  slideBody: {
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray300,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.gold,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
});
