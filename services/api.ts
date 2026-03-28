import { WearableReading, Persona, ChatMessage } from "../types";
import * as predictionsMock from "./predictions.mock";
import * as llmMock from "./llm.mock";
import { scoreToLevel } from "../utils/stressLevel";

const USE_MOCK = true;

export async function submitWearableData(reading: WearableReading) {
  if (USE_MOCK) return predictionsMock.predictStress(reading);
  throw new Error("Backend not implemented");
}

export async function getAffirmation(score: number, persona: Persona): Promise<string> {
  if (USE_MOCK) return llmMock.getAffirmation(scoreToLevel(score), persona);
  throw new Error("Backend not implemented");
}

export async function sendChatMessage(
  message: string,
  persona: Persona,
  history: ChatMessage[]
): Promise<string> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    return llmMock.getChatResponse(message, persona, history);
  }
  throw new Error("Backend not implemented");
}
