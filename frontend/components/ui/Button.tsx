import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, GradientColors } from "../../constants/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  color,
}: ButtonProps) => {
  const padding: ViewStyle =
    size === "sm" ? { paddingVertical: 8, paddingHorizontal: 16 }
    : size === "lg" ? { paddingVertical: 16, paddingHorizontal: 32 }
    : { paddingVertical: 12, paddingHorizontal: 24 };

  const fontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const borderRadius = 12;
  const opacity = disabled || loading ? 0.5 : 1;

  const inner = loading ? (
    <ActivityIndicator color={variant === "primary" ? Colors.white : color || Colors.primary} />
  ) : (
    <Text style={{ color: variant === "primary" ? Colors.white : color || Colors.primary, fontSize, fontWeight: "600" }}>
      {label}
    </Text>
  );

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={{ borderRadius, overflow: "hidden", opacity }}
      >
        <LinearGradient
          colors={GradientColors.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[{ alignItems: "center", justifyContent: "center" }, padding]}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        { borderRadius, alignItems: "center", justifyContent: "center" },
        variant === "outline"
          ? { borderWidth: 1.5, borderColor: color || Colors.primary }
          : {},
        padding,
        { opacity },
      ]}
    >
      {inner}
    </TouchableOpacity>
  );
};
