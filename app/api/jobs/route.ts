import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title: payload.title,
        department: payload.department,
        required_skills: payload.required_skills,
        salary_budget: payload.salary_budget,
        seniority: payload.seniority,
        status: payload.status ?? "active",
        linkedin_posted: false
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ job: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

