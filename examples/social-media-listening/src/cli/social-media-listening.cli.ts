import "dotenv/config";
import { TASK_TITLE } from "@/consts";
import { XInteractionService } from "@/lib/x-interaction.service";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

/**
 * Command line example that uses Airtop to interact with the browser.
 */
async function cli() {
  const log = getLogger();
  const AIRTOP_API_KEY = process.env.AIRTOP_API_KEY;
  const AIRTOP_PROFILE_ID = process.env.AIRTOP_PROFILE_ID;

  const apiKey =
    AIRTOP_API_KEY ||
    (await input({
      message: "Enter your Airtop API key:",
      required: true,
    }));

  const profileId =
    AIRTOP_PROFILE_ID ||
    (await input({
      message: "(Optional) Enter Airtop Profile ID:",
      required: false,
    }));

  log.info(TASK_TITLE);

  const taskConfig = {
    // query: await input({
    //   message: "Enter the terms or hashtags to search for (e.g., #ai #agent):",
    //   required: true,
    // }),
    // matchPrompt: await input({
    //   message:
    //     "Define the criteria for selecting a candidate post to reply to (e.g., a post where the author asks about AI frameworks):",
    //   required: true,
    // }),
    // replyPrompt: await input({
    //   message:
    //     "What should the reply look like? Provide details on tone and content (e.g., a friendly response recommending Airtop):",
    //   required: true,
    // }),
    query: "#ai #agent #langchain",
    matchPrompt: "The author shares a project or tool regarding AI frameworks",
    replyPrompt: `
      Friendly response about the original post and recommending Airtop,
      an AI-powered cloud browser for web automation (airtop.ai).
    `,
  };

  const service = new XInteractionService({
    apiKey,
    log,
  });

  let sessionContext = undefined;

  try {
    sessionContext = await service.initializeSessionAndBrowser(profileId);
    const { session, windowInfo } = sessionContext;

    log.info("Live View URL:", chalk.green(windowInfo.liveViewUrl));

    // Give the user a chance to open the live view URL
    // await sleep(PROCESS_DELAY);
    // await input({
    //   message: "Press any key to continue...",
    // });

    // check if the user is logged in
    const isLoggedIn = await service.checkIfSignedIntoWebsite({
      sessionId: session.id,
      windowId: windowInfo.windowId,
    });

    if (!isLoggedIn) {
      log.info(chalk.yellow("You are not logged in. Please log in using the Live View URL above."));
      await input({
        message: "Press any key once you are logged in...",
      });
    }

    // search posts
    const postList = await service.searchPosts({
      sessionContext,
      query: taskConfig.query,
      matchPrompt: taskConfig.matchPrompt,
    });

    if (!postList.length) {
      log.warn("Could not find any posts matching the query. Consider changing the query.");
      return;
    }

    // ask for confirmation
    const message = `Found ${chalk.blue(postList.length)} posts matching the query. Would you like to proceed?`;
    const proceed = await confirm({
      message,
    });

    if (!proceed) {
      log.warn("Exiting...");
      return;
    }

    const post = postList[0]!;

    await service.replyInThread({
      sessionContext,
      postId: post.link,
      replyPrompt: taskConfig.replyPrompt,
    });

    // for (const post of postList) {
    //   // select a post
    //   log.withMetadata({ post }).info("Selected post:", chalk.green(post?.link));

    //   // reply to the post
    //   const reply = await service.replyInThread({
    //     sessionContext,
    //     postId: post.link,
    //     replyPrompt: taskConfig.replyPrompt,
    //   });
    // }

    // print result
    log.info(chalk.green("Replies sent successfully!"));
  } finally {
    if (sessionContext?.session) {
      await service.terminateSession(sessionContext.session.id);
    }
  }
}

cli().catch((e) => {
  console.warn("An error occurred");
  console.error(e);
  process.exit(1);
});
