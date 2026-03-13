type GenerateLinkedInPostParams = {
  role: string;
  location: string;
  company: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function generateLinkedInPost({
  role,
  location,
  company
}: GenerateLinkedInPostParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const prompt = `Write a LinkedIn hiring post for this exact opening.

Role: ${role}
Location: ${location}
Company: ${company}

Requirements:
- Make the post clearly about the role "${role}", not a generic hiring template.
- Mention the location naturally and keep the company name accurate.
- Focus on likely responsibilities, profile fit, and outcomes for this specific role.
- If a detail is not provided, do not invent precise benefits, salary, tools, certifications, or years of experience.
- Use concrete recruiting language instead of hype, filler, or vague buzzwords.
- Do not use markdown, emojis, hashtags, or decorative symbols.
- Keep it concise and polished for LinkedIn.

Structure:
1. Opening hook tied to the role
2. Short job summary
3. 3 to 5 role-relevant requirements or strengths
4. Clear call to action

Output only the final LinkedIn post text.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      "X-Title": "Fathhom Human Capital"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a senior talent acquisition specialist. You write credible LinkedIn job posts that are specific to the role, commercially realistic, concise, and free of generic filler."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return content;
}
