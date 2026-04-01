import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import Colors from '@/constants/colors';

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const BAR_COLOR_CYCLE = [
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
  color = Colors.teal,
  height = 200,
  width,
  showGradient = true,
  curved = true,
}: NuveLineChartProps) {
  return (
    <LineChart
      data={data}
      height={height}
      width={width}
      color={color}
      thickness={2}
      curved={curved}
      areaChart={showGradient}
      startFillColor={color}
      startOpacity={0.2}
      endFillColor={color}
      endOpacity={0}
      dataPointsColor={Colors.teal}
      dataPointsRadius={3}
      xAxisColor={Colors.borderLight}
      yAxisColor={Colors.borderLight}
      xAxisLabelTextStyle={styles.axisLabel}
      yAxisTextStyle={styles.axisLabel}
      rulesColor={Colors.borderLight}
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
      xAxisColor={Colors.borderLight}
      yAxisColor={Colors.borderLight}
      xAxisLabelTextStyle={styles.axisLabel}
      yAxisTextStyle={styles.axisLabel}
      rulesColor={Colors.borderLight}
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
        textColor={Colors.slate}
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
  color = Colors.teal,
  width = 80,
  height = 32,
}: NuveSparklineProps) {
  const chartData = data.map((value) => ({ value }));

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <LineChart
        data={chartData}
        height={height}
        width={width}
        color={color}
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
    color: Colors.slate,
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
