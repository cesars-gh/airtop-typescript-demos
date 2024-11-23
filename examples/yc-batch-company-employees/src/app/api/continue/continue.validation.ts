import { z } from "zod";

export const continueRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().describe("The id of the session to continue"),
});

export type ContinueRequest = z.infer<typeof continueRequestSchema>;

export const continueResponseSchema = z.object({
  batches: z.array(z.string()).describe("The batches available for extraction"),
  sessionId: z.string().describe("The id of the session"),
});

export type ContinueResponse = z.infer<typeof continueResponseSchema>;
