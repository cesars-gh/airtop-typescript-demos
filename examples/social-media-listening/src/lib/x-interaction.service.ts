import {
  EXTRACTED_POST_OUTPUT_SCHEMA,
  EXTRACT_POSTS_PROMPT,
  GENERATED_REPLY_OUTPUT_SCHEMA,
  GENERATE_REPLY_PROMPT,
  INITIAL_URL,
  IS_LOGGED_IN_OUTPUT_SCHEMA,
  IS_LOGGED_IN_PROMPT,
  RESULT_LIMIT,
  SCREEN_RESOLUTION,
  SEARCH_URL,
  type TExtractedPostResult,
  type TGeneratedReplyResult,
  type TPost,
  sleep,
} from "@/consts";
import { AirtopClient } from "@airtop/sdk";
import type { AiPromptResponse, SessionResponse, WindowResponse } from "@airtop/sdk/api";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

interface SessionContext {
  session: SessionResponse["data"];
  windowInfo: WindowResponse["data"] & { targetId: string };
}
/**
 * Service for interacting with Google Finance data using the Airtop client.
 */
export class XInteractionService {
  client: AirtopClient;
  log: LogLayer;
  apiKey: string;
  /**
   * Creates a new instance of InteractionsService.
   * @param {Object} params - Configuration parameters
   * @param {string} params.apiKey - API key for Airtop client authentication
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({
    apiKey,
    log,
  }: {
    apiKey: string;
    log: LogLayer;
    ticker?: string;
  }) {
    this.apiKey = apiKey;
    this.client = new AirtopClient({
      apiKey,
    });
    this.log = log;
  }

  /**
   * Terminates a session.
   * @param sessionId - The ID of the session to terminate
   */
  async terminateSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    this.log.info(chalk.yellow("Terminating session"));
    await this.client.sessions.terminate(sessionId);
  }

  /**
   * Initialize a new browser session and window.
   * @param {string} [profileId] - Optional profile ID for session persistence
   * @returns {Promise<{session: any, windowInfo: any}>} Session and window information
   */
  async initializeSessionAndBrowser(profileId?: string): Promise<SessionContext> {
    this.log.info("Creating a new session");
    const sessionResponse = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 10,
        persistProfile: !profileId, // Only persist a new profile if we do not have an existing profileId
        baseProfileId: profileId,
      },
    });

    const session = sessionResponse.data;

    this.log.info("Created session: ", session.id);
    this.log.info("Profile Id: ", profileId || session.profileId);

    if (!session.cdpWsUrl) {
      throw new Error("Unable to get cdp url");
    }

    this.log.info("Creating browser window");
    const windowResponse = await this.client.windows.create(session.id, { url: INITIAL_URL });

    this.log.info("Getting browser window info");
    const wInfo = await this.client.windows.getWindowInfo(session.id, windowResponse.data.windowId, {
      screenResolution: `${SCREEN_RESOLUTION.width}x${SCREEN_RESOLUTION.height}`,
      disableResize: true,
    });

    return {
      session,
      // windowInfo: wInfo.data,
      windowInfo: {
        ...wInfo.data,
        targetId: windowResponse.data.targetId,
      },
    };
  }

  /**
   * Check if the user is currently signed into the target website.
   * @param {Object} params - Parameters for checking login status
   * @param {string} params.sessionId - Active session ID
   * @param {string} params.windowId - Active window ID
   * @returns {Promise<boolean>} Whether the user is logged in
   */
  async checkIfSignedIntoWebsite({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<boolean> {
    this.log.info("Determining whether the user is logged in or not...");
    const isLoggedInPromptResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: IS_LOGGED_IN_PROMPT,
      configuration: {
        outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
      },
    });

    const parsedResponse = JSON.parse(isLoggedInPromptResponse.data.modelResponse);

    if (parsedResponse.error) {
      throw new Error(parsedResponse.error);
    }

    return parsedResponse.isLoggedIn;
  }

  // search posts
  async searchPosts({
    sessionContext,
    query,
    matchPrompt,
  }: { sessionContext: SessionContext; query: string; matchPrompt: string }): Promise<TPost[]> {
    const { session, windowInfo } = sessionContext;
    const sessionId = session.id;
    const windowId = windowInfo.windowId;
    // Navigate to the target URL
    this.log.info(`Navigating to ${SEARCH_URL}`);
    await this.client.windows.loadUrl(sessionId, windowId, { url: SEARCH_URL, waitUntil: "domContentLoaded" });

    // Workaround for the page not being fully loaded
    await sleep(2000);

    const typingAction = await this.client.windows.type(sessionId, windowId, {
      elementDescription: "Search input at the top",
      text: query,
      pressEnterKey: true,
    });

    if (typingAction.errors?.length) {
      this.log.withError(typingAction.errors).error("Error typing into search box");
      throw new Error(typingAction.errors?.[0]?.message);
    }

    const clickingAction = await this.client.windows.click(sessionId, windowId, {
      elementDescription: `"Latest" tab at the top`,
    });

    if (clickingAction.errors?.length) {
      this.log.withError(clickingAction.errors).error("Error clicking on the 'Latest' tab");
      throw new Error(clickingAction.errors?.[0]?.message);
    }

    // const posts = await this.retrievePosts({ sessionContext, matchPrompt });

    this.log.info("Extracting posts, this might take a few minutes...");
    const extractionPrompt = this.refineMatchPrompt(matchPrompt);
    const pageResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: extractionPrompt,
      followPaginationLinks: true,
      configuration: {
        outputSchema: EXTRACTED_POST_OUTPUT_SCHEMA,
      },
    });

    // if (pageResponse.errors?.length) {
    //   this.log.withError(pageResponse.errors).error("Error extracting posts");
    //   throw new Error(pageResponse.errors?.[0]?.message);
    // }

    // this.log.withMetadata({ data: pageResponse.data }).info("<-- Model response");
    const parsedResponse = JSON.parse(pageResponse.data.modelResponse || "{}") as TExtractedPostResult;
    return parsedResponse.postList.filter((post) => post.isCandidate);
  }

  // async retrievePosts({
  //   sessionContext,
  //   matchPrompt,
  // }: { sessionContext: SessionContext; matchPrompt: string }): Promise<TPost[]> {
  //   const { session, windowInfo } = sessionContext;
  //   const extractionPrompt = this.refineMatchPrompt(matchPrompt);
  //   const postLimit = 1;
  //   const posts: TPost[] = [];

  //   const extractPosts = async () => {
  //     this.log.info("Extracting posts...");
  //     const pageResponse = await this.client.windows.pageQuery(session.id, windowInfo.targetId, {
  //       prompt: extractionPrompt,
  //       configuration: {
  //         outputSchema: EXTRACTED_POST_OUTPUT_SCHEMA,
  //       },
  //     });

  //     const parsedResponse = JSON.parse(pageResponse.data.modelResponse || "{}");
  //     return parsedResponse?.postList || [];
  //   };

  //   // const almostScroll = async () => {
  //   //   this.log.info("Scrolling to bottom of page...");
  //   //   await this.client.windows.hover(session.id, windowInfo.targetId, {
  //   //     elementDescription: "Scroll down the page and hover over the last post",
  //   //   });
  //   // };

  //   while (posts.length < postLimit) {
  //     // Give some time for the page to load results
  //     await sleep(2000);
  //     const newPosts = await extractPosts();
  //     posts.push(...newPosts);
  //     await this.scrollToBottom({ cdpWsUrl: session.cdpWsUrl || "", targetId: windowInfo.targetId });
  //   }

  //   return posts;
  // }

  // async scrollToBottom({ cdpWsUrl, targetId }: { cdpWsUrl: string; targetId: string }): Promise<void> {
  //   // this.log.info(chalk.gray("Connecting puppeteer with the session"));

  //   const puppeteerBrowser = await puppeteer.connect({
  //     browserWSEndpoint: cdpWsUrl,
  //     headers: {
  //       authorization: `Bearer ${this.apiKey}`,
  //     },
  //   });

  //   // Iterate through the pages to find the one that matches the target ID
  //   const pages = await puppeteerBrowser.pages();
  //   let matchingPage;
  //   for (const page of pages) {
  //     const pageTargetId = await (page.mainFrame() as any)._id;
  //     if (pageTargetId === targetId) {
  //       matchingPage = page;
  //       break;
  //     }
  //   }

  //   if (!matchingPage) {
  //     throw new Error("Unable to find page");
  //   }

  //   this.log.info(chalk.gray("Scrolling to end of page"));
  //   // await matchingPage.setViewport({
  //   //   width: SCREEN_RESOLUTION.width,
  //   //   height: SCREEN_RESOLUTION.height,
  //   // });

  //   await matchingPage.evaluate(() => {
  //     window.scrollTo(0, document.body.scrollHeight);
  //   });
  // }

  // reply to a post
  async replyInThread({
    sessionContext,
    postId,
    replyPrompt,
  }: { sessionContext: SessionContext; postId: string; replyPrompt: string }): Promise<AiPromptResponse> {
    this.log.info(`Visiting post: ${postId}`);
    await this.client.windows.loadUrl(sessionContext.session.id, sessionContext.windowInfo.windowId, { url: postId });
    await sleep(2000);

    // Generate reply
    const generateReplyPrompt = GENERATE_REPLY_PROMPT.replace("{CRITERIA_PROMPT}", replyPrompt);
    const pageResponse = await this.client.windows.pageQuery(
      sessionContext.session.id,
      sessionContext.windowInfo.windowId,
      {
        prompt: generateReplyPrompt,
        configuration: {
          outputSchema: GENERATED_REPLY_OUTPUT_SCHEMA,
        },
      },
    );

    if (pageResponse.errors?.length) {
      this.log.withError(pageResponse.errors).error("Error generating reply");
      throw new Error(pageResponse.errors?.[0]?.message);
    }

    const parsedResponse = JSON.parse(pageResponse.data.modelResponse || "{}") as TGeneratedReplyResult;
    this.log.info(`Generated reply: ${parsedResponse.reply}`);

    // type the reply
    const results = await this.client.windows.type(sessionContext.session.id, sessionContext.windowInfo.windowId, {
      elementDescription: `On the comment box with the text "Post your reply"`,
      text: parsedResponse.reply,
      pressEnterKey: false,
    });

    this.log.withMetadata({ results }).info("Reply results");
    return results;
  }

  refineMatchPrompt(matchPrompt: string): string {
    return EXTRACT_POSTS_PROMPT.replace(/[\t]/g, "")
      .replace("{REASULT_LIMIT}", RESULT_LIMIT.toString())
      .replace("{MATCH_PROMPT}", matchPrompt)
      .trim();
  }
}
