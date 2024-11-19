import type { StartResponse } from "@/app/api/start/start.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the start controller
 * @interface StartControllerParams
 * @property {string} apiKey - API key for LinkedIn authentication
 * @property {string} [profileId] - Optional profile ID for session management
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface StartControllerParams {
  apiKey: string;
  profileId?: string;
  log: LogLayer;
}

/**
 * Controls the initialization and execution of LinkedIn data extraction
 * @param {StartControllerParams} params - Configuration parameters
 * @returns {Promise<StartResponse>} Response containing session info or extracted content
 */
export async function startController({ apiKey, profileId, log }: StartControllerParams): Promise<StartResponse> {
  // Initialize the LinkedIn extractor service
  const service = new LinkedInExtractorService({ apiKey, log });

  // Start a new browser session and get window information
  const session = await service.createSession(profileId);

  // Check if the user is already authenticated with LinkedIn
  const isSignedIn = await service.checkIfSignedIntoLinkedIn(session.data.id);

  // If not signed in, return the live view URL for manual authentication
  if (!isSignedIn) {
    const liveViewUrl = await service.getLinkedInLoginPageLiveViewUrl(session.data.id);

    log.info("Sign-in to Linkedin is required, returning results with URL to live view", chalk.blueBright(liveViewUrl));

    return {
      sessionId: session.data.id,
      windowId: "random-id",
      profileId: session.data.profileId,
      liveViewUrl,
      signInRequired: true,
    };
  }

  // Extract LinkedIn data using the authenticated session
  const content = await service.getEmployeesListUrls(
    [
      "https://www.linkedin.com/company/asha-health-ai/", // Dummy DATA until webb app completed
    ],
    session.data.id,
  );

  // Return the extracted content
  return {
    signInRequired: false,
    content: JSON.stringify(content, null, 2),
  };
}
