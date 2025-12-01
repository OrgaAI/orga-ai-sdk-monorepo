import { NextResponse } from "next/server";
import { OrgaAI } from "@orga-ai/node";
const REALTIME_USER_TOKEN = process.env.REALTIME_USER_TOKEN;
const REALTIME_USER_EMAIL = process.env.REALTIME_USER_EMAIL;

const orgaAI = new OrgaAI({
  apiKey: REALTIME_USER_TOKEN as string,
  userEmail: REALTIME_USER_EMAIL as string,
})

// TESTING WITH CORS FOR WIDGET EXAMPLE
export const GET = async () => {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    console.log("Session config fetched", sessionConfig);
    return NextResponse.json(sessionConfig, {
      headers: {
        "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch session config" },
      { status: 500,
        headers: {
          "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
};

// export const GET = async () => {
//   try {
//     const sessionConfig = await orgaAI.getSessionConfig();
//     return NextResponse.json(sessionConfig);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch session config" }, { status: 500 });
//   }
// }