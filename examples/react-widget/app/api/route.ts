import { NextResponse } from "next/server";
import { OrgaAI } from "@orga-ai/node";

const orga = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY!,
  userEmail: process.env.ORGA_USER_EMAIL!,
});

export async function GET() {
  try {
    const sessionConfig = await orga.getSessionConfig();
    console.log("session", sessionConfig)
    return NextResponse.json(sessionConfig);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
