import { getAuth, withClerkMiddleware } from "@clerk/nextjs/server";
import { auth } from "@googleapis/oauth2";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "./env.mjs";

// Set the paths that don't require the user to be signed in

const publicPaths = ["/sign-in*", "/sign-up*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware(async (request: NextRequest) => {
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request);
  if (!userId) {
    // redirect the users to /pages/sign-in/[[...index]].ts
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }
  const requestedUrl = new URL(request.url);
  const code = requestedUrl.searchParams.get("code");
  const scope = requestedUrl.searchParams.get("scope");
  if (scope && code) {
    const response = NextResponse.redirect(
      requestedUrl.origin + "/calendar?import=true"
    );
    const oAuth2Client = new auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URL
    );
    const { tokens } = await oAuth2Client.getToken(code);
    const accessToken = tokens.access_token;
    if (accessToken) {
      response.cookies.set("googleOAuthAccessToken", accessToken);
    }
    return response;
  }
  return NextResponse.next();
});

// Stop Middleware running on static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     */

    "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
};
