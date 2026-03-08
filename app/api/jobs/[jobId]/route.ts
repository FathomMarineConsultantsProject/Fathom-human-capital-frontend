import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params?.jobId;
    if (!jobId) {
      return NextResponse.json(
        { error: "Missing job id" },
        { status: 400 }
      );
    }

    await supabase.from("applications").delete().eq("job_id", jobId);
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
