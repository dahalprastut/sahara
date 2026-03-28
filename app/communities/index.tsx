import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { CommunityCard } from "../../components/CommunityCard";
import { Colors } from "../../constants/theme";
import { COMMUNITIES, COMMUNITY_SUGGESTIONS } from "../../constants/communities";
import { useUserStore } from "../../stores/useUserStore";
import { CommunitySize } from "../../types";

export default function CommunitiesScreen() {
  const router = useRouter();
  const { joinedCommunities, joinCommunity, persona } = useUserStore();
  const [sizeFilter, setSizeFilter] = useState<CommunitySize | "all">("all");

  const suggested = (COMMUNITY_SUGGESTIONS[persona] || [])
    .map((id) => COMMUNITIES.find((c) => c.id === id))
    .filter((c): c is typeof COMMUNITIES[0] => c !== undefined);

  const filtered = COMMUNITIES.filter((c) =>
    sizeFilter === "all" ? true : c.sizeType === sizeFilter
  );

  const categories = [...new Set(filtered.map((c) => c.category))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.textPrimary }}>
          Find your community
        </Text>

        {/* Size filter */}
        <View style={{ flexDirection: "row", backgroundColor: Colors.surface, borderRadius: 12, padding: 4 }}>
          {(["all", "small", "large"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setSizeFilter(f)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: sizeFilter === f ? Colors.primary : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600" as const, color: sizeFilter === f ? Colors.white : Colors.textSecondary }}>
                {f === "all" ? "All" : f === "small" ? "Small (5\u201310)" : "Large (50+)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested */}
        {sizeFilter === "all" && suggested.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
              ✨ Recommended for you
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={suggested}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 0 }}
              renderItem={({ item: c }) => (
                <CommunityCard
                  community={c}
                  joined={joinedCommunities.includes(c.id)}
                  onJoin={() => joinCommunity(c.id)}
                  onPress={() => router.push(`/communities/${c.id}`)}
                  compact
                />
              )}
            />
          </View>
        )}

        {/* Browse by category */}
        {categories.map((cat) => (
          <View key={cat} style={{ gap: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textSecondary }}>{cat}</Text>
            {filtered.filter((c) => c.category === cat).map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                joined={joinedCommunities.includes(c.id)}
                onJoin={() => { joinCommunity(c.id); router.push(`/communities/${c.id}`); }}
                onPress={() => router.push(`/communities/${c.id}`)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
