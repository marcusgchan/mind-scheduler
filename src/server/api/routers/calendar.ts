import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { auth } from "@googleapis/oauth2";
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
});
