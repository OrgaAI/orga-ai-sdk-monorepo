import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { fetchEphemeralTokenAndIceServers } from "@/services/fetch";
import { Ionicons } from "@expo/vector-icons";
import { OrgaAIProvider, OrgaAI,useOrgaAI } from "@orga-ai/react-native";
import { TouchableOpacity } from "react-native";
import { TranscriptionProvider, useTranscription } from "@/context/TranscriptionContext";

OrgaAI.init({
  fetchSessionConfig: fetchEphemeralTokenAndIceServers,
  logLevel: "debug",
  enableTranscriptions: true,
  model: "orga-1-beta",
  instructions: "You are a helpful assistant that can answer questions and help with tasks.",
  modalities: ["audio"]
});

function HeaderRight() {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push("/(modal)/settings");
      }}
    >
      <Ionicons
        name="settings"
        size={24}
        color="white"
      />
    </TouchableOpacity>
  );
}

function HeaderLeft() {
  const { connectionState } = useOrgaAI();
  const { toggleTranscriptions } = useTranscription();
  const isConnected = connectionState === "connected";

  if (!isConnected) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={toggleTranscriptions}
    >
      <Ionicons
        name="chatbubbles"
        size={24}
        color="white"
      />
    </TouchableOpacity>
  );
}

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
        <TranscriptionProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen
                name="index"
              options={{
                headerShown: true,
                title: "",
                headerStyle: {
                  backgroundColor: "#1e293b", 
                },
                headerTintColor: "white",
                headerLeft: () => <HeaderLeft />,
                headerRight: () => <HeaderRight />,
              }}
              />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="(modal)/settings"
                options={{
                  headerShown: true,
                  title: "Settings",
                  presentation: "modal",
                  headerStyle: {
                    backgroundColor: "#1e293b", 
                  },
                  headerTintColor: "white",
                  headerTitleStyle: {
                    fontWeight: "bold",
                  },
                }}
                />
              </Stack>
            </GestureHandlerRootView>
          </TranscriptionProvider>
        </OrgaAIProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
