import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import { YCExtractorService } from "@/lib/yc-extractor.service";
import type { SessionResponse } from "@airtop/sdk/api";
import { confirm, input, select } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

/**
 * Command line example that uses Airtop to extract data from LinkedIn.
 */
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

  const ycService = new YCExtractorService({
    apiKey,
    log,
  });

  const linkedInService = new LinkedInExtractorService({
    apiKey,
    log,
  });

  let ycSession: SessionResponse | undefined;
  let linkedInSession: SessionResponse | undefined;

  try {
    ycSession = await ycService.createSession();
    const batches = await ycService.getYcBatches(ycSession.data.id);

    const selectedBatch = await select({
      message: "Select a batch:",
      choices: batches.map((batch) => ({ name: batch, value: batch })),
    });

    const companies = await ycService.getCompaniesInBatch(selectedBatch, ycSession.data.id);

    log.withMetadata(companies).info("Companies");

    log.withMetadata(companies).info("Now we will extract the LinkedIn profile urls from the companies");

    log.info("This might take a while...");

    const linkedInProfileUrls = await ycService.getCompaniesLinkedInProfileUrls(companies.slice(0, 5));
    log.withMetadata(linkedInProfileUrls).info("LinkedIn profile urls");

    linkedInSession = await linkedInService.createSession(profileId);
    log.withMetadata({ profileId: linkedInSession.data.profileId }).info("Profile id");

    const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(linkedInSession.data.id);

    if (!isLoggedIn) {
      const linkedInLoginPageUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(linkedInSession.data.id);

      log.withMetadata({ linkedInLoginPageUrl }).info("Please sign in to LinkedIn using this URL");

      await confirm({ message: "Press enter once you have signed in", default: true });
    }

    const employeesListUrls = await linkedInService.getEmployeesListUrls(linkedInProfileUrls, linkedInSession.data.id);
    log.withMetadata(employeesListUrls).info("Employees list urls");

    const employeeProfileUrls = await linkedInService.getEmployeesProfileUrls(
      employeesListUrls,
      linkedInSession.data.id,
    );
    log.withMetadata(employeeProfileUrls).info("Employee profile urls");

    log.info("Extraction completed successfully");
  } finally {
    // Cleanup
    await linkedInService.terminateSession(linkedInSession?.data.id);
    await ycService.terminateSession(ycSession?.data.id);
  }

  process.exit(0);
}

cli().catch((e) => {
  console.log(chalk.red("An error occurred"));
  console.error(e);
  process.exit(1);
});
