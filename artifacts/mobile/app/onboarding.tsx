import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform,
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

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'target' as const,
    titleKey: 'onboarding1Title' as const,
    bodyKey: 'onboarding1Body' as const,
    color: Colors.gold,
  },
  {
    icon: 'activity' as const,
    titleKey: 'onboarding2Title' as const,
    bodyKey: 'onboarding2Body' as const,
    color: Colors.gold,
  },
  {
    icon: 'eye' as const,
    titleKey: 'onboarding3Title' as const,
    bodyKey: 'onboarding3Body' as const,
    color: Colors.gold,
  },
];

export default function OnboardingScreen() {
  const C = useColors();
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
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad, backgroundColor: C.background }]}>
      {/* Language toggle */}
      <View style={styles.langRow}>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLanguage('en')}>
          <NuveText variant="caption" weight="semibold" color={C.slate}>EN</NuveText>
        </TouchableOpacity>
        <NuveText variant="caption" color={C.grayLight}> | </NuveText>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLanguage('ar')}>
          <NuveText variant="caption" weight="semibold" color={C.slate}>AR</NuveText>
        </TouchableOpacity>
      </View>

      {/* Brand */}
      <View style={styles.brand}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <NuveText variant="display" weight="light" color={C.textPrimary} style={{ fontSize: 42, letterSpacing: 4 }}>
            Nuv
          </NuveText>
          <NuveText variant="display" weight="light" color={C.teal} style={{ fontSize: 42, letterSpacing: 4 }}>
            e
          </NuveText>
        </View>
        <View style={[styles.goldLine, { backgroundColor: C.gold }]} />
        <NuveText variant="label" color={C.slate} style={{ textAlign: 'center', fontSize: 10, letterSpacing: 2 }}>
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
            <NuveText variant="h2" weight="light" style={styles.slideTitle} color={C.textPrimary}>
              {s[slide.titleKey]}
            </NuveText>
            <NuveText variant="body" style={styles.slideBody} color={C.slate}>
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
            style={[styles.dot, { backgroundColor: C.grayLight }, i === currentIndex && { width: 24, backgroundColor: C.teal }]}
          />
        ))}
      </View>

      {/* CTA */}
      {isLastSlide ? (
        <View style={styles.authButtons}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.teal }]} onPress={handleCreateAccount}>
            <Feather name="user-plus" size={18} color={Colors.midnight} />
            <NuveText variant="body" weight="semibold" color={Colors.midnight}>
              Create Account
            </NuveText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: C.textPrimary }]} onPress={handleSignIn}>
            <Feather name="log-in" size={18} color={C.textPrimary} />
            <NuveText variant="body" weight="semibold" color={C.textPrimary}>
              Sign In
            </NuveText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.teal }]} onPress={goNext}>
          <NuveText variant="body" weight="semibold" color={Colors.midnight}>
            {s.continue}
          </NuveText>
          <Feather name="arrow-right" size={18} color={Colors.midnight} />
        </TouchableOpacity>
      )}

      <NuveText variant="caption" color={C.slate} style={{ textAlign: 'center', marginTop: 16, fontSize: 11 }}>
        By Acumen Holding  ·  FRA Licensed since 2010
      </NuveText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  langRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 24,
  },
  langBtn: {
    padding: 4,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  goldLine: {
    width: 40,
    height: 3,
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
    gap: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    marginVertical: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    borderWidth: 1.5,
  },
});
