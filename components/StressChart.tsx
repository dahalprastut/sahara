import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { StressPrediction } from "../types";
import { stressColor, Colors } from "../constants/theme";

interface StressChartProps {
  predictions: StressPrediction[];
}

function generateMockWeekData(): StressPrediction[] {
  const days = 7;
  const now = Date.now();
  // Deterministic pseudo-random based on day offset
  const seed = [0.3, 0.6, 0.2, 0.75, 0.45, 0.15, 0.55];
  return Array.from({ length: days }, (_, i) => {
    const score = seed[i];
    return {
      score,
      level: score < 0.25 ? "calm" : score < 0.5 ? "mild" : score < 0.75 ? "moderate" : "severe",
      timestamp: now - (days - 1 - i) * 86400000,
    };
  });
}

export const StressChart = ({ predictions }: StressChartProps) => {
  const data = predictions.length >= 7 ? predictions.slice(-7) : generateMockWeekData();

  const chartData = data.map((p) => ({
    value: Math.round(p.score * 100),
    label: new Date(p.timestamp).toLocaleDateString("en", { weekday: "short" }),
    dataPointColor: stressColor[p.level],
  }));

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 12 }}>
        7-Day Stress History
      </Text>
      <LineChart
        data={chartData}
        height={160}
        color={Colors.primary}
        thickness={2.5}
        dataPointsColor={Colors.primary}
        startFillColor={Colors.primaryMuted}
        endFillColor={"#fff"}
        areaChart
        curved
        yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 11 }}
        xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 11 }}
        maxValue={100}
        noOfSections={4}
        rulesColor={Colors.border}
        yAxisColor="transparent"
        xAxisColor={Colors.border}
      />
      <View style={{ flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        {(["calm", "mild", "moderate", "severe"] as const).map((level) => (
          <View key={level} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stressColor[level] }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary, textTransform: "capitalize" }}>{level}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
