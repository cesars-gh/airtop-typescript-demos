import type { StartResponse } from "@/app/api/start/start.validation";
import { IS_LOGGED_IN_OUTPUT_SCHEMA, IS_LOGGED_IN_PROMPT, LOGIN_URL } from "@/consts";
import { AirtopClient } from "@airtop/sdk";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

interface StartControllerParams {
  apiKey: string;
  profileId?: string;
  log: LogLayer;
}

export async function startController({ apiKey, profileId, log }: StartControllerParams): Promise<StartResponse> {
  const client = new AirtopClient({
    apiKey,
  });

  log.info("Creating a new session");
  const createSessionResponse = await client.sessions.create({
    configuration: {
      timeoutMinutes: 10,
      persistProfile: !profileId, // Only persist a new profile if we do not have an existing profileId
      baseProfileId: profileId,
    },
  });

  const session = createSessionResponse.data;
  log.info("Created session", session.id);

  if (!createSessionResponse.data.cdpWsUrl) {
    throw new Error("Unable to get cdp url");
  }

  log.info("Creating browser window");
  const windowResponse = await client.windows.create(session.id, { url: LOGIN_URL });

  log.info("Getting browser window info");
  const windowInfo = await client.windows.getWindowInfo(session.id, windowResponse.data.windowId);

  log.info("Determining whether the user is logged in...");
  const isLoggedInPromptResponse = await client.windows.pageQuery(session.id, windowInfo.data.windowId, {
    prompt: IS_LOGGED_IN_PROMPT,
    configuration: {
      outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
    },
  });

  log.info("Parsing response to if the use is logged in");
  const parsedResponse = JSON.parse(isLoggedInPromptResponse.data.modelResponse);

  if (parsedResponse.error) {
    throw new Error(parsedResponse.error);
  }

  const isUserLoggedIn = parsedResponse.isLoggedIn;

  // Prompt the user to log in if they are not logged in already
  if (!isUserLoggedIn) {
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

  return {
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
    profileId: session.profileId,
    liveViewUrl: windowInfo.data.liveViewUrl,
    signInRequired: false,
  };
}
