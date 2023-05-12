import { getAuth } from "@clerk/nextjs/server";
import { calendar } from "@googleapis/calendar";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { props: { userId: null } };
  const googleOAuthToken = ctx.req.cookies["googleOAuthAccessToken"];
  if (!googleOAuthToken) {
    return { redirect: { destination: "/calendar", permanent: false } };
  }

  try {
    console.log(googleOAuthToken);
 // await calendar({version: "v3", auth: googleOAuthToken}).calendarList.list()
  } catch (e) {
    console.log(e);
  }
  return { props: { calendars: "e" } };
};

export default function Index(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {}
