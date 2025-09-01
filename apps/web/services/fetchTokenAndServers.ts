export async function fetchSessionConfig(): Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }> {
    try {
      const response = await fetch("/api");
      const data = await response.json();
      return {
        ephemeralToken: data.ephemeralToken,
        iceServers: data.iceServers,
      };
    } catch (error) {
      console.error("Error getting ephemeral token:", error);
      throw error;
    }
  }