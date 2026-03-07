import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jobId = formData.get("jobId") as string | null;

    if (!file || !jobId) {
      return NextResponse.json(
        { error: "Missing file or jobId" },
        { status: 400 }
      );
    }

    const filePath = `${jobId}/${Date.now()}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("Resumes")
      .upload(filePath, buffer, {
        contentType: file.type || "application/pdf",
        upsert: false
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from("Resumes")
      .getPublicUrl(data.path);

    return NextResponse.json({ resume_url: publicUrl.publicUrl });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
