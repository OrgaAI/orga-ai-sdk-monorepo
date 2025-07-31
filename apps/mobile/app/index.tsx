import OrgaControls from "@/components/OrgaControls";
import { ThemedView } from "@/components/ui/ThemedComponents";
import { OrgaAICameraView, useOrgaAIContext} from "@orga-ai/sdk-react-native";
import { StyleSheet, Text } from "react-native";

export default function HomeScreen() {
  const { videoStream } = useOrgaAIContext();

  return (
    <ThemedView>
      <OrgaAICameraView
        streamURL={videoStream ? videoStream.toURL() : undefined}
        containerStyle={styles.cameraViewContainer}
        style={{ width: "100%", height: "100%" }}
        placeholder={
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
            }}
          >
            Orga AI SDK Playground
          </Text>
        }
      >
        <OrgaControls />
      </OrgaAICameraView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cameraViewContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",

  },
});
