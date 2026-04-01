import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';

export function useMarketOptions() {
  const C = useColors();
  return [
    {
      id: 'EGX',
      flag: '\u{1F1EA}\u{1F1EC}',
      label: 'Egypt Exchange',
      sub: 'EGX30 \u00B7 Stocks, Funds & T-Bills',
      currency: 'EGP',
      color: Colors.midnight,
    },
    {
      id: 'US',
      flag: '\u{1F1FA}\u{1F1F8}',
      label: 'US Markets',
      sub: 'NYSE \u00B7 NASDAQ \u00B7 S&P 500',
      currency: 'USD',
      color: C.blue,
    },
    {
      id: 'Global',
      flag: '\u{1F310}',
      label: 'Global Markets',
      sub: 'MSCI World \u00B7 Multi-region ETFs',
      currency: 'USD',
      color: C.info,
    },
    {
      id: 'EM',
      flag: '\u{1F30D}',
      label: 'Emerging Markets',
      sub: 'BRICS \u00B7 Asia \u00B7 LatAm \u00B7 EM Bonds',
      currency: 'USD',
      color: C.success,
    },
  ];
}

export const MARKET_OPTIONS = [
  {
    id: 'EGX',
    flag: '\u{1F1EA}\u{1F1EC}',
    label: 'Egypt Exchange',
    sub: 'EGX30 \u00B7 Stocks, Funds & T-Bills',
    currency: 'EGP',
    color: Colors.midnight,
  },
  {
    id: 'US',
    flag: '\u{1F1FA}\u{1F1F8}',
    label: 'US Markets',
    sub: 'NYSE \u00B7 NASDAQ \u00B7 S&P 500',
    currency: 'USD',
    color: Colors.blue,
  },
  {
    id: 'Global',
    flag: '\u{1F310}',
    label: 'Global Markets',
    sub: 'MSCI World \u00B7 Multi-region ETFs',
    currency: 'USD',
    color: Colors.info,
  },
  {
    id: 'EM',
    flag: '\u{1F30D}',
    label: 'Emerging Markets',
    sub: 'BRICS \u00B7 Asia \u00B7 LatAm \u00B7 EM Bonds',
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
  const C = useColors();

  const handleSelect = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect(id);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: C.white }]} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: C.grayLight }]} />
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <NuveText variant="h2" weight="bold" family="display">Switch Market</NuveText>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: C.borderLight }]}>
                <Feather name="x" size={18} color={C.slate} />
              </TouchableOpacity>
            </View>
            <NuveText variant="body" color={C.slate} style={{ marginBottom: 20 }}>
              Choose which market to explore and invest in.
            </NuveText>

            {MARKET_OPTIONS.map(m => {
              const active = m.id === currentMarket;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.option,
                    { backgroundColor: C.cream, borderColor: C.borderLight },
                    active && { borderColor: C.teal, backgroundColor: C.teal + '08' },
                  ]}
                  onPress={() => handleSelect(m.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.flagBox, { backgroundColor: m.color + '15' }]}>
                    <Text style={styles.flagEmoji}>{m.flag}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <NuveText variant="body" weight="semibold">{m.label}</NuveText>
                      <View style={[styles.currencyBadge, { backgroundColor: m.color + '15' }]}>
                        <NuveText variant="caption" weight="bold" color={m.color}>{m.currency}</NuveText>
                      </View>
                    </View>
                    <NuveText variant="caption" color={C.slate}>{m.sub}</NuveText>
                  </View>
                  {active ? (
                    <View style={[styles.checkCircle, { backgroundColor: m.color }]}>
                      <Feather name="check" size={12} color={'#FAFAF8'} />
                    </View>
                  ) : (
                    <Feather name="chevron-right" size={18} color={C.slate} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: C.cream, borderColor: C.borderLight }]}
              onPress={onClose}
            >
              <NuveText variant="body" weight="semibold" color={C.slate}>Cancel</NuveText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 20, padding: 14,
    marginBottom: 10, borderWidth: 1,
  },
  flagBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  flagEmoji: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
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
    borderRadius: 20,
    borderWidth: 1,
  },
});
