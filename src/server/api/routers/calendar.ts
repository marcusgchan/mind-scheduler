import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {auth} from "@googleapis/oauth2"

export const calendarRouter = createTRPCRouter({
  authenticateGoogleOAuth: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      new auth.OAuth2();
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
