import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/useColorScheme";
import { fetchEphemeralTokenAndIceServers } from "@/services/fetch";
import { Ionicons } from "@expo/vector-icons";
import { OrgaAIProvider, OrgaAI } from "@orga-ai/sdk-react-native";
import { TouchableOpacity } from "react-native";

OrgaAI.init({
  fetchEphemeralTokenAndIceServers,
  logLevel: "debug",
  return_transcription: true,
  model: "orga-1-beta",
  voice: "echo",
  temperature: 0.5,
  maxTokens: 50,
  instructions: "Refer to me as 'Austin'"
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <OrgaAIProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="index"
            options={{
              headerShown: true,
              title: "",
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => {
                    router.push("/(modal)/settings");
                  }}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="(modal)/settings"
            options={{
              headerShown: false,
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.75],
              sheetCornerRadius: 10,
            }}
            />
          </Stack>
        </GestureHandlerRootView>
      </OrgaAIProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
