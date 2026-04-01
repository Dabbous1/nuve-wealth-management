import React, { useEffect, Children, ReactNode } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  TextStyle,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';

// ---------------------------------------------------------------------------
// 1. FadeIn — fades in children with optional delay and translateY slide-up
// ---------------------------------------------------------------------------

interface FadeInProps {
  children: ReactNode;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Initial translateY offset (px) — defaults to 16 */
  from?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 400,
  from = 16,
  style,
}: FadeInProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(from);

  useEffect(() => {
    const timingConfig = {
      duration,
      easing: Easing.out(Easing.cubic),
    };

    opacity.value = withDelay(delay, withTiming(1, timingConfig));
    translateY.value = withDelay(delay, withTiming(0, timingConfig));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// 2. ScalePress — touchable wrapper that scales down on press
// ---------------------------------------------------------------------------

interface ScalePressProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Scale factor when pressed — defaults to 0.97 */
  scaleValue?: number;
  style?: StyleProp<ViewStyle>;
}

export function ScalePress({
  children,
  onPress,
  disabled = false,
  scaleValue = 0.97,
  style,
}: ScalePressProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// 3. AnimatedNumber — smoothly animates between number values
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AnimatedText = Animated.createAnimatedComponent(
  require('react-native').TextInput
) as any;

interface AnimatedNumberProps {
  /** Target numeric value */
  value: number;
  /** Prefix string (e.g. "$" or "EGP ") */
  prefix?: string;
  /** Suffix string (e.g. "%" or " pts") */
  suffix?: string;
  /** Animation duration (ms) */
  duration?: number;
  /** Text style */
  style?: StyleProp<TextStyle>;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 600,
  style,
}: AnimatedNumberProps) {
  const C = useColors();
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const current = animatedValue.value;
    // Format with commas / locale grouping
    const formatted = current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return {
      text: `${prefix}${formatted}${suffix}`,
      defaultValue: `${prefix}${formatted}${suffix}`,
    } as any;
  });

  return (
    <AnimatedText
      underlineColorAndroid={"transparent" as any}
      editable={false}
      style={[
        {
          fontFamily: 'SpaceMono_400Regular',
          color: C.textPrimary,
          fontSize: 16,
          padding: 0,
        },
        style,
      ] as any}
      {...{ animatedProps }}
    />
  );
}

// ---------------------------------------------------------------------------
// 4. ProgressBarAnimated — animated progress bar that fills smoothly
// ---------------------------------------------------------------------------

interface ProgressBarAnimatedProps {
  /** Progress value between 0 and 1 */
  progress: number;
  /** Fill color — defaults to Colors.teal */
  color?: string;
  /** Bar height in px — defaults to 6 */
  height?: number;
  /** Track background color */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBarAnimated({
  progress,
  color,
  height = 6,
  backgroundColor,
  style,
}: ProgressBarAnimatedProps) {
  const C = useColors();
  const resolvedColor = color ?? C.teal;
  const resolvedBg = backgroundColor ?? C.grayLight;
  const widthPercent = useSharedValue(0);

  useEffect(() => {
    // Clamp between 0 and 1
    const clamped = Math.min(1, Math.max(0, progress));
    widthPercent.value = withTiming(clamped * 100, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value}%` as any,
  }));

  const borderRadius = height / 2;

  return (
    <View
      style={[
        {
          height,
          borderRadius,
          backgroundColor: resolvedBg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height,
            borderRadius,
            backgroundColor: resolvedColor,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 5. StaggeredList — renders children with staggered fade-in animations
// ---------------------------------------------------------------------------

interface StaggeredListProps {
  children: ReactNode;
  /** Delay between each child's entrance (ms) — defaults to 50 */
  staggerDelay?: number;
  /** Initial delay before the first child animates (ms) */
  initialDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggeredList({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  style,
}: StaggeredListProps) {
  const childArray = Children.toArray(children);

  return (
    <View style={style}>
      {childArray.map((child, index) => (
        <FadeIn
          key={index}
          delay={initialDelay + index * staggerDelay}
        >
          {child}
        </FadeIn>
      ))}
    </View>
  );
}

export default {
  FadeIn,
  ScalePress,
  AnimatedNumber,
  ProgressBarAnimated,
  StaggeredList,
};
