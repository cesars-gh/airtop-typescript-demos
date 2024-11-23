import { z } from "zod";

export const terminateSessionRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().describe("The id of the session to terminate"),
});

export type TerminateSessionRequest = z.infer<typeof terminateSessionRequestSchema>;

export const terminateSessionResponseSchema = z.object({
  ok: z.boolean().describe("Whether the request was successful"),
});

export type TerminateSessionResponse = z.infer<typeof terminateSessionResponseSchema>;
