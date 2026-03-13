import { NextResponse } from "next/server";
import { generateLinkedInPost } from "@/lib/ai/linkedinPostGenerator";

export async function POST(req: Request) {
  try {
    const { role, location, company } = await req.json();

    if (!role || !location || !company) {
      return NextResponse.json(
        { error: "role, location, and company are required" },
        { status: 400 }
      );
    }

    const postText = await generateLinkedInPost({ role, location, company });

    return NextResponse.json({ postText });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate LinkedIn post";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
