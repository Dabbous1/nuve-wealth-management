import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NuveText } from './NuveText';
import Colors from '@/constants/colors';

interface AllocationData {
  label: string;
  value: number;
  color: string;
}

interface AllocationBarsProps {
  data: AllocationData[];
}

export function AllocationBars({ data }: AllocationBarsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {data.map((slice, i) => (
          <View
            key={i}
            style={[
              styles.barSegment,
              {
                flex: slice.value,
                backgroundColor: slice.color,
                borderTopLeftRadius: i === 0 ? 6 : 0,
                borderBottomLeftRadius: i === 0 ? 6 : 0,
                borderTopRightRadius: i === data.length - 1 ? 6 : 0,
                borderBottomRightRadius: i === data.length - 1 ? 6 : 0,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {data.map((slice, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: slice.color }]} />
            <NuveText variant="caption" color={Colors.textSecondary}>{slice.label}</NuveText>
            <NuveText variant="caption" weight="semibold"> {slice.value}%</NuveText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
