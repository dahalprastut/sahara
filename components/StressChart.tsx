import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { StressPrediction } from "../types";
import { stressColor, Colors } from "../constants/theme";

interface StressChartProps {
  predictions: StressPrediction[];
}

const MOCK_WEEK: StressPrediction[] = (() => {
  const seed = [0.3, 0.6, 0.2, 0.75, 0.45, 0.15, 0.55];
  const now = Date.now();
  return seed.map((score, i) => ({
    score,
    level: score < 0.25 ? "calm" : score < 0.5 ? "mild" : score < 0.75 ? "moderate" : "severe",
    timestamp: now - (6 - i) * 86400000,
  }));
})() as StressPrediction[];

const MOCK_PREV_WEEK_AVG = 0.48;

function weekAverage(data: StressPrediction[]): number {
  return data.reduce((sum, p) => sum + p.score, 0) / data.length;
}

export const StressChart = ({ predictions }: StressChartProps) => {
  const data = predictions.length >= 7 ? predictions.slice(-7) : MOCK_WEEK;
  const avg = weekAverage(data);
  const prevAvg = MOCK_PREV_WEEK_AVG;
  const trend = avg < prevAvg ? "down" : "up";
  const trendLabel = trend === "down" ? "↓ Lower than last week" : "↑ Higher than last week";
  const trendColor = trend === "down" ? Colors.calm : Colors.moderate;

  const chartData = data.map((p) => ({
    value: Math.round(p.score * 100),
    label: new Date(p.timestamp).toLocaleDateString("en", { weekday: "short" }),
    dataPointColor: stressColor[p.level],
  }));

  const levelLabel = avg < 0.25 ? "calm" : avg < 0.5 ? "mild" : avg < 0.75 ? "moderate" : "severe";

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
          Your Stress This Week
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["calm", "mild", "moderate", "severe"] as const).map((level) => (
            <View key={level} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: stressColor[level] }} />
            </View>
          ))}
        </View>
      </View>

      {/* Chart */}
      <View style={{ borderRadius: 12, overflow: "hidden" }}>
        <LineChart
          data={chartData}
          height={150}
          color={Colors.primary}
          thickness={2.5}
          dataPointsColor={Colors.primary}
          startFillColor={Colors.primaryMuted}
          endFillColor={Colors.background}
          areaChart
          curved
          yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          maxValue={100}
          noOfSections={4}
          rulesColor={Colors.border}
          yAxisColor="transparent"
          xAxisColor={Colors.border}
          hideYAxisText
        />
      </View>

      {/* Legend row */}
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {(["calm", "mild", "moderate", "severe"] as const).map((level) => (
          <View key={level} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stressColor[level] }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary, textTransform: "capitalize" }}>{level}</Text>
          </View>
        ))}
      </View>

      {/* Weekly average */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12,
      }}>
        <View>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Weekly Average
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 2 }}>
            {Math.round(avg * 100)}
            <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.textSecondary }}>/100</Text>
          </Text>
          <Text style={{ fontSize: 12, color: stressColor[levelLabel], fontWeight: "600", marginTop: 2, textTransform: "capitalize" }}>
            {levelLabel} stress
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: trendColor }}>
          {trendLabel}
        </Text>
      </View>
    </View>
  );
};
