import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChatBubble } from "../components/ChatBubble";
import { Colors, personaColor } from "../constants/theme";
import { useChatStore } from "../stores/useChatStore";
import { Persona } from "../types";

const PERSONA_EMOJI: Record<Persona, string> = {
  pragati: "🌸",
  kulman: "😎",
};

const PERSONA_LABEL: Record<Persona, string> = {
  pragati: "Pragati",
  kulman: "Kulman",
};

const PERSONA_TRAIT: Record<Persona, string> = {
  pragati: "Progressive · Helpful · Mentor",
  kulman: "Cool · Happy · Funny",
};

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
  const insets = useSafeAreaInsets();
  const { persona: personaParam } = useLocalSearchParams<{ persona?: string }>();

  useEffect(() => {
    const valid: Persona = personaParam === "kulman" ? "kulman" : "pragati";
    setPersona(valid);
  }, [personaParam]);

  useEffect(() => {
    const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages.length, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  };

  const accentColor = personaColor[activePersona];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 10 }}>
            Choose your AI companion
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {(Object.keys(PERSONA_LABEL) as Persona[]).map((p) => {
              const isActive = activePersona === p;
              const color = personaColor[p];
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPersona(p)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 24,
                    backgroundColor: isActive ? color : Colors.surface,
                    borderWidth: 1.5,
                    borderColor: isActive ? color : Colors.border,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{PERSONA_EMOJI[p]}</Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: isActive ? Colors.white : Colors.textSecondary }}>
                    {PERSONA_LABEL[p]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 12, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>{PERSONA_EMOJI[activePersona]}</Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
                Hi, I'm {PERSONA_LABEL[activePersona]}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: accentColor }}>
                {PERSONA_TRAIT[activePersona]}
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 21 }}>
                Share what's on your mind. Everything here is private and judgment-free.
              </Text>
            </View>
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Disclaimer */}
        <Text style={{ fontSize: 11, color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 16, paddingVertical: 6 }}>
          I'm an AI chatbot, not a licensed therapist. If you're struggling with serious anxiety or depression, please reach out to a mental health professional or crisis line (988 in US).
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
    </View>
  );
}
