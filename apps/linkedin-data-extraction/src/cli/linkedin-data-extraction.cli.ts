import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

async function cli() {
  const log = getLogger();

  const apiKey = await input({
    message: "Enter your Airtop API key:",
    required: true,
  });

  const profileId = await input({
    message: "(optional) Enter a browser profile ID to use:",
    required: false,
  });

  const service = new LinkedInExtractorService({
    apiKey,
    log,
  });

  const { session, windowInfo } = await service.initializeSessionAndBrowser(profileId);

  const isSignedIn = await service.checkIfSignedIntoLinkedIn({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  if (!isSignedIn) {
    log.info("");
    log.info(
      chalk.blue("Sign-in to Linkedin is required, please sign-in to using this live view URL on your browser:"),
    );

    log.info(windowInfo.data.liveViewUrl);
    log.info("");

    await confirm({ message: "Press enter once you have signed in", default: true });
  }

  const content = await service.extractLinkedInData({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  const formattedJson = JSON.stringify(JSON.parse(content), null, 2);

  log.info("Response:\n\n", chalk.green(formattedJson));

  log.info("Extraction completed successfully");
}

cli().catch((e) => {
  console.log(chalk.red("An error occurred"));
  console.error(e);
  process.exit(1);
});
