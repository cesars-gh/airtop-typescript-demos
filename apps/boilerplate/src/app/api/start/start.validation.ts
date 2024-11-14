import { z } from "zod";

export const startRequestSchema = z.object({
  apiKey: z.string().describe("The API key to use for the request"),
  profileId: z.string().optional().describe("(optional) The profile ID to use for the session"),
});

export type StartRequest = z.infer<typeof startRequestSchema>;

export const startResponseSchema = z.object({
  sessionId: z.string().optional().describe("The id of the created session"),
  windowId: z.string().optional().describe("The id of the created browser window"),
  profileId: z.string().optional().describe("The generated profile id to continue the session"),
  liveViewUrl: z.string().optional().describe("The URL to connect to the browser live view"),
  signInRequired: z.boolean().optional().describe("Whether the user needs to sign in"),
  content: z.string().optional().describe("The response to the prompt only if signInRequired is false"),
});

export type StartResponse = z.infer<typeof startResponseSchema>;
