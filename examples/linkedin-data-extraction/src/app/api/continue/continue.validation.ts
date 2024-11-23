import { z } from "zod";

export const continueRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().describe("The id of the session to continue"),
  windowId: z.string().describe("The id of the window to continue"),
});

export type ContinueRequest = z.infer<typeof continueRequestSchema>;

export const continueResponseSchema = z.object({
  content: z.string().describe("The response to the prompt"),
});

export type ContinueResponse = z.infer<typeof continueResponseSchema>;
