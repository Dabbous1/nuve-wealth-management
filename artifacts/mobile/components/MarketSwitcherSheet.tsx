import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BottomSheet from '@gorhom/bottom-sheet';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { NuveBottomSheet } from '@/components/NuveBottomSheet';

export const MARKET_OPTIONS = [
  {
    id: 'EGX',
    flag: '🇪🇬',
    label: 'Egypt Exchange',
    sub: 'EGX30 · Stocks, Funds & T-Bills',
    currency: 'EGP',
    color: Colors.midnight,
  },
  {
    id: 'US',
    flag: '🇺🇸',
    label: 'US Markets',
    sub: 'NYSE · NASDAQ · S&P 500',
    currency: 'USD',
    color: Colors.blue,
  },
  {
    id: 'Global',
    flag: '🌐',
    label: 'Global Markets',
    sub: 'MSCI World · Multi-region ETFs',
    currency: 'USD',
    color: Colors.info,
  },
  {
    id: 'EM',
    flag: '🌍',
    label: 'Emerging Markets',
    sub: 'BRICS · Asia · LatAm · EM Bonds',
    currency: 'USD',
    color: Colors.success,
  },
];

export function getMarketOption(id: string) {
  return MARKET_OPTIONS.find(m => m.id === id) ?? MARKET_OPTIONS[0];
}

interface Props {
  visible: boolean;
  currentMarket: string;
  onSelect: (marketId: string) => void;
  onClose: () => void;
}

export function MarketSwitcherSheet({ visible, currentMarket, onSelect, onClose }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%', '70%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSelect = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect(id);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <NuveBottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onClose={onClose}
    >
      <View style={styles.titleRow}>
        <NuveText variant="h2" weight="bold" family="display">Switch Market</NuveText>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <NuveText variant="body" color={Colors.textSecondary} style={{ marginBottom: 20 }}>
        Choose which market to explore and invest in.
      </NuveText>

      {MARKET_OPTIONS.map(m => {
        const active = m.id === currentMarket;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => handleSelect(m.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.flagBox, { backgroundColor: m.color + '15' }]}>
              <NuveText style={{ fontSize: 26 }}>{m.flag}</NuveText>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <NuveText variant="body" weight="semibold">{m.label}</NuveText>
                <View style={[styles.currencyBadge, { backgroundColor: m.color + '15' }]}>
                  <NuveText variant="caption" weight="bold" color={m.color}>{m.currency}</NuveText>
                </View>
              </View>
              <NuveText variant="caption" color={Colors.textMuted}>{m.sub}</NuveText>
            </View>
            {active ? (
              <View style={[styles.checkCircle, { backgroundColor: m.color }]}>
                <Feather name="check" size={12} color={Colors.white} />
              </View>
            ) : (
              <Feather name="chevron-right" size={18} color={Colors.slate} />
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <NuveText variant="body" weight="semibold" color={Colors.textSecondary}>Cancel</NuveText>
      </TouchableOpacity>
    </NuveBottomSheet>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.cream, borderRadius: 20, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight,
  },
  optionActive: {
    borderColor: Colors.teal, backgroundColor: Colors.teal + '08',
  },
  flagBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  currencyBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 24,
  },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn: {
    alignItems: 'center', paddingVertical: 14, marginTop: 4,
    backgroundColor: Colors.cream, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
});
