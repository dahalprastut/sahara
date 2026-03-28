import React from "react";
import { View, Text } from "react-native";

interface AvatarProps {
  name: string;
  size?: number;
}

function colorFromName(name: string): string {
  const colors = ["#6C63FF", "#FF8A65", "#42A5F5", "#26A69A", "#AB47BC", "#EC407A", "#66BB6A"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = ({ name, size = 36 }: AvatarProps) => {
  const bg = colorFromName(name);
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.38, fontWeight: "700" }}>{initials}</Text>
    </View>
  );
};
