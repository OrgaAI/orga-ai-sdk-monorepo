export async function fetchEphemeralTokenAndIceServers(): Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }> {
    console.log("fetching ephemeral token and ice servers")
    try {
      const response = await fetch("/api");
      const data = await response.json();
      console.log("data", data)
      return {
        ephemeralToken: data.ephemeralToken,
        iceServers: data.iceServers,
      };
    } catch (error) {
      console.error("Error getting ephemeral token:", error);
      throw error;
    }
  }