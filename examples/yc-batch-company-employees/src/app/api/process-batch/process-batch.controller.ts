import type { ProcessBatchResponse } from "@/app/api/process-batch/process-batch.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import { YCExtractorService } from "@/lib/yc-extractor.service";
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
  const service = new YCExtractorService({ apiKey, log });
  const linkedInService = new LinkedInExtractorService({ apiKey, log });

  try {
    // Get companies for the selected batch
    const companies = await service.getCompaniesInBatch(batch, sessionId);
    log.info("Successfully fetched companies in batch", JSON.stringify(companies, null, 2));

    // Get LinkedIn profile urls for the companies
    const linkedInProfileUrls = await service.getCompaniesLinkedInProfileUrls(companies.slice(0, 2));
    log.info(
      "Successfully fetched LinkedIn profile urls for the companies",
      JSON.stringify(linkedInProfileUrls, null, 2),
    );
    const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(sessionId);
    log.info("Successfully checked if signed into LinkedIn before continuing", JSON.stringify(isLoggedIn));

    // If LinkedIn auth is needed, return the live view URL
    if (!isLoggedIn) {
      const liveViewUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(sessionId);
      return {
        sessionId,
        content: "",
        signInRequired: true,
        liveViewUrl,
      };
    }

    // Get employee list url for each company
    const employeesListUrls = await linkedInService.getEmployeesListUrls(linkedInProfileUrls, sessionId);
    log.info("Successfully fetched employee list urls for the companies", JSON.stringify(employeesListUrls, null, 2));

    // Get employee's Profile Urls for each employee list url
    const employeesProfileUrls = await linkedInService.getEmployeesProfileUrls(employeesListUrls, sessionId);
    log.info(
      "Successfully fetched employee's profile urls for the employees",
      JSON.stringify(employeesProfileUrls, null, 2),
    );

    // Format the response
    return {
      sessionId,
      content: JSON.stringify(employeesProfileUrls, null, 2),
      signInRequired: false,
    };
  } catch (error) {
    // Clean up session if there's an error
    await service.terminateSession(sessionId);
    throw error;
  }
}
