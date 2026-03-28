import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../constants/theme";

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

export const Badge = ({ label, color = Colors.primaryMuted, textColor = Colors.primary }: BadgeProps) => (
  <View style={{ backgroundColor: color, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 }}>
    <Text style={{ color: textColor, fontSize: 12, fontWeight: "600" }}>{label}</Text>
  </View>
);
