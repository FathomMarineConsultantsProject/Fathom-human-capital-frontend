import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("applications")
    .select("id, name, status, skills, extracted_skills, years_experience, job:jobs(title)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

type ExtractedResume = {
  skills?: string[];
  years_experience?: number;
  education?: string;
  summary?: string;
};

async function parseResumeAndEnrich(
  applicationId: string,
  resumeUrl: string,
  formYearsExperience: number | null,
  formEducation: string | null
) {
  let resumeText = "";

  try {
    const res = await fetch(resumeUrl);
    if (!res.ok) throw new Error("Failed to fetch resume");
    const buffer = await res.arrayBuffer();
    const buf = Buffer.from(buffer);
    const pdfModule = await import("pdf-parse");
    const pdf = pdfModule.default;
    if (typeof pdf === "function") {
      const parsed = await pdf(buf);
      resumeText = (parsed?.text ?? "").trim();
    } else if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buf });
      const result = await parser.getText();
      resumeText = (result?.text ?? "").trim();
    }
  } catch (err) {
    console.error("Resume PDF parse error:", err);
    return;
  }

  if (!resumeText) return;

  let aiData: ExtractedResume = {};

  try {
    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://fathom-human-capital-frontend.vercel.app",
          "X-Title": "Fathom Human Capital"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content: `Extract structured candidate information from this resume.

Return JSON with the following fields:
skills (array of strings)
years_experience (number)
education (string)
summary (short paragraph)

Resume text:
${resumeText.slice(0, 12000)}

The AI must return ONLY valid JSON.`
            }
          ],
          temperature: 0.3,
          max_tokens: 600
        })
      }
    );

    const raw = await aiResponse.json();
    const content =
      raw?.choices?.[0]?.message?.content?.trim?.() ?? "";
    const jsonStr = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    aiData = JSON.parse(jsonStr) as ExtractedResume;
  } catch (err) {
    console.error("OpenRouter resume extraction error:", err);
  }

  const updatePayload: Record<string, unknown> = {
    resume_text: resumeText,
    extracted_skills: Array.isArray(aiData.skills) ? aiData.skills : null,
    resume_summary: aiData.summary ?? null
  };
  if (formYearsExperience == null && aiData.years_experience != null) {
    updatePayload.years_experience = aiData.years_experience;
  }
  if ((formEducation == null || formEducation === "") && aiData.education) {
    updatePayload.education = aiData.education;
  }

  await supabase
    .from("applications")
    .update(updatePayload)
    .eq("id", applicationId);
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

    const applicationId = data?.id;
    if (applicationId && resume_url) {
      await parseResumeAndEnrich(
        applicationId,
        resume_url,
        years_experience ?? null,
        education ?? null
      );
    }

    return NextResponse.json({ application: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

