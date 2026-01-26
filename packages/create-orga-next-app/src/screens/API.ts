export const apiContent = `import { NextResponse } from "next/server";
import { OrgaAI } from "@orga-ai/node";
const ORGAAI_API_KEY = process.env.ORGAAI_API_KEY;

const orgaAI = new OrgaAI({
  apiKey: ORGAAI_API_KEY as string
})

export const GET = async () => {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    return NextResponse.json(sessionConfig);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session config" }, { status: 500 });
  }
}`;