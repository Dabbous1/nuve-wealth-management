import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const botPad = isWeb ? 24 : insets.bottom;
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone ?? '01X XXXX XXXX';

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val: string, index: number) => {
    setError('');
    const digit = val.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const entered = code.join('');
    if (entered.length < CODE_LENGTH) {
      setError('Please enter the full 6-digit code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/kyc');
  };

  const handleResend = () => {
    if (!canResend) return;
    setCode(Array(CODE_LENGTH).fill(''));
    setResendTimer(30);
    setCanResend(false);
    setError('');
    inputRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad, backgroundColor: C.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                { backgroundColor: C.grayLight },
                step === 2 && { width: 24, backgroundColor: C.gold, borderRadius: 4 },
                step < 2 && { backgroundColor: C.teal },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: C.teal + '12' }]}>
          <Feather name="smartphone" size={36} color={C.teal} />
        </View>

        <NuveText variant="h1" family="display" weight="semibold" color={C.textPrimary} style={styles.title}>
          Verify your number
        </NuveText>
        <NuveText variant="body" color={C.slate} style={styles.subtitle}>
          Step 2 of 4 · Phone Verification
        </NuveText>
        <NuveText variant="body" color={C.slate} style={styles.instruction}>
          We sent a 6-digit code to{'\n'}
          <NuveText variant="body" weight="semibold" color={C.textPrimary}>{phone}</NuveText>
        </NuveText>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpBox,
                { borderColor: C.borderLight, backgroundColor: C.white, color: C.textPrimary },
                digit ? { borderColor: C.teal, backgroundColor: C.teal + '08' } : null,
                error ? { borderColor: C.error } : null,
              ]}
              value={digit}
              onChangeText={(val) => handleChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? (
          <NuveText variant="caption" color={C.error} style={styles.errMsg}>{error}</NuveText>
        ) : null}

        {/* Resend */}
        <TouchableOpacity style={styles.resendRow} onPress={handleResend} disabled={!canResend}>
          <Feather name="refresh-cw" size={14} color={canResend ? C.teal : C.slate} />
          <NuveText variant="caption" color={canResend ? C.teal : C.slate} weight={canResend ? 'semibold' : 'regular'}>
            {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
          </NuveText>
        </TouchableOpacity>

        {/* Security note */}
        <View style={[styles.securityNote, { backgroundColor: C.gold + '12' }]}>
          <Feather name="lock" size={14} color={C.gold} />
          <NuveText variant="caption" color={C.slate} style={{ flex: 1 }}>
            This code expires in 10 minutes. Never share it with anyone.
          </NuveText>
        </View>
      </View>

      <TouchableOpacity style={[styles.verifyBtn, { backgroundColor: C.teal }]} onPress={handleVerify}>
        <NuveText variant="body" weight="semibold" color={Colors.midnight}>Verify & Continue</NuveText>
        <Feather name="arrow-right" size={18} color={Colors.midnight} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  instruction: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  errMsg: {
    marginBottom: 12,
  },
  resendRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 8,
  },
  securityNote: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    width: '100%',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 12,
  },
});
