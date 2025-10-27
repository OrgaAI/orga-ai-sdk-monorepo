import { NextResponse } from "next/server";
import { OrgaAI } from "@orga-ai/node";
const REALTIME_USER_TOKEN = process.env.REALTIME_USER_TOKEN;
const REALTIME_USER_EMAIL = process.env.REALTIME_USER_EMAIL;

const orgaAI = new OrgaAI({
  apiKey: REALTIME_USER_TOKEN as string,
  userEmail: REALTIME_USER_EMAIL as string,
})

export const GET = async () => {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    return NextResponse.json(sessionConfig);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session config" }, { status: 500 });
  }
}