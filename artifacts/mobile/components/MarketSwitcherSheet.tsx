import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';

export const MARKET_OPTIONS = [
  {
    id: 'EGX',
    flag: '🇪🇬',
    label: 'Egypt Exchange',
    sub: 'EGX30 · Stocks, Funds & T-Bills',
    currency: 'EGP',
    color: Colors.primary,
  },
  {
    id: 'US',
    flag: '🇺🇸',
    label: 'US Markets',
    sub: 'NYSE · NASDAQ · S&P 500',
    currency: 'USD',
    color: '#1A56DB',
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
  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <NuveText variant="h2" weight="bold">Switch Market</NuveText>
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
                  <Feather name="chevron-right" size={18} color={Colors.gray400} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <NuveText variant="body" weight="semibold" color={Colors.textSecondary}>Cancel</NuveText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center', marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center',
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.gray50, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent',
  },
  optionActive: {
    borderColor: Colors.primary, backgroundColor: Colors.primary + '05',
  },
  flagBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  currencyBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn: {
    alignItems: 'center', paddingVertical: 14, marginTop: 4,
    backgroundColor: Colors.gray100, borderRadius: 14,
  },
});
