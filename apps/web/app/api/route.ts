import { NextResponse } from "next/server";
const REALTIME_USER_TOKEN = process.env.REALTIME_USER_TOKEN;

const fetchIceServers = async (ephemeralToken: string) => {
    const URL = `https://api.orga-ai.com/v1/realtime/ice-config`;
    try {
      const iceServersResponse = await fetch(URL, {
        method: "GET",
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${ephemeralToken}`,
        },
      });
      if (!iceServersResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch ICE servers" }, { status: 500 });
      }
      const data = await iceServersResponse.json();
      return data.iceServers;
    } catch (error) {
      console.error("Error fetching ice servers:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };

export const GET = async () => {
    const apiUrl = `https://api.orga-ai.com/v1/realtime/client-secrets?email=${encodeURIComponent("austin@orga-ai.com")}`;
    const ephemeralResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REALTIME_USER_TOKEN}`,
        },
      });
      const data = await ephemeralResponse.json();
      const iceServers = await fetchIceServers(data.ephemeral_token);
      const returnData = {
        iceServers,
        ephemeralToken: data.ephemeral_token
      }
    return NextResponse.json(returnData);
}