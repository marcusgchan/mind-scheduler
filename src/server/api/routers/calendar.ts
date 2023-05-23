import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { auth } from "@googleapis/oauth2";
import { calendar } from "@googleapis/calendar";
import { env } from "~/env.mjs";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.settings.readonly",
];

export const calendarRouter = createTRPCRouter({
  generateAuthUrl: protectedProcedure.mutation(() => {
    const oauth2Client = new auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URL
    );
    return oauth2Client.generateAuthUrl({
      scope: SCOPES,
    });
  }),
  importCalendars: protectedProcedure
    .input(
      z.object({
        calendars: z
          .object({
            id: z.string(),
            title: z.string().nullish(),
            backgroundColor: z.string().nullish(),
            timeZone: z.string().nullish(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const googleOAuthToken = ctx.req.cookies.googleOAuthToken;
      // TODO: handle this gracefully by redirecting user to sign in with
      // ggogle again
      if (!googleOAuthToken) {
        throw new Error("No googleOAuthToken in cookies");
      }
      const oAuth2Client = new auth.OAuth2(
        env.GOOGLE_OAUTH_CLIENT_ID,
        env.GOOGLE_OAUTH_CLIENT_SECRET,
        env.GOOGLE_OAUTH_REDIRECT_URL
      );
      oAuth2Client.setCredentials({ access_token: googleOAuthToken });

      /*
      const res = await calendar({
        version: "v3",
        auth: oAuth2Client,
      }).events.list({ calendarId: "primary" });*/

      // Save calendar to db

      // Save events to db
    }),
});
