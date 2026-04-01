import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';

// ---------------------------------------------------------------------------
// Core Skeleton
// ---------------------------------------------------------------------------

type SkeletonVariant = 'rect' | 'circle' | 'text';

interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (default: '100%') */
  width?: number | string;
  /** Height (default driven by variant) */
  height?: number;
  /** Override border radius */
  borderRadius?: number;
  /** Use lighter colors for dark backgrounds */
  dark?: boolean;
  /** Extra styles */
  style?: ViewStyle;
}

const DEFAULT_HEIGHTS: Record<SkeletonVariant, number> = {
  rect: 48,
  circle: 44,
  text: 14,
};

export function Skeleton({
  variant = 'rect',
  width,
  height,
  borderRadius,
  dark = false,
  style,
}: SkeletonProps) {
  const h = height ?? DEFAULT_HEIGHTS[variant];
  const w = width ?? (variant === 'circle' ? h : '100%');

  const resolvedRadius =
    borderRadius ??
    (variant === 'circle' ? h / 2 : variant === 'text' ? 6 : 12);

  const bg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(196,204,214,0.25)';

  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.7 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
        repeatReverse: true,
      }}
      style={[
        {
          width: w as any,
          height: h,
          borderRadius: resolvedRadius,
          backgroundColor: bg,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonGroup — staggers children animation
// ---------------------------------------------------------------------------

interface SkeletonGroupProps {
  /** Delay in ms between each child (default 120) */
  stagger?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SkeletonGroup({ stagger = 120, children, style }: SkeletonGroupProps) {
  const items = React.Children.toArray(children);

  return (
    <View style={style}>
      {items.map((child, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: index * stagger,
          }}
        >
          {child}
        </MotiView>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Preset: SkeletonCard — generic card placeholder
// ---------------------------------------------------------------------------

interface SkeletonCardProps {
  dark?: boolean;
  style?: ViewStyle;
}

export function SkeletonCard({ dark = false, style }: SkeletonCardProps) {
  const C = useColors();
  return (
    <View
      style={[
        styles.card,
        dark
          ? { backgroundColor: Colors.midnight, borderColor: C.borderDark }
          : { backgroundColor: C.white, borderColor: C.borderLight },
        style,
      ]}
    >
      <Skeleton variant="text" width="40%" height={12} dark={dark} />
      <View style={{ height: 12 }} />
      <Skeleton variant="text" width="70%" height={16} dark={dark} />
      <View style={{ height: 16 }} />
      <Skeleton variant="rect" height={40} borderRadius={10} dark={dark} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Preset: SkeletonListItem — row with avatar + two text lines + chevron
// ---------------------------------------------------------------------------

interface SkeletonListItemProps {
  dark?: boolean;
  style?: ViewStyle;
}

export function SkeletonListItem({ dark = false, style }: SkeletonListItemProps) {
  const C = useColors();
  return (
    <View
      style={[
        styles.listItem,
        dark
          ? { backgroundColor: Colors.midnight, borderColor: C.borderDark }
          : { backgroundColor: C.white, borderColor: C.borderLight },
        style,
      ]}
    >
      <Skeleton variant="circle" height={44} dark={dark} />
      <View style={styles.listItemContent}>
        <Skeleton variant="text" width="60%" height={14} dark={dark} />
        <View style={{ height: 8 }} />
        <Skeleton variant="text" width="40%" height={10} dark={dark} />
      </View>
      <Skeleton variant="rect" width={16} height={16} borderRadius={4} dark={dark} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Preset: SkeletonWealthCard — matches Total Wealth Card on home screen
// ---------------------------------------------------------------------------

interface SkeletonWealthCardProps {
  style?: ViewStyle;
}

export function SkeletonWealthCard({ style }: SkeletonWealthCardProps) {
  return (
    <View style={[styles.card, styles.wealthCard, style]}>
      {/* Label */}
      <Skeleton variant="text" width={100} height={11} dark />
      <View style={{ height: 12 }} />

      {/* Balance row */}
      <View style={styles.row}>
        <Skeleton variant="text" width="55%" height={34} borderRadius={8} dark />
        <Skeleton variant="circle" height={28} dark />
      </View>
      <View style={{ height: 20 }} />

      {/* Return row */}
      <View style={styles.row}>
        <View style={{ gap: 6, flex: 1 }}>
          <Skeleton variant="text" width={80} height={10} dark />
          <Skeleton variant="text" width={120} height={14} dark />
        </View>
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          <Skeleton variant="text" width={60} height={10} dark />
          <Skeleton variant="rect" width={72} height={24} borderRadius={12} dark />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  wealthCard: {
    backgroundColor: Colors.midnight,
    borderColor: Colors.borderDark,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
