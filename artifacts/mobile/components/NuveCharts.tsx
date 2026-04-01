import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const BAR_COLOR_CYCLE_STATIC = [
  Colors.midnight,
  Colors.teal,
  Colors.gold,
  Colors.blue,
  Colors.error,
  Colors.tealLight,
];

// ---------------------------------------------------------------------------
// 1. NuveLineChart — Portfolio performance over time
// ---------------------------------------------------------------------------

export interface NuveLineChartDatum {
  value: number;
  label?: string;
}

interface NuveLineChartProps {
  data: NuveLineChartDatum[];
  color?: string;
  height?: number;
  width?: number;
  showGradient?: boolean;
  curved?: boolean;
}

export function NuveLineChart({
  data,
  color,
  height = 200,
  width,
  showGradient = true,
  curved = true,
}: NuveLineChartProps) {
  const C = useColors();
  const resolvedColor = color ?? C.teal;
  return (
    <LineChart
      data={data}
      height={height}
      width={width}
      color={resolvedColor}
      thickness={2}
      curved={curved}
      areaChart={showGradient}
      startFillColor={resolvedColor}
      startOpacity={0.2}
      endFillColor={resolvedColor}
      endOpacity={0}
      dataPointsColor={C.teal}
      dataPointsRadius={3}
      xAxisColor={C.borderLight}
      yAxisColor={C.borderLight}
      xAxisLabelTextStyle={[styles.axisLabel, { color: C.slate }]}
      yAxisTextStyle={[styles.axisLabel, { color: C.slate }]}
      rulesColor={C.borderLight}
      rulesType="solid"
      noOfSections={4}
      hideDataPoints={data.length > 30}
      adjustToWidth={!width}
      isAnimated
      animationDuration={600}
    />
  );
}

// ---------------------------------------------------------------------------
// 2. NuveBarChart — Allocation breakdown, spending categories
// ---------------------------------------------------------------------------

export interface NuveBarChartDatum {
  value: number;
  label?: string;
  frontColor?: string;
}

interface NuveBarChartProps {
  data: NuveBarChartDatum[];
  height?: number;
  width?: number;
  horizontal?: boolean;
}

export function NuveBarChart({
  data,
  height = 200,
  width,
  horizontal = false,
}: NuveBarChartProps) {
  const C = useColors();
  const BAR_COLOR_CYCLE = [
    Colors.midnight,
    C.teal,
    C.gold,
    C.blue,
    C.error,
    C.tealLight,
  ];

  // Apply cycling brand colors to bars that don't specify their own color
  const coloredData = data.map((d, i) => ({
    ...d,
    frontColor: d.frontColor ?? BAR_COLOR_CYCLE[i % BAR_COLOR_CYCLE.length],
    topLabelComponent: undefined,
  }));

  return (
    <BarChart
      data={coloredData}
      height={height}
      width={width}
      horizontal={horizontal}
      barWidth={24}
      spacing={16}
      barBorderRadius={4}
      xAxisColor={C.borderLight}
      yAxisColor={C.borderLight}
      xAxisLabelTextStyle={[styles.axisLabel, { color: C.slate }]}
      yAxisTextStyle={[styles.axisLabel, { color: C.slate }]}
      rulesColor={C.borderLight}
      rulesType="solid"
      noOfSections={4}
      isAnimated
      animationDuration={500}
    />
  );
}

// ---------------------------------------------------------------------------
// 3. NuvePieChart — Portfolio allocation donut
// ---------------------------------------------------------------------------

export interface NuvePieChartDatum {
  value: number;
  color: string;
  text?: string;
}

interface NuvePieChartProps {
  data: NuvePieChartDatum[];
  radius?: number;
  innerRadius?: number;
  showLabels?: boolean;
  centerLabel?: ReactNode | (() => ReactNode);
}

export function NuvePieChart({
  data,
  radius = 100,
  innerRadius,
  showLabels = false,
  centerLabel,
}: NuvePieChartProps) {
  const C = useColors();
  const resolvedInner = innerRadius ?? Math.round(radius * 0.6);

  const renderCenterLabel = () => {
    if (!centerLabel) return undefined;
    if (typeof centerLabel === 'function') return centerLabel;
    return () => <View style={styles.centerLabel}>{centerLabel}</View>;
  };

  return (
    <View style={styles.pieContainer}>
      <PieChart
        data={data}
        radius={radius}
        innerRadius={resolvedInner}
        donut
        showText={showLabels}
        textColor={C.slate}
        textSize={11}
        fontStyle="normal"
        centerLabelComponent={renderCenterLabel()}
        isAnimated
        animationDuration={500}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 4. NuveSparkline — Minimal inline chart for list items
// ---------------------------------------------------------------------------

interface NuveSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function NuveSparkline({
  data,
  color,
  width = 80,
  height = 32,
}: NuveSparklineProps) {
  const C = useColors();
  const resolvedColor = color ?? C.teal;
  const chartData = data.map((value) => ({ value }));

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <LineChart
        data={chartData}
        height={height}
        width={width}
        color={resolvedColor}
        thickness={1.5}
        curved
        hideDataPoints
        hideAxesAndRules
        hideYAxisText
        hideOrigin
        adjustToWidth
        areaChart={false}
        isAnimated={false}
        initialSpacing={0}
        endSpacing={0}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  axisLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
