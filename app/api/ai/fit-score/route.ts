import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

console.log("OPENROUTER KEY:", process.env.OPENROUTER_API_KEY);

type JoinedJob = {
  title: string;
  required_skills: string[];
  salary_budget: number;
  seniority: string;
};

export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }

    // Fetch application with related job
    const { data: application, error } = await supabase
      .from("applications")
      .select(`
        id,
        name,
        skills,
        years_experience,
        expected_salary,
        education,
        resume_text,
        job:jobs (
          title,
          required_skills,
          salary_budget,
          seniority
        )
      `)
      .eq("id", applicationId)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const rawJob = application.job as JoinedJob | JoinedJob[] | null;
    let job: JoinedJob | null = null;

    if (Array.isArray(rawJob)) {
      job = (rawJob[0] as JoinedJob) ?? null;
    } else {
      job = (rawJob as JoinedJob) ?? null;
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found for application" },
        { status: 404 }
      );
    }

    // -------------------------
    // IMPROVED MATCH SCORING
    // -------------------------

    const requiredSkills: string[] = Array.isArray(job.required_skills)
      ? job.required_skills
      : [];
    const candidateSkills: string[] = Array.isArray(application.skills)
      ? application.skills
      : [];

    // Skill match weight: 60%
    const matchedSkills = requiredSkills.filter((skill) =>
      candidateSkills.includes(skill)
    );

    const skillMatchPercent =
      requiredSkills.length > 0
        ? (matchedSkills.length / requiredSkills.length) * 60
        : 0;

    // Experience weight: 25%
    const yearsExperience = Number(application.years_experience ?? 0);
    let experienceScore = 0;
    if (yearsExperience >= 5) {
      experienceScore = 25;
    } else if (yearsExperience >= 3) {
      experienceScore = 18;
    } else if (yearsExperience >= 1) {
      experienceScore = 10;
    }

    // Salary fit weight: 15%
    const salaryBudget = Number(job.salary_budget ?? 0);
    const expectedSalary = Number(application.expected_salary ?? 0);
    let salaryScore = 0;
    if (salaryBudget > 0 && expectedSalary > 0) {
      if (expectedSalary <= salaryBudget) {
        salaryScore = 15;
      } else if (expectedSalary <= salaryBudget * 1.1) {
        salaryScore = 8;
      }
    }

    // Final score
    const matchScore = Math.round(
      skillMatchPercent + experienceScore + salaryScore
    );

    // -------------------------
    // AI SUMMARY (Robust Parsing)
    // -------------------------

    let aiText = "";

    try {
      const aiResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Fathom Human Capital"
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a professional recruitment analyst."
              },
              {
                role: "user",
                content: `
Analyze this candidate-job match.

Job:
Title: ${job.title}
Required Skills: ${requiredSkills.join(", ")}
Salary Budget: ${job.salary_budget}

Candidate:
Name: ${application.name}
Skills: ${candidateSkills.join(", ")}
Experience: ${application.years_experience} years
Expected Salary: ${application.expected_salary}
Education: ${application.education}

Full Resume Text:
${application.resume_text}

Write:
- A short strengths paragraph
- A short weaknesses paragraph
- A hiring recommendation
`
              }
            ],
            temperature: 0.7,
            max_tokens: 400
          })
        }
      );

      const raw = await aiResponse.json();

      console.log("OPENROUTER RAW RESPONSE:", raw);

      if (
        raw &&
        raw.choices &&
        raw.choices.length > 0 &&
        raw.choices[0].message &&
        raw.choices[0].message.content
      ) {
        aiText = raw.choices[0].message.content.trim();
      } else {
        aiText = "AI response received but content format was unexpected.";
      }
    } catch (err) {
      console.error("AI CALL ERROR:", err);
      aiText = "AI analysis temporarily unavailable.";
    }

    // Basic extraction (safe fallback)
    const strengths = matchedSkills;
    const skillGaps = requiredSkills.filter(
      (skill) => !candidateSkills.includes(skill)
    );

    return NextResponse.json({
      matchScore,
      strengths,
      skillGaps,
      summary: aiText
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

