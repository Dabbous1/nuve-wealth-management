import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';

interface NuveCardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'default' | 'dark' | 'gold';
  padding?: number;
}

export function NuveCard({ onPress, variant = 'default', padding = 16, style, children, ...props }: NuveCardProps) {
  const bgColor = variant === 'dark' ? Colors.primary : variant === 'gold' ? Colors.gold : Colors.white;
  const shadowColor = variant === 'dark' ? '#000' : Colors.primary;

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: bgColor, padding, shadowColor },
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
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
