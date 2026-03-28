import React, { useState, useRef, useEffect } from "react";
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatBubble } from "../components/ChatBubble";
import { PersonaSelector } from "../components/PersonaSelector";
import { Colors } from "../constants/theme";
import { useChatStore } from "../stores/useChatStore";
import { useUserStore } from "../stores/useUserStore";
import { Persona } from "../types";

function TypingIndicator() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14 }}>🤖</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 4, backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.textSecondary, opacity: 0.6 }} />
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const { messages, isTyping, activePersona, setPersona, sendMessage } = useChatStore();
  const { persona: defaultPersona } = useUserStore();

  useEffect(() => {
    setPersona(defaultPersona);
  }, []);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  };

  const personaColors: Record<Persona, string> = {
    friend: Colors.friendAccent,
    counsellor: Colors.counsellorAccent,
    psychiatrist: Colors.psychiatristAccent,
  };
  const accentColor = personaColors[activePersona];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {/* Header */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.textPrimary }}>AI Companion</Text>
          <PersonaSelector active={activePersona} onChange={setPersona} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>👋</Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
                Hi, I'm here for you
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 21 }}>
                Share what's on your mind. Everything here is private and judgment-free.
              </Text>
            </View>
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Disclaimer */}
        <Text style={{ fontSize: 11, color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 16, paddingVertical: 4 }}>
          AI companion — not a substitute for professional help
        </Text>

        {/* Input */}
        <View style={{ flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: "flex-end" }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
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
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() && !isTyping ? accentColor : Colors.border,
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
