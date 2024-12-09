import type { ProcessInteractionsResponse } from "@/app/api/process-interactions/process-interactions.validation";
import { XInteractionService } from "@/lib/x-interaction.service";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the process interactions controller
 * @interface ProcessInteractionsControllerParams
 * @property {string} apiKey - API key for Airtop authentication
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface ProcessInteractionsControllerParams {
  apiKey: string;
  sessionId: string;
  windowId: string;
  ticker?: string;
  log: LogLayer;
}

/**
 * Controls the execution of interactions with the browser
 * @param {ProcessInteractionsControllerParams} params - Configuration parameters
 * @returns {Promise<ProcessInteractionsResponse>} Response containing session info or extracted content
 */
export async function processInteractionsController({
  apiKey,
  sessionId,
  windowId,
  ticker,
  log,
}: ProcessInteractionsControllerParams): Promise<ProcessInteractionsResponse> {
  // Initialize the interactions service
  const service = new XInteractionService({ apiKey, log, ticker });

  log.info("Searching for stock performance");

  await service.terminateSession(sessionId);

  // Return the extracted content
  return {
    content: "Testing",
  };
}
