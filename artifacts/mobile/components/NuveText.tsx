import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { useIsRTL } from '@/hooks/useStrings';

interface NuveTextProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function NuveText({ variant = 'body', color, weight, style, ...props }: NuveTextProps) {
  const isRTL = useIsRTL();

  const variantStyle = styles[variant];
  const weightMap = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  };

  return (
    <Text
      style={[
        variantStyle,
        { color: color ?? Colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
        weight ? { fontFamily: weightMap[weight] } : {},
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
