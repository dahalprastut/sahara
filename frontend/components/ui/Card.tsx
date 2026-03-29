import React from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card = ({ children, style, padding = 16 }: CardProps) => (
  <View
    style={[
      {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
      style,
    ]}
  >
    {children}
  </View>
);
