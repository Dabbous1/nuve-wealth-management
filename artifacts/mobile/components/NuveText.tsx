import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { useIsRTL } from '@/hooks/useStrings';
import { useColors } from '@/hooks/useColors';

type FontFamily = 'display' | 'body' | 'mono';
type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'mono';

interface NuveTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  family?: FontFamily;
}

// Font family mappings per brand guidelines
const fontFamilies = {
  display: {
    light: 'CormorantGaramond_300Light',
    regular: 'CormorantGaramond_400Regular',
    medium: 'CormorantGaramond_500Medium',
    semibold: 'CormorantGaramond_600SemiBold',
    bold: 'CormorantGaramond_700Bold',
  },
  body: {
    light: 'DMSans_400Regular',       // DM Sans doesn't have 300, use 400
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semibold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold',
  },
  mono: {
    light: 'SpaceMono_400Regular',
    regular: 'SpaceMono_400Regular',
    medium: 'SpaceMono_400Regular',
    semibold: 'SpaceMono_700Bold',
    bold: 'SpaceMono_700Bold',
  },
};

// Which font family each variant defaults to
const variantFamily: Record<Variant, FontFamily> = {
  display: 'display',
  h1: 'display',
  h2: 'display',
  h3: 'display',
  body: 'body',
  bodySmall: 'body',
  caption: 'body',
  label: 'mono',
  mono: 'mono',
};

// Default weight per variant
const variantWeight: Record<Variant, keyof typeof fontFamilies.display> = {
  display: 'light',
  h1: 'light',
  h2: 'light',
  h3: 'regular',
  body: 'regular',
  bodySmall: 'regular',
  caption: 'regular',
  label: 'regular',
  mono: 'regular',
};

export function NuveText({
  variant = 'body',
  color,
  weight,
  family,
  style,
  ...props
}: NuveTextProps) {
  const isRTL = useIsRTL();
  const C = useColors();

  const resolvedFamily = family ?? variantFamily[variant];
  const resolvedWeight = weight ?? variantWeight[variant];
  const fontFamily = fontFamilies[resolvedFamily][resolvedWeight];

  return (
    <Text
      style={[
        styles[variant],
        {
          fontFamily,
          color: color ?? C.textPrimary,
          textAlign: isRTL ? 'right' : 'left',
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 36,      // Brand: 48px for web, scaled down for mobile
    lineHeight: 44,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  mono: {
    fontSize: 14,
    lineHeight: 20,
  },
});
