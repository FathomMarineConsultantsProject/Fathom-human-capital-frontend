import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { jobId } = await req.json();
  const token = cookies().get("linkedin_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      author: `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text:
              `We're hiring a ${job.title} at Fathom Marine Consultants.\n\n` +
              `Department: ${job.department}\n` +
              `Seniority: ${job.seniority}\n\n` +
              `Apply now.`
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    })
  });

  const postData = await postRes.json();

  if (!postData.id) {
    return NextResponse.json({ error: postData }, { status: 400 });
  }

  await supabase
    .from("jobs")
    .update({
      linkedin_post_urn: postData.id,
      linkedin_posted: true,
      linkedin_posted_at: new Date()
    })
    .eq("id", jobId);

  return NextResponse.json({ success: true });
}

