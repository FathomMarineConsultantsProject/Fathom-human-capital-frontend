import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = cookies();
  const expectedState = cookieStore.get("linkedin_oauth_state")?.value;
  const redirect = cookieStore.get("linkedin_oauth_redirect")?.value || "/";

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}${redirect}`);
  }

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!
    })
  });

  const tokenData = await tokenRes.json();

  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}${redirect.startsWith("/") ? redirect : "/"}`
  );

  response.cookies.set("linkedin_access_token", tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Number(tokenData.expires_in) || 60 * 60
  });

  response.cookies.delete("linkedin_oauth_state");
  response.cookies.delete("linkedin_oauth_redirect");

  return response;
}

