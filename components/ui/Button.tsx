import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/theme";

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
  const bg =
    variant === "primary"
      ? { backgroundColor: color || Colors.primary }
      : variant === "outline"
      ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: color || Colors.primary }
      : { backgroundColor: "transparent" };

  const textColor =
    variant === "primary"
      ? Colors.white
      : color || Colors.primary;

  const padding =
    size === "sm" ? { paddingVertical: 8, paddingHorizontal: 16 }
    : size === "lg" ? { paddingVertical: 16, paddingHorizontal: 32 }
    : { paddingVertical: 12, paddingHorizontal: 24 };

  const fontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        { borderRadius: 12, alignItems: "center", justifyContent: "center" },
        bg,
        padding,
        (disabled || loading) && { opacity: 0.5 },
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.white : color || Colors.primary} />
      ) : (
        <Text style={{ color: textColor, fontSize, fontWeight: "600" }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
