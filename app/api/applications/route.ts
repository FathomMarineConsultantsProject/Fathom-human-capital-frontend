import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("applications")
    .select("id, name, status, job:jobs(title)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      job_id,
      name,
      email,
      phone,
      skills,
      years_experience,
      expected_salary,
      education,
      resume_url
    } = body;

    if (!job_id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: job_id, name" },
        { status: 400 }
      );
    }

    const skillsArray =
      skills != null && typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(skills)
          ? skills
          : null;

    const { data, error } = await supabase
      .from("applications")
      .insert({
        job_id,
        name,
        email: email ?? null,
        phone: phone ?? null,
        skills: skillsArray,
        years_experience: years_experience ?? null,
        expected_salary: expected_salary ?? null,
        education: education ?? null,
        resume_url: resume_url ?? null,
        status: "applied",
        applied_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ application: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

