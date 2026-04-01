import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput, Platform, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useApp } from '@/context/AppContext';

const PIN_LENGTH = 6;

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const botPad = isWeb ? 40 : insets.bottom;
  const { setIsOnboarded } = useApp();

  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'faceid' | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('faceid');
        } else {
          setBiometricType('fingerprint');
        }
      }
    } catch {
      // biometrics not available
    }
  };

  const shakePIN = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (val: string, index: number) => {
    setError('');
    const digit = val.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === PIN_LENGTH - 1) {
      setTimeout(() => verifyPin(newPin.join('')), 100);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (entered: string) => {
    // Demo: correct PIN is 123456
    if (entered === '123456') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setIsOnboarded(true);
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakePIN();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setError(`Incorrect PIN · ${3 - newAttempts < 0 ? 0 : 3 - newAttempts} attempts remaining. Try biometrics.`);
      } else {
        setError('Incorrect PIN — please try again');
      }
      setPin(Array(PIN_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleBiometric = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Nuvé',
        cancelLabel: 'Use PIN instead',
        disableDeviceFallback: false,
      });
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setIsOnboarded(true);
        router.replace('/(tabs)');
      }
    } catch {
      setError('Biometric authentication failed');
    }
  };

  const biometricIcon = biometricType === 'faceid' ? 'aperture' : 'cpu';
  const biometricLabel = biometricType === 'faceid' ? 'Face ID' : 'Fingerprint';

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <NuveText variant="h2" weight="bold" color={Colors.primary}>Nuvé</NuveText>
          <View style={styles.goldAccent} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Lock icon */}
        <View style={styles.lockCircle}>
          <Feather name="lock" size={32} color={Colors.primary} />
        </View>

        <NuveText variant="h1" weight="bold" color={Colors.textPrimary} style={styles.title}>
          Welcome back
        </NuveText>
        <NuveText variant="body" color={Colors.textSecondary} style={styles.subtitle}>
          Enter your 6-digit PIN to access your portfolio
        </NuveText>

        {/* PIN boxes */}
        <Animated.View style={[styles.pinRow, { transform: [{ translateX: shakeAnim }] }]}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.pinBox,
                digit ? styles.pinBoxFilled : null,
                error ? styles.pinBoxError : null,
              ]}
              value={digit ? '●' : ''}
              onChangeText={(val) => handleChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry={false}
              selectTextOnFocus
              caretHidden
            />
          ))}
        </Animated.View>

        {error ? (
          <NuveText variant="caption" color={Colors.error} style={styles.errMsg}>{error}</NuveText>
        ) : (
          <NuveText variant="caption" color={Colors.textMuted} style={styles.hintMsg}>
            Demo PIN: 123456
          </NuveText>
        )}

        {/* Biometric */}
        {biometricAvailable && (
          <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
            <View style={styles.biometricIcon}>
              <Feather name={biometricIcon as any} size={28} color={Colors.primary} />
            </View>
            <NuveText variant="caption" weight="semibold" color={Colors.primary}>
              {biometricLabel}
            </NuveText>
          </TouchableOpacity>
        )}

        {/* Web fallback for biometrics hint */}
        {isWeb && (
          <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
            <View style={styles.biometricIcon}>
              <Feather name="cpu" size={28} color={Colors.primary} />
            </View>
            <NuveText variant="caption" weight="semibold" color={Colors.primary}>
              Biometric Sign In
            </NuveText>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <NuveText variant="caption" color={Colors.textMuted} style={{ paddingHorizontal: 12 }}>or</NuveText>
          <View style={styles.divLine} />
        </View>

        {/* Forgot PIN */}
        <TouchableOpacity style={styles.forgotRow}>
          <Feather name="help-circle" size={14} color={Colors.textMuted} />
          <NuveText variant="caption" color={Colors.textMuted}>Forgot your PIN?</NuveText>
        </TouchableOpacity>

        {/* Don't have account */}
        <TouchableOpacity style={styles.switchRow} onPress={() => router.replace('/register')}>
          <NuveText variant="caption" color={Colors.textMuted}>Don't have an account?</NuveText>
          <NuveText variant="caption" weight="semibold" color={Colors.primary}> Create one</NuveText>
        </TouchableOpacity>
      </View>

      {/* Bottom badge */}
      <View style={styles.bottomBadge}>
        <Feather name="shield" size={13} color={Colors.gold} />
        <NuveText variant="caption" color={Colors.textMuted}>
          Secured by Acumen Holding · FRA License No. 897
        </NuveText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    alignItems: 'center',
    gap: 4,
  },
  goldAccent: {
    width: 24,
    height: 2,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  pinBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    fontSize: 24,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  pinBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  pinBoxError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '06',
  },
  errMsg: {
    marginBottom: 20,
    textAlign: 'center',
  },
  hintMsg: {
    marginBottom: 20,
    textAlign: 'center',
  },
  biometricBtn: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  biometricIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  forgotRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomBadge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
});
