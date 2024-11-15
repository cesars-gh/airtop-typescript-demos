import type { StartResponse } from "@/app/api/start/start.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

interface StartControllerParams {
  apiKey: string;
  profileId?: string;
  log: LogLayer;
}

export async function startController({ apiKey, profileId, log }: StartControllerParams): Promise<StartResponse> {
  const service = new LinkedInExtractorService({ apiKey, log });

  const { session, windowInfo } = await service.initializeSessionAndBrowser(profileId);

  const isSignedIn = await service.checkIfSignedIntoLinkedIn({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  if (!isSignedIn) {
    log.info(
      "Sign-in to Linkedin is required, returning results with URL to live view",
      chalk.blueBright(windowInfo.data.liveViewUrl),
    );

    return {
      sessionId: session.id,
      windowId: windowInfo.data.windowId,
      profileId: session.profileId,
      liveViewUrl: windowInfo.data.liveViewUrl,
      signInRequired: true,
    };
  }

  const content = await service.extractLinkedInData({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  return {
    signInRequired: false,
    content,
  };
}
