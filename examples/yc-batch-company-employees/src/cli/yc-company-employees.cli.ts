import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import { YCExtractorService } from "@/lib/yc-extractor.service";
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

  const ycSession = await ycService.createSession();
  const batches = await ycService.getYcBatches(ycSession.data.id);

  const selectedBatch = await select({
    message: "Select a batch:",
    choices: batches.map((batch) => ({ name: batch, value: batch })),
  });

  const companies = await ycService.getCompaniesInBatch(selectedBatch, ycSession.data.id);

  log.info("Companies:\n\n", chalk.green(JSON.stringify(companies, null, 2)));

  log.info("Now we will extract the LinkedIn profile urls from the companies");
  log.info("This might take a while...");

  const linkedInProfileUrls = await ycService.getCompaniesLinkedInProfileUrls(companies.slice(0, 3));
  log.info("LinkedIn profile urls:\n\n", chalk.green(JSON.stringify(linkedInProfileUrls, null, 2)));

  const linkedInSession = await linkedInService.createSession(profileId);
  log.info("Profile id: ", chalk.green(linkedInSession.data.profileId));

  const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(linkedInSession.data.id);

  if (!isLoggedIn) {
    const linkedInLoginPageUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(linkedInSession.data.id);

    log.info("Please sign in to LinkedIn using this URL:\n\n", chalk.blue(linkedInLoginPageUrl));

    await confirm({ message: "Press enter once you have signed in", default: true });
  }

  const employeesListUrls = await linkedInService.getEmployeesListUrls(linkedInProfileUrls, linkedInSession.data.id);
  log.info("Employees list urls:\n\n", chalk.green(JSON.stringify(employeesListUrls, null, 2)));

  const employeeProfileUrls = await linkedInService.getEmployeesProfileUrls(employeesListUrls, linkedInSession.data.id);
  log.info("Employee profile urls:\n\n", chalk.green(JSON.stringify(employeeProfileUrls, null, 2)));

  log.info("Extraction completed successfully");

  // Cleanup
  await linkedInService.terminateSession(linkedInSession.data.id);
  await ycService.terminateSession(ycSession.data.id);

  process.exit(0);
}

cli().catch((e) => {
  console.log(chalk.red("An error occurred"));
  console.error(e);
  process.exit(1);
});
