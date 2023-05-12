import { getAuth } from "@clerk/nextjs/server";
import { auth, calendar, calendar_v3 } from "@googleapis/calendar";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { env } from "~/env.mjs";

type Output = {
  calendars: calendar_v3.Schema$CalendarList["items"] | undefined | null;
};

export const getServerSideProps: GetServerSideProps<Output> = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { props: { calendars: null } };
  const googleOAuthToken = ctx.req.cookies["googleOAuthAccessToken"];
  if (!googleOAuthToken) {
    return { redirect: { destination: "/calendar", permanent: false } };
  }

  try {
    const oAuth2Client = new auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URL
    );
    oAuth2Client.setCredentials({ access_token: googleOAuthToken });

    const res = await calendar({
      version: "v3",
      auth: oAuth2Client,
    }).calendarList.list();
    const calendars = res.data.items;

    return { props: { calendars } };
  } catch (e) {
    console.error(e);
  }

  return { redirect: { destination: "/calendar", permanent: false } };
};

export default function Index(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(
    new Set()
  );
  console.log(props.calendars);
  return <div>hello</div>;
}
