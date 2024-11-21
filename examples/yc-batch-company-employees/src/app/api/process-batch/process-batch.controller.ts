import type { ProcessBatchResponse } from "@/app/api/process-batch/process-batch.validation";
import { getServices } from "@/lib/services";
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
  const { airtop, yCombinator, linkedin } = getServices(apiKey, log);

  try {
    // Get companies for the selected batch
    const companies = await yCombinator.getCompaniesInBatch(batch, sessionId);

    // Get LinkedIn profile urls for the companies
    const linkedInProfileUrls = await yCombinator.getCompaniesLinkedInProfileUrls(companies.slice(0, 3));

    const isLoggedIn = await linkedin.checkIfSignedIntoLinkedIn(sessionId);

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

    // Get employee's Profile Urls for each employee list url
    const employeesProfileUrls = await linkedin.getEmployeesProfileUrls(employeesListUrls, sessionId);

    log.info("*** Batch operation completed, returning response to client ***");

    // Format the response
    return {
      sessionId,
      content: JSON.stringify(employeesProfileUrls, null, 2),
      signInRequired: false,
    };
  } finally {
    await airtop.terminateAllWindows();
    await airtop.terminateAllSessions();
  }
}
