import { z } from "zod";

export const processBatchRequestSchema = z.object({
  apiKey: z.string().describe("The API key to use for the request"),
  sessionId: z.string().describe("The id of the session to use"),
  batch: z.string().describe("The YC batch to process. Ex: S24"),
  parallelism: z
    .number()
    .int()
    .optional()
    .default(1)
    .describe(
      "Max number of sessions to use when batch processing. For non-paid accounts, this is recommended to be set to 1.",
    ),
});

export type ProcessBatchRequest = z.infer<typeof processBatchRequestSchema>;

export const processBatchResponseSchema = z.object({
  sessionId: z.string().describe("The id of the session"),
  content: z.string().describe("The extracted company data"),
  signInRequired: z.boolean().optional().describe("Whether authentication is required"),
  liveViewUrl: z.string().optional().describe("URL for live view if auth required"),
});

export type ProcessBatchResponse = z.infer<typeof processBatchResponseSchema>;