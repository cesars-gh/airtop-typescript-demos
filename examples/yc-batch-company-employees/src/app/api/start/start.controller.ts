import type { StartResponse } from "@/app/api/start/start.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import { YCExtractorService } from "@/lib/yc-extractor.service";
import type { LogLayer } from "loglayer";

interface StartControllerParams {
  apiKey: string;
  profileId?: string;
  log: LogLayer;
}

export async function startController({ apiKey, log, profileId }: StartControllerParams): Promise<StartResponse> {
  // Initialize the LinkedIn extractor service
  const linkedInService = new LinkedInExtractorService({ apiKey, log });

  // Create a new session
  const session = await linkedInService.createSession(profileId);

  try {
    const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(session.data.id);

    if (!isLoggedIn) {
      const liveViewUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(session.data.id);
      log.withMetadata({ liveViewUrl }).info("User needs to login to LinkedIn, returning live view URL");

      return {
        sessionId: session.data.id,
        profileId: session.data.profileId,
        liveViewUrl,
        signInRequired: true,
      };
    }

    // Initialize the YC extractor service
    const service = new YCExtractorService({ apiKey, log });

    // Fetch YC batches
    const batches = await service.getYcBatches(session.data.id);
    log.withMetadata(batches).info("Successfully fetched YC batches");

    // Return the batches in the response
    return {
      sessionId: session.data.id,
      profileId: session.data.profileId,
      batches: batches,
      signInRequired: false,
    };
  } catch (error) {
    // Clean up session if there's an error
    await linkedInService.terminateSession(session.data.id);
    throw error;
  }
}
