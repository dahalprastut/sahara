import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Persona } from "../types";
import { personaColor, Colors } from "../constants/theme";
import { PERSONAS } from "../constants/personas";

interface PersonaSelectorProps {
  active: Persona;
  onChange: (p: Persona) => void;
}

export const PersonaSelector = ({ active, onChange }: PersonaSelectorProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
    {PERSONAS.map((p) => {
      const isActive = p.id === active;
      const color = personaColor[p.id];
      return (
        <TouchableOpacity
          key={p.id}
          onPress={() => onChange(p.id)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 100,
            backgroundColor: isActive ? color : Colors.surface,
            borderWidth: 1.5,
            borderColor: isActive ? color : Colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: isActive ? Colors.white : Colors.textSecondary }}>
            {p.emoji} {p.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);
