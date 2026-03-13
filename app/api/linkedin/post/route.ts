import { NextResponse } from "next/server";

function getLinkedInAuthorUrn() {
  const personId = process.env.LINKEDIN_PERSON_ID;
  const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (personId) {
    return `urn:li:person:${personId}`;
  }

  if (organizationId) {
    return `urn:li:organization:${organizationId}`;
  }

  throw new Error("LINKEDIN_PERSON_ID or LINKEDIN_ORGANIZATION_ID must be configured");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const postText = String(formData.get("postText") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const mediaFiles = formData
      .getAll("mediaFiles")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!postText) {
      return NextResponse.json({ error: "postText is required" }, { status: 400 });
    }

    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "LINKEDIN_ACCESS_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const shareText = title ? `${title}\n\n${postText}` : postText;

    const linkedinResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify({
        author: getLinkedInAuthorUrn(),
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: shareText
            },
            // LinkedIn asset registration is a separate flow. Files are accepted by the UI
            // and preserved in the request, while post publishing currently falls back to text.
            shareMediaCategory: "NONE"
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      })
    });

    const rawBody = await linkedinResponse.text();
    let parsedBody: unknown = rawBody;

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }
    }

    if (!linkedinResponse.ok) {
      return NextResponse.json(
        {
          error: "LinkedIn API request failed",
          details: parsedBody
        },
        { status: linkedinResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      linkedinPost: parsedBody,
      uploadedFiles: mediaFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post to LinkedIn";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
