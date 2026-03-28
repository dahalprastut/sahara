import React, { useState, useRef, useEffect } from "react";
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../components/ui/Avatar";
import { Colors } from "../../constants/theme";
import { COMMUNITIES } from "../../constants/communities";
import { useCommunityStore } from "../../stores/useCommunityStore";
import { useUserStore } from "../../stores/useUserStore";
import { formatRelativeTime } from "../../utils/formatters";
import { CommunityMessage } from "../../types";

function MessageItem({ msg, isOwn }: { msg: CommunityMessage; isOwn: boolean }) {
  return (
    <View style={{ flexDirection: isOwn ? "row-reverse" : "row", gap: 8, marginVertical: 4, marginHorizontal: 16, alignItems: "flex-end" }}>
      {!isOwn && <Avatar name={msg.anonymousName} size={32} />}
      <View style={{ maxWidth: "75%" }}>
        {!isOwn && (
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 2, marginLeft: 4 }}>
            {msg.anonymousName}
          </Text>
        )}
        <View style={{
          backgroundColor: isOwn ? Colors.primary : Colors.surface,
          borderRadius: 18,
          borderBottomLeftRadius: isOwn ? 18 : 4,
          borderBottomRightRadius: isOwn ? 4 : 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: isOwn ? 0 : 1,
          borderColor: Colors.border,
        }}>
          <Text style={{ fontSize: 15, color: isOwn ? Colors.white : Colors.textPrimary, lineHeight: 21 }}>
            {msg.content}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: isOwn ? "right" : "left" }}>
          {formatRelativeTime(msg.timestamp)}
        </Text>
      </View>
    </View>
  );
}

export default function CommunityChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [guidelinesCollapsed, setGuidelinesCollapsed] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { getMessages, addMessage } = useCommunityStore();
  const { anonymousName, joinCommunity } = useUserStore();

  const community = COMMUNITIES.find((c) => c.id === id);
  const chatMessages = getMessages(id || "");

  useEffect(() => {
    if (id) joinCommunity(id);
    const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [chatMessages.length]);

  if (!community) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: Colors.textSecondary }}>Community not found</Text>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    const text = input.trim();
    if (!text || !id) return;
    setInput("");
    addMessage(id, anonymousName, text);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {/* Header */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22 }}>{community.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>{community.name}</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{community.memberCount} members · {community.activeNow} online</Text>
          </View>
        </View>

        {/* Pinned guidelines */}
        <TouchableOpacity
          onPress={() => setGuidelinesCollapsed((v) => !v)}
          style={{ margin: 12, backgroundColor: Colors.primaryMuted, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
          <Text style={{ flex: 1, fontSize: 13, color: Colors.primary, fontWeight: "600" as const }}>Community Guidelines</Text>
          <Ionicons name={guidelinesCollapsed ? "chevron-down" : "chevron-up"} size={16} color={Colors.primary} />
        </TouchableOpacity>
        {!guidelinesCollapsed && (
          <View style={{ marginHorizontal: 12, marginTop: -4, marginBottom: 8, backgroundColor: Colors.primaryMuted, borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 13, color: Colors.primary, lineHeight: 20 }}>
              • Be kind and supportive{"\n"}• Keep names anonymous{"\n"}• No medical advice — share experiences only{"\n"}• Report anything harmful
            </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageItem msg={item} isOwn={item.anonymousName === anonymousName} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />

        {/* Input */}
        <View style={{ flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: "flex-end" }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={`Message as ${anonymousName}...`}
            placeholderTextColor={Colors.textSecondary}
            multiline
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: Colors.textPrimary,
              maxHeight: 100,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() ? Colors.primary : Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-up" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
