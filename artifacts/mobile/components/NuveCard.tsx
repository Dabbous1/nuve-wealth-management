import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface NuveCardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'default' | 'dark' | 'gold' | 'navy';
  padding?: number;
}

export function NuveCard({ onPress, variant = 'default', padding = 16, style, children, ...props }: NuveCardProps) {
  const C = useColors();

  const bgColor =
    variant === 'dark' ? C.midnight :
    variant === 'navy' ? C.navy :
    variant === 'gold' ? C.gold :
    C.white;

  const shadowColor = variant === 'dark' || variant === 'navy' ? '#000' : C.midnight;
  const borderColor =
    variant === 'dark' || variant === 'navy' ? C.borderDark :
    C.borderLight;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          padding,
          shadowColor,
          borderColor,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
});
