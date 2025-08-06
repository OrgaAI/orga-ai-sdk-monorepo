

export async function fetchEphemeralTokenAndIceServers(): Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }> {
    try {
      const response = await fetch("https://f702e4e2c5f0.ngrok-free.app/api/realtime/test");
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