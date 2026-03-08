import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import PDFParser from "pdf2json";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabase
    .from("applications")
    .select("id, name, status, skills, years_experience, job:jobs(title)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: unknown) => {
      reject((errData as { parserError?: Error }).parserError ?? errData);
    });

    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      resolve(text ?? "");
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function parseResumeText(applicationId: string, resumeUrl: string) {
  try {
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extractedText = (await extractPdfText(buffer)).trim();

    if (!extractedText) {
      throw new Error("Parsed resume text is empty");
    }

    await supabase
      .from("applications")
      .update({ resume_text: extractedText })
      .eq("id", applicationId);
  } catch (err) {
    console.error("Resume PDF parse error:", err);
  }
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
      resume_url,
      source,
      gender
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
        source: source ?? null,
        gender: gender ?? null,
        status: "applied",
        applied_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const applicationId = data?.id;
    if (applicationId && resume_url) {
      await parseResumeText(applicationId, resume_url);
    }

    return NextResponse.json({ application: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

