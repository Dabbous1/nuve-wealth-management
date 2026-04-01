import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

interface DocItem {
  key: 'frontId' | 'backId' | 'selfie';
  icon: 'credit-card' | 'credit-card' | 'camera';
  label: string;
  sublabel: string;
  facing: 'back' | 'front';
  aspect: [number, number];
}

const DOCS: DocItem[] = [
  {
    key: 'frontId',
    icon: 'credit-card',
    label: 'National ID — Front',
    sublabel: 'Tap to open camera · Place ID flat',
    facing: 'back',
    aspect: [4, 3],
  },
  {
    key: 'backId',
    icon: 'credit-card',
    label: 'National ID — Back',
    sublabel: 'Tap to open camera · Show machine-readable zone',
    facing: 'back',
    aspect: [4, 3],
  },
  {
    key: 'selfie',
    icon: 'camera',
    label: 'Quick Selfie',
    sublabel: 'Tap to open front camera · Look straight ahead',
    facing: 'front',
    aspect: [1, 1],
  },
];

export default function KYCScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 52 : insets.top;
  const botPad = isWeb ? 24 : insets.bottom;

  const [uploads, setUploads] = useState<Record<string, { uri: string; state: UploadState }>>({});

  const openCamera = async (doc: DocItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: doc.aspect,
      quality: 0.9,
      cameraType: doc.facing === 'front'
        ? ImagePicker.CameraType.front
        : ImagePicker.CameraType.back,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploads((prev) => ({ ...prev, [doc.key]: { uri, state: 'uploading' } }));
      setTimeout(() => {
        setUploads((prev) => ({ ...prev, [doc.key]: { uri, state: 'done' } }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 1000);
    }
  };

  const allDone = DOCS.every((d) => uploads[d.key]?.state === 'done');

  const handleSubmit = () => {
    if (!allDone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/kyc-success');
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
                step === 3 && { width: 24, backgroundColor: C.gold, borderRadius: 4 },
                step < 3 && { backgroundColor: C.teal },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: C.teal + '12' }]}>
            <Feather name="shield" size={32} color={C.teal} />
          </View>
        </View>

        <NuveText variant="h1" family="display" weight="semibold" color={C.textPrimary} style={styles.title}>
          Verify your identity
        </NuveText>
        <NuveText variant="body" color={C.slate} style={styles.subtitle}>
          Step 3 of 4 · eKYC — Identity Documents
        </NuveText>

        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: C.teal + '10' }]}>
          <Feather name="info" size={16} color={C.teal} />
          <NuveText variant="caption" color={C.slate} style={{ flex: 1 }}>
            Required by FRA regulations. Your documents are encrypted with AES-256 and never shared with third parties.
          </NuveText>
        </View>

        {/* Upload cards */}
        {DOCS.map((doc) => {
          const upload = uploads[doc.key];
          const isDone = upload?.state === 'done';
          const isUploading = upload?.state === 'uploading';
          return (
            <TouchableOpacity
              key={doc.key}
              style={[styles.uploadCard, { backgroundColor: C.white, borderColor: C.borderLight }, isDone && { borderColor: C.teal, backgroundColor: C.teal + '06' }]}
              onPress={() => openCamera(doc)}
              activeOpacity={0.75}
            >
              <View style={styles.uploadLeft}>
                {isDone && upload?.uri ? (
                  <Image source={{ uri: upload.uri }} style={styles.thumbnail} />
                ) : (
                  <View style={[styles.uploadIcon, { backgroundColor: C.teal + '12' }, isDone && { backgroundColor: C.teal + '15' }]}>
                    <Feather name={doc.icon} size={22} color={C.teal} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <NuveText variant="body" weight="semibold" color={C.textPrimary}>
                    {doc.label}
                  </NuveText>
                  <NuveText variant="caption" color={C.slate}>
                    {isUploading ? 'Processing…' : isDone ? 'Uploaded successfully' : doc.sublabel}
                  </NuveText>
                </View>
              </View>
              <View style={[styles.uploadStatus, { backgroundColor: C.teal + '10' }, isDone && { backgroundColor: C.teal + '15' }]}>
                {isUploading ? (
                  <Feather name="loader" size={18} color={C.gold} />
                ) : isDone ? (
                  <Feather name="check-circle" size={18} color={C.success} />
                ) : (
                  <Feather name="camera" size={18} color={C.teal} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: C.white, borderColor: C.borderLight }]}>
          <NuveText variant="caption" weight="semibold" color={C.textPrimary} style={{ marginBottom: 8 }}>
            Tips for best results
          </NuveText>
          {[
            'Use natural or bright lighting',
            'Avoid glare or reflections on the ID',
            'Ensure all text and corners are visible',
            'For the selfie, look directly at the camera',
          ].map((tip, i) => (
            <View key={i} style={styles.tip}>
              <View style={[styles.tipDot, { backgroundColor: C.gold }]} />
              <NuveText variant="caption" color={C.slate}>{tip}</NuveText>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: C.teal }, !allDone && { backgroundColor: C.grayLight }]}
        onPress={handleSubmit}
        activeOpacity={allDone ? 0.8 : 1}
      >
        <Feather name="check-circle" size={18} color={Colors.midnight} />
        <NuveText variant="body" weight="semibold" color={Colors.midnight}>
          {allDone ? 'Submit for Verification' : `${Object.values(uploads).filter((u) => u.state === 'done').length} of 3 uploaded`}
        </NuveText>
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
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  uploadLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  uploadStatus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tipsCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  submitBtn: {
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
