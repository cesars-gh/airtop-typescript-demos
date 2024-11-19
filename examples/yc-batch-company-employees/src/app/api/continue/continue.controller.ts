import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
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
  windowId: string;
  log: LogLayer;
}

/**
 * Controller to handle continuation of LinkedIn data extraction
 * @param {ContinueControllerParams} params - The parameters needed for extraction
 * @returns {Promise<ContinueResponse>} The extracted LinkedIn content
 */
export async function continueController({
  apiKey,
  log,
  sessionId,
  windowId,
}: ContinueControllerParams): Promise<ContinueResponse> {
  // Initialize the LinkedIn extractor service with API key and logging
  const service = new LinkedInExtractorService({ apiKey, log });

  // Extract LinkedIn data using the provided session
  const content = await service.getEmployeesListUrls(
    [
      "https://www.linkedin.com/company/asha-health-ai/", // Dummy DATA until webb app completed
    ],
    sessionId,
  );

  // Return the extracted content wrapped in the expected response format
  return {
    content: JSON.stringify(content, null, 2),
  };
}
