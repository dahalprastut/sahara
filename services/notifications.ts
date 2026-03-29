import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const FIRST_MINIMIZE_KEY = "sahara:firstMinimizeNotificationSent";
const ANDROID_CHANNEL_ID = "sahara-default";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Sahara",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function sendFirstMinimizeNotification(): Promise<void> {
  const alreadySent = await AsyncStorage.getItem(FIRST_MINIMIZE_KEY);
  if (alreadySent) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Sahara",
      body: "Everybody hurts sometimes 💙",
      ...(Platform.OS === "android" && { categoryIdentifier: ANDROID_CHANNEL_ID }),
    },
    trigger: Platform.OS === "android"
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1, repeats: false }
      : null,
  });

  await AsyncStorage.setItem(FIRST_MINIMIZE_KEY, "true");
}
