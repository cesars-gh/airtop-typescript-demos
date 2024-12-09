import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const INITIAL_URL = "https://x.com";
export const SEARCH_URL = "https://x.com/explore";

export const RESULT_LIMIT = 10;

export const TASK_TITLE =
  "Please provide the information required for this task. You can press Tab to edit the default values if needed.";

// Login prompt & schema
export const IS_LOGGED_IN_PROMPT =
  "This view displays either X home page or the login form. Follow the JSON schema below.";

export const IS_LOGGED_IN_OUTPUT_SCHEMA = zodToJsonSchema(
  z.object({
    isLoggedIn: z.boolean().describe("Indicate whether the user is logged in or not."),
    error: z.string().describe("If you cannot fulfill the request, use this field to report the problem."),
  }),
);

// Posts extraction prompt & schema
export const EXTRACT_POSTS_PROMPT = `
  This is the X feed. Please extract up to {REASULT_LIMIT} posts that match the criteria,
  extract the URL to the post, the post content and indicate if it makes sense to reply to the post
  based on the criteria below.

  Criteria: {MATCH_PROMPT}
`;

const postSchema = z
  .object({
    link: z.string().describe("The URL to the post"),
    text: z.string().describe("The post content"),
    isCandidate: z.boolean().describe("Whether replying to the post is a good idea or not."),
  })
  .describe("Post information");

export const EXTRACTED_POST_OUTPUT = z.object({
  postList: z.array(postSchema),
});

export type TPost = z.infer<typeof postSchema>;
export type TExtractedPostResult = z.infer<typeof EXTRACTED_POST_OUTPUT>;
export const EXTRACTED_POST_OUTPUT_SCHEMA = zodToJsonSchema(EXTRACTED_POST_OUTPUT);

// Generate reply prompt & schema
export const GENERATE_REPLY_PROMPT = `
  This is a post in X. Please reply to the post using less than 30 words and follow the criteria below.

  Criteria: {CRITERIA_PROMPT}
`;

export const GENERATED_REPLY_OUTPUT = z.object({
  reply: z.string().describe("The reply to the post"),
});

export const GENERATED_REPLY_OUTPUT_SCHEMA = zodToJsonSchema(GENERATED_REPLY_OUTPUT);

export type TGeneratedReplyResult = z.infer<typeof GENERATED_REPLY_OUTPUT>;

export const PROCESS_DELAY = 3000;

export const SCREEN_RESOLUTION = {
  width: 1920,
  height: 1080,
};

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
