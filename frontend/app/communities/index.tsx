import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CommunityCard } from "../../components/CommunityCard";
import { Colors } from "../../constants/theme";
import { COMMUNITIES, COMMUNITY_SUGGESTIONS } from "../../constants/communities";
import { useUserStore } from "../../stores/useUserStore";
import { CommunitySize } from "../../types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SLIDER_CARD_WIDTH = SCREEN_WIDTH * 0.78;
const SLIDER_GAP = 12;
const SLIDER_CARD_HEIGHT = 172;

function CommunitySlider({
  data,
  joinedCommunities,
  onJoin,
  onPress,
}: {
  data: typeof COMMUNITIES;
  joinedCommunities: string[];
  onJoin: (id: string) => void;
  onPress: (id: string) => void;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(c) => c.id}
      snapToInterval={SLIDER_CARD_WIDTH + SLIDER_GAP}
      decelerationRate="fast"
      contentContainerStyle={{ gap: SLIDER_GAP, paddingHorizontal: 20 }}
      renderItem={({ item: c }) => (
        <CommunityCard
          community={c}
          joined={joinedCommunities.includes(c.id)}
          onJoin={() => onJoin(c.id)}
          onPress={() => onPress(c.id)}
          style={{ width: SLIDER_CARD_WIDTH, height: SLIDER_CARD_HEIGHT }}
        />
      )}
    />
  );
}

export default function CommunitiesScreen() {
  const router = useRouter();
  const { joinedCommunities, joinCommunity, persona } = useUserStore();
  const [sizeFilter, setSizeFilter] = useState<CommunitySize | "all">("all");

  const suggested = (COMMUNITY_SUGGESTIONS[persona] || [])
    .map((id) => COMMUNITIES.find((c) => c.id === id))
    .filter((c): c is typeof COMMUNITIES[0] => c !== undefined);

  const joinedList = COMMUNITIES.filter((c) => joinedCommunities.includes(c.id));

  const filtered = COMMUNITIES.filter((c) =>
    sizeFilter === "all" ? true : c.sizeType === sizeFilter
  );

  const categories = [...new Set(filtered.map((c) => c.category))];

  const handleJoinAndNavigate = (id: string) => {
    joinCommunity(id);
    router.push(`/communities/${id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.textPrimary }}>
            Find your community
          </Text>
        </View>

        {/* Size filter */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", backgroundColor: Colors.surface, borderRadius: 12, padding: 4 }}>
            {(["all", "small", "large"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setSizeFilter(f)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: sizeFilter === f ? Colors.primary : "transparent",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600" as const, color: sizeFilter === f ? Colors.white : Colors.textSecondary }}>
                  {f === "all" ? "All" : f === "small" ? "Small (5–10)" : "Large (50+)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended for you — slider */}
        {sizeFilter === "all" && suggested.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary, paddingHorizontal: 20, marginBottom: 12 }}>
              ✨ Recommended for you
            </Text>
            <CommunitySlider
              data={suggested}
              joinedCommunities={joinedCommunities}
              onJoin={handleJoinAndNavigate}
              onPress={(id) => router.push(`/communities/${id}`)}
            />
          </View>
        )}

        {/* Your communities — slider */}
        {joinedList.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary, paddingHorizontal: 20, marginBottom: 12 }}>
              🏠 Your communities
            </Text>
            <CommunitySlider
              data={joinedList}
              joinedCommunities={joinedCommunities}
              onJoin={handleJoinAndNavigate}
              onPress={(id) => router.push(`/communities/${id}`)}
            />
          </View>
        )}

        {/* Browse by category */}
        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          {categories.map((cat) => (
            <View key={cat}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                {cat}
              </Text>
              <View style={{ gap: 12 }}>
                {filtered.filter((c) => c.category === cat).map((c) => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    joined={joinedCommunities.includes(c.id)}
                    onJoin={() => handleJoinAndNavigate(c.id)}
                    onPress={() => router.push(`/communities/${c.id}`)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
