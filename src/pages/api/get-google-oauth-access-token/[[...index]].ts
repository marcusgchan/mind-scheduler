import { auth } from "@googleapis/calendar";
import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { serialize, CookieSerializeOptions } from "cookie";

const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions
) => {
  const stringValue =
    typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);

  if (typeof options.maxAge === "number") {
    options.expires = new Date(Date.now() + options.maxAge * 1000);
  }

  res.setHeader("Set-Cookie", serialize(name, stringValue, options));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  if (!req.url) return res.status(400).redirect("/calendar");
  
  const protocol = req.headers["x-forwarded-proto"] as string | undefined
  if (!protocol && protocol === "http" || protocol === "https") {
    return res.status(500).redirect("/calendar");
  }

  const requestedUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
  const code = requestedUrl.searchParams.get("code");
  const scope = requestedUrl.searchParams.get("scope");
  if (scope && code) {
    const oAuth2Client = new auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URL
    );
    console.log(env.GOOGLE_OAUTH_REDIRECT_URL)
    try {
    const { tokens } = await oAuth2Client.getToken(code);
    const accessToken = tokens.access_token as string;
    setCookie(res, "googleOAuthAcessToken", accessToken, {
      sameSite: "strict",
    });
    } catch(e) {
      console.log(e)
    }

    res.redirect("/calendar?import=true");
  }
}
