import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';

interface NuveCardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'default' | 'dark' | 'gold' | 'navy';
  padding?: number;
}

export function NuveCard({ onPress, variant = 'default', padding = 16, style, children, ...props }: NuveCardProps) {
  const bgColor =
    variant === 'dark' ? Colors.midnight :
    variant === 'navy' ? Colors.navy :
    variant === 'gold' ? Colors.gold :
    Colors.white;

  const shadowColor = variant === 'dark' || variant === 'navy' ? '#000' : Colors.midnight;
  const borderColor =
    variant === 'dark' || variant === 'navy' ? Colors.borderDark :
    Colors.borderLight;

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
