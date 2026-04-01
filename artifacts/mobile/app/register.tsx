import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const botPad = isWeb ? 24 : insets.bottom;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      e.fullName = 'Please enter your full name (first & last)';
    }
    if (!phone.trim() || !/^(\+20|0)?1[0125]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      e.phone = 'Enter a valid Egyptian mobile number';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      e.email = 'Enter a valid email address';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/verify-phone', params: { phone } });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={[styles.stepDot, step === 1 && styles.stepDotActive, step < 1 && styles.stepDotDone]}
              />
            ))}
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Icon */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Feather name="user" size={32} color={Colors.teal} />
            </View>
          </View>

          <NuveText variant="h1" family="display" weight="semibold" color={Colors.textPrimary} style={styles.title}>
            Create your account
          </NuveText>
          <NuveText variant="body" color={Colors.slate} style={styles.subtitle}>
            Step 1 of 4 · Personal Information
          </NuveText>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <NuveText variant="label" color={Colors.textPrimary} style={styles.label}>
              Full Name
            </NuveText>
            <View style={[styles.inputWrap, errors.fullName ? styles.inputError : null]}>
              <Feather name="user" size={18} color={Colors.slate} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Ahmed Mohamed Ali"
                placeholderTextColor={Colors.slate}
                value={fullName}
                onChangeText={(t) => { setFullName(t); setErrors((e) => ({ ...e, fullName: '' })); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {errors.fullName ? (
              <NuveText variant="caption" color={Colors.error} style={styles.errMsg}>{errors.fullName}</NuveText>
            ) : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <NuveText variant="label" color={Colors.textPrimary} style={styles.label}>
              Mobile Number
            </NuveText>
            <View style={[styles.inputWrap, errors.phone ? styles.inputError : null]}>
              <View style={styles.countryCode}>
                <NuveText variant="caption" weight="semibold" color={Colors.textPrimary}>🇪🇬 +20</NuveText>
              </View>
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholder="01X XXXX XXXX"
                placeholderTextColor={Colors.slate}
                value={phone}
                onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: '' })); }}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>
            {errors.phone ? (
              <NuveText variant="caption" color={Colors.error} style={styles.errMsg}>{errors.phone}</NuveText>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <NuveText variant="label" color={Colors.textPrimary} style={styles.label}>
              Email Address
            </NuveText>
            <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
              <Feather name="mail" size={18} color={Colors.slate} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.slate}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
              />
            </View>
            {errors.email ? (
              <NuveText variant="caption" color={Colors.error} style={styles.errMsg}>{errors.email}</NuveText>
            ) : null}
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Feather name="shield" size={14} color={Colors.gold} />
            <NuveText variant="caption" color={Colors.slate} style={{ flex: 1 }}>
              Your data is encrypted and protected under FRA regulations. We never share your personal information.
            </NuveText>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Continue button */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <NuveText variant="body" weight="semibold" color={Colors.midnight}>Continue</NuveText>
          <Feather name="arrow-right" size={18} color={Colors.midnight} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: Colors.grayLight,
  },
  stepDotActive: {
    width: 24,
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  stepDotDone: {
    backgroundColor: Colors.teal,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.teal + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: 'DMSans_400Regular',
  },
  countryCode: {
    paddingRight: 12,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderLight,
    marginRight: 12,
  },
  errMsg: {
    marginTop: 5,
    marginLeft: 2,
  },
  privacyNote: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.gold + '12',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 12,
  },
});
