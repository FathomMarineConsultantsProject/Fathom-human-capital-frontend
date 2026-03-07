import { NextResponse } from "next/server";

function randomState() {
  return crypto.randomUUID();
}

export async function GET(req: Request) {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/callback`;

  const scope = "openid profile email w_organization_social";

  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get("redirect") || "/";

  const state = randomState();

  const url =
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`;

  const response = NextResponse.redirect(url);
  response.cookies.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });
  response.cookies.set("linkedin_oauth_redirect", redirect, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });

  return response;
}

