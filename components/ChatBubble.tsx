import React from "react";
import { View, Text } from "react-native";
import { ChatMessage } from "../types";
import { Colors } from "../constants/theme";
import { Avatar } from "./ui/Avatar";
import { formatRelativeTime } from "../utils/formatters";

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <View
      style={{
        flexDirection: isUser ? "row-reverse" : "row",
        marginVertical: 4,
        marginHorizontal: 16,
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      {!isUser && <Avatar name="AI" size={30} />}
      <View style={{ maxWidth: "75%" }}>
        <View
          style={{
            backgroundColor: isUser ? Colors.primary : Colors.surface,
            borderRadius: 18,
            borderBottomLeftRadius: isUser ? 18 : 4,
            borderBottomRightRadius: isUser ? 4 : 18,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: isUser ? 0 : 1,
            borderColor: Colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: isUser ? Colors.white : Colors.textPrimary,
              lineHeight: 21,
            }}
          >
            {message.content}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 11,
            color: Colors.textSecondary,
            marginTop: 2,
            textAlign: isUser ? "right" : "left",
          }}
        >
          {formatRelativeTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};
