import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import { EXTRACT_DATA_OUTPUT_SCHEMA, EXTRACT_DATA_PROMPT, TARGET_URL } from "@/consts";
import { AirtopClient } from "@airtop/sdk";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

interface ContinueControllerParams {
  apiKey: string;
  sessionId: string;
  windowId: string;
  log: LogLayer;
}

export async function continueController({
  apiKey,
  log,
  sessionId,
  windowId,
}: ContinueControllerParams): Promise<ContinueResponse> {
  const client = new AirtopClient({
    apiKey,
  });

  // Navigate to the target URL
  log.info("Navigating to target url");
  await client.windows.loadUrl(sessionId, windowId, { url: TARGET_URL });

  log.info("Prompting the AI agent, waiting for a response (this may take a few minutes)...");

  const promptContentResponse = await client.windows.pageQuery(sessionId, windowId, {
    prompt: EXTRACT_DATA_PROMPT,
    followPaginationLinks: true, // This will tell the agent to load additional results via pagination links or scrolling
    configuration: {
      outputSchema: EXTRACT_DATA_OUTPUT_SCHEMA,
    },
  });

  const formattedJson = JSON.stringify(JSON.parse(promptContentResponse.data.modelResponse), null, 2);
  log.info("Response:\n\n", chalk.green(formattedJson));

  log.info("Closing window and terminating session");

  await client.windows.close(sessionId, windowId);
  await client.sessions.terminate(sessionId);

  log.info("Cleanup completed");

  return {
    content: formattedJson,
  };
}
