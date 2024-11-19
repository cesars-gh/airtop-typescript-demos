import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import { YCExtractorService } from "@/lib/yc-extractor.service";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the continue controller
 * @interface ContinueControllerParams
 * @property {string} apiKey - API key for authentication
 * @property {string} sessionId - Unique identifier for the current session
 * @property {string} windowId - Identifier for the browser window
 * @property {LogLayer} log - Logging utility instance
 */
interface ContinueControllerParams {
  apiKey: string;
  sessionId: string;
  log: LogLayer;
}

/**
 * Controller to handle continuation of LinkedIn Login - fetching batches
 * @param {ContinueControllerParams} params - The parameters needed for extraction
 * @returns {Promise<ContinueResponse>} The extracted LinkedIn content
 */
export async function continueController({
  apiKey,
  log,
  sessionId,
}: ContinueControllerParams): Promise<ContinueResponse> {
  // Initialize the YCombinator extractor service with API key and logging
  const service = new YCExtractorService({ apiKey, log });

  try {
    // Fetch YC batches
    const batches = await service.getYcBatches(sessionId);

    log.info("LALALA Fetched YC batches", JSON.stringify(batches, null, 2));

    return {
      sessionId,
      batches: batches,
    };
  } catch (error) {
    await service.terminateSession(sessionId);
    throw error;
  }
}
