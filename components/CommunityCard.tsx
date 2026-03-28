import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Community } from "../types";
import { Colors } from "../constants/theme";
import { Badge } from "./ui/Badge";

interface CommunityCardProps {
  community: Community;
  joined?: boolean;
  onJoin: () => void;
  onPress: () => void;
  compact?: boolean;
}

export const CommunityCard = ({ community, joined, onJoin, onPress, compact }: CommunityCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={{
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      width: compact ? 180 : undefined,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
      <Text style={{ fontSize: 28 }}>{community.emoji}</Text>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>
          {community.name}
        </Text>
        {!compact && (
          <Text style={{ fontSize: 13, color: Colors.textSecondary }} numberOfLines={1}>
            {community.description}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <Badge label={`${community.memberCount} members`} />
          {community.activeNow > 0 && (
            <Badge label={`${community.activeNow} active`} color="#D1FAE5" textColor="#065F46" />
          )}
          <Badge
            label={community.sizeType === "small" ? "Small group" : "Large group"}
            color={community.sizeType === "small" ? "#FEF3C7" : "#EDE9FE"}
            textColor={community.sizeType === "small" ? "#92400E" : "#5B21B6"}
          />
        </View>
      </View>
    </View>
    {!compact && (
      <TouchableOpacity
        onPress={joined ? () => {} : onJoin}
        style={{
          marginTop: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: joined ? Colors.primaryMuted : Colors.primary,
          alignItems: "center",
        }}
      >
        <Text style={{ color: joined ? Colors.primary : Colors.white, fontWeight: "600", fontSize: 14 }}>
          {joined ? "Joined ✓" : "Join Community"}
        </Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);
