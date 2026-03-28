import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, GradientColors } from "../../constants/theme";
import { ONBOARDING_QUESTIONS } from "../../constants/questions";
import { useUserStore } from "../../stores/useUserStore";
import { Button } from "../../components/ui/Button";

export default function QuestionsScreen() {
  const router = useRouter();
  const { setOnboardingAnswer } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = ONBOARDING_QUESTIONS[currentIndex];
  const total = ONBOARDING_QUESTIONS.length;
  const isLast = currentIndex === total - 1;

  const handleContinue = () => {
    setOnboardingAnswer(question.id, selected);
    if (isLast) {
      router.push("/onboarding/persona");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleSkip = () => {
    setOnboardingAnswer(question.id, null);
    if (isLast) {
      router.push("/onboarding/persona");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const progress = (currentIndex + 1) / total;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: Colors.surface, marginHorizontal: 24, marginTop: 12, borderRadius: 2 }}>
        <LinearGradient
          colors={GradientColors.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4, width: `${progress * 100}%`, borderRadius: 2 }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}>
        {/* Question header */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: "600" }}>
            Question {currentIndex + 1} of {total}
          </Text>
          <Text style={{ fontSize: 36 }}>{question.emoji}</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.textPrimary, lineHeight: 32 }}>
            {question.question}
          </Text>
        </View>

        {/* Options */}
        <View style={{ gap: 10 }}>
          {question.options.map((opt) => {
            const isActive = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.8}
                style={{
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: isActive ? Colors.primary : Colors.border,
                  backgroundColor: isActive ? Colors.primaryMuted : Colors.surface,
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? Colors.primary : Colors.textPrimary,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions */}
        <Button
          label={isLast ? "See my companion options →" : "Continue →"}
          onPress={handleContinue}
          size="lg"
          disabled={!selected}
        />

        <TouchableOpacity onPress={handleSkip} style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>Skip this question</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
