

export async function fetchEphemeralTokenAndIceServers(): Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }> {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is not set");
    }
    try {
      const response = await fetch(`${apiUrl}`);
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