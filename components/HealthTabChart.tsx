import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Colors } from "../constants/theme";

type HealthTab = "sleep" | "heart" | "battery";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SLEEP_DATA = [7, 6, 8, 5, 9, 7, 7];
const HEART_DATA = [68, 72, 75, 88, 65, 70, 73];
const BATTERY_DATA = [80, 65, 72, 35, 90, 68, 70];

function sleepColor(hours: number): string {
  if (hours >= 8) return Colors.calm;
  if (hours >= 6) return Colors.kulmanAccent;
  return Colors.mild;
}

function heartColor(bpm: number): string {
  if (bpm < 70) return Colors.calm;
  if (bpm <= 85) return Colors.kulmanAccent;
  return Colors.moderate;
}

function batteryColor(pct: number): string {
  if (pct >= 70) return Colors.calm;
  if (pct >= 40) return Colors.kulmanAccent;
  return Colors.mild;
}

interface TabConfig {
  label: string;
  emoji: string;
  data: number[];
  maxValue: number;
  unit: string;
  colorFn: (v: number) => string;
  avgLabel: (avg: number) => string;
  legend: { color: string; label: string }[];
}

const TAB_CONFIG: Record<HealthTab, TabConfig> = {
  sleep: {
    label: "Sleep",
    emoji: "💤",
    data: SLEEP_DATA,
    maxValue: 10,
    unit: "h",
    colorFn: sleepColor,
    avgLabel: (avg) => `${avg.toFixed(1)}h avg`,
    legend: [
      { color: Colors.calm, label: "≥8h great" },
      { color: Colors.kulmanAccent, label: "6–8h good" },
      { color: Colors.mild, label: "<6h low" },
    ],
  },
  heart: {
    label: "Heart Rate",
    emoji: "❤️",
    data: HEART_DATA,
    maxValue: 120,
    unit: "bpm",
    colorFn: heartColor,
    avgLabel: (avg) => `${Math.round(avg)} bpm avg`,
    legend: [
      { color: Colors.calm, label: "<70 restful" },
      { color: Colors.kulmanAccent, label: "70–85 normal" },
      { color: Colors.moderate, label: ">85 elevated" },
    ],
  },
  battery: {
    label: "Body Battery",
    emoji: "⚡",
    data: BATTERY_DATA,
    maxValue: 100,
    unit: "%",
    colorFn: batteryColor,
    avgLabel: (avg) => `${Math.round(avg)}% avg`,
    legend: [
      { color: Colors.calm, label: "≥70% high" },
      { color: Colors.kulmanAccent, label: "40–70% ok" },
      { color: Colors.mild, label: "<40% low" },
    ],
  },
};

const TABS: HealthTab[] = ["sleep", "heart", "battery"];

export const HealthTabChart = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>("sleep");
  const config = TAB_CONFIG[activeTab];

  const barData = config.data.map((value, i) => ({
    value,
    label: DAYS[i],
    frontColor: config.colorFn(value),
    topLabelComponent: () => (
      <Text style={{ fontSize: 9, color: Colors.textSecondary, marginBottom: 2 }}>
        {value}{config.unit}
      </Text>
    ),
  }));

  const avg = config.data.reduce((s, v) => s + v, 0) / config.data.length;

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14 }}>
      {/* Title */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
        Your Health This Week
      </Text>

      {/* Tab bar */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          const cfg = TAB_CONFIG[tab];
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: isActive ? Colors.primary : Colors.background,
                borderWidth: 1,
                borderColor: isActive ? Colors.primary : Colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: isActive ? Colors.white : Colors.textSecondary }}>
                {cfg.emoji} {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bar chart */}
      <View style={{ borderRadius: 12, overflow: "hidden" }}>
        <BarChart
          data={barData}
          height={140}
          barWidth={28}
          spacing={12}
          noOfSections={4}
          maxValue={config.maxValue}
          yAxisColor="transparent"
          xAxisColor={Colors.border}
          rulesColor={Colors.border}
          yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          hideYAxisText
          barBorderRadius={6}
          isAnimated
        />
      </View>

      {/* Legend + average */}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {config.legend.map((l) => (
          <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: l.color }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 }}>
        <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Weekly Average
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 2 }}>
          {config.avgLabel(avg)}
        </Text>
      </View>
    </View>
  );
};
