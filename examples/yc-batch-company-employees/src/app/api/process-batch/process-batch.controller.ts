import type { ProcessBatchResponse } from "@/app/api/process-batch/process-batch.validation";
import { getServices } from "@/lib/service-factory";
import type { LogLayer } from "loglayer";

interface ProcessBatchControllerParams {
  apiKey: string;
  sessionId: string;
  batch: string;
  log: LogLayer;
}

export async function processBatchController({
  apiKey,
  sessionId,
  batch,
  log,
}: ProcessBatchControllerParams): Promise<ProcessBatchResponse> {
  const { airtop, YCombinator, linkedin } = getServices(apiKey, log);

  try {
    // Get companies for the selected batch
    const companies = await YCombinator.getCompaniesInBatch(batch, sessionId);
    log.withMetadata(companies).info("Successfully fetched companies in batch");

    // Get LinkedIn profile urls for the companies
    const linkedInProfileUrls = await YCombinator.getCompaniesLinkedInProfileUrls(companies.slice(0, 3));
    log.withMetadata(linkedInProfileUrls).info("Successfully fetched LinkedIn profile urls for the companies");

    const isLoggedIn = await linkedin.checkIfSignedIntoLinkedIn(sessionId);
    log.withMetadata({ isLoggedIn }).info("Successfully checked if signed into LinkedIn before continuing");

    // If LinkedIn auth is needed, return the live view URL
    if (!isLoggedIn) {
      const liveViewUrl = await linkedin.getLinkedInLoginPageLiveViewUrl(sessionId);
      return {
        sessionId,
        content: "",
        signInRequired: true,
        liveViewUrl,
      };
    }

    // Get employee list url for each company
    const employeesListUrls = await linkedin.getEmployeesListUrls(linkedInProfileUrls, sessionId);
    log.withMetadata(employeesListUrls).info("Successfully fetched employee list urls for the companies");

    // Get employee's Profile Urls for each employee list url
    const employeesProfileUrls = await linkedin.getEmployeesProfileUrls(employeesListUrls, sessionId);
    log.withMetadata(employeesProfileUrls).info("Successfully fetched employee's profile urls for the employees");

    // Format the response
    return {
      sessionId,
      content: JSON.stringify(employeesProfileUrls, null, 2),
      signInRequired: false,
    };
  } finally {
    await airtop.terminateAllWindows();
    await airtop.terminateAllSessions();
    log.info("Successfully terminated sessions and windows");
  }
}
