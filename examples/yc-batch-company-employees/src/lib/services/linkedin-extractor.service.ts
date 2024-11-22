import { IS_LOGGED_IN_OUTPUT_SCHEMA, IS_LOGGED_IN_PROMPT, type IsLoggedInResponse, LINKEDIN_FEED_URL } from "@/consts";
import type { AirtopService } from "@/lib/services/airtop.service";
import type { LogLayer } from "loglayer";

/**
 * Service for extracting data from LinkedIn.
 */
export class LinkedInExtractorService {
  log: LogLayer;
  airtop: AirtopService;

  /**
   * Creates a new instance of LinkedInExtractorService.
   * @param {Object} params - Configuration parameters
   * @param {AirtopService} params.airtop - Airtop client
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({ airtop, log }: { airtop: AirtopService; log: LogLayer }) {
    this.airtop = airtop;
    this.log = log;
  }

  /**
   * Extracts the LinkedIn employees search URL from the given text
   * @param text - The text to extract the LinkedIn employees search URL from
   * @returns The LinkedIn employees search URL or null if not found
   */
  extractEmployeeListUrl(text: string): string | null {
    // Pattern to match LinkedIn employees search URLs
    const pattern = /https:\/\/www\.linkedin\.com\/search\/results\/people\/\?[^"\s]*/g;

    // Find all search URLs
    const matches = text.match(pattern);

    // Filter to only include URLs with currentCompany parameter
    const employeesUrl = matches?.find((url) => url.includes("currentCompany="));

    return employeesUrl || null;
  }

  /**
   * Extracts the LinkedIn employees list URLs from the given text
   * @param text - The text to extract the LinkedIn employees list URLs from
   * @returns The list of LinkedIn employees list URLs
   */
  extractEmployeeProfileUrls(text: string): string[] {
    // Pattern to match LinkedIn profile URLs that appear after navigationUrl
    const pattern = /"navigationUrl":"(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\?[^"]*)?)/g;

    // Find all matches and extract just the URL part
    const matches = [...text.matchAll(pattern)].map((match) => match[1]);

    // Remove any query parameters to get clean profile URLs
    const cleanUrls = matches.map((url) => url?.split("?")[0]).filter(Boolean) as string[];

    // Remove duplicates
    return [...new Set(cleanUrls)];
  }

  /**
   * Processes a list of URLs in batches to avoid rate limiting / overloading issues
   * @param urls - The list of URLs to process
   * @param processor - The function to process each URL
   * @param batchSize - The size of the batch
   * @param delayBetweenBatchesInMs - The delay between batches in milliseconds
   * @returns The results of processing each URL
   */
  async processBatchedUrls<T>({
    urls,
    processor,
    batchSize = 1,
    delayBetweenBatchesInMs = 3000,
  }: {
    urls: string[];
    processor: (url: string) => Promise<T>;
    batchSize?: number;
    delayBetweenBatchesInMs?: number;
  }): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      this.log.info(`Processing ${batch.length} / ${urls.length} URLs`);
      const batchResults = await Promise.all(batch.map(processor));

      results.push(...batchResults);

      // Wait for the specified delay between batches
      this.log.info(`Waiting for ${delayBetweenBatchesInMs}ms before processing the next batch`);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatchesInMs));
    }

    return results;
  }

  /**
   * Checks if the user is signed into LinkedIn
   * @param sessionId - The ID of the session
   * @returns Whether the user is signed into LinkedIn
   */
  async checkIfSignedIntoLinkedIn(sessionId: string): Promise<boolean> {
    this.log.info("Checking if user is signed into LinkedIn");
    const window = await this.airtop.createWindow(sessionId, LINKEDIN_FEED_URL);

    const modelResponse = await this.airtop.client.windows.pageQuery(sessionId, window.data.windowId, {
      prompt: IS_LOGGED_IN_PROMPT,
      configuration: {
        outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No response from LinkedIn");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as IsLoggedInResponse;

    return response.isLoggedIn;
  }

  /**
   * Gets the LinkedIn employees list URLs for a given set of companies
   * @param companyLinkedInProfileUrls - The list of company LinkedIn profile URLs
   * @param sessionId - The ID of the session
   * @param parallelism - The number of parallel requests to make
   * @returns The list of LinkedIn employees list URLs
   */
  async getEmployeesListUrls({
    companyLinkedInProfileUrls,
    sessionId,
    parallelism,
  }: {
    companyLinkedInProfileUrls: string[];
    sessionId: string;
    parallelism: number;
  }): Promise<string[]> {
    this.log
      .withMetadata({
        parallelism,
      })
      .info("Attempting to get the list of employees for the companies");

    const employeesListUrls = await this.processBatchedUrls({
      urls: companyLinkedInProfileUrls,
      batchSize: parallelism,
      processor: async (url) => {
        let windowId: string | null = null;
        try {
          const companyProfileWindow = await this.airtop.createWindow(sessionId, url);
          windowId = companyProfileWindow.data.windowId;

          this.log.info(`Attempting to obtain company employee list for URL: ${url}`);

          const scrapedContent = await this.airtop.client.windows.scrapeContent(
            sessionId,
            companyProfileWindow.data.windowId,
          );

          const employeesListUrls = this.extractEmployeeListUrl(scrapedContent.data.modelResponse.scrapedContent.text);

          this.log
            .withMetadata({
              employeesListUrls,
            })
            .info("Successfully fetched employee list URLs for the companies");

          return employeesListUrls;
        } catch (error: any) {
          this.log
            .withError(error?.message ?? error)
            .withMetadata({
              sessionId,
              windowId,
            })
            .error(`Error extracting employees list URL for company LinkedIn profile: ${url}`);
          return null;
        }
      },
    });

    await this.airtop.terminateAllWindows();

    // Filter out any null values and remove duplicates
    return [...new Set(employeesListUrls.filter((url) => url !== null))];
  }

  /**
   * Gets the LinkedIn employees profile URLs for a list of LinkedIn employees list URLs
   * @param employeesListUrls - The list of LinkedIn employees list URLs
   * @param sessionId - The ID of the session
   * @param parallelism - The number of parallel requests to make
   * @returns The list of LinkedIn employees profile URLs
   */
  async getEmployeesProfileUrls({
    employeesListUrls,
    sessionId,
    parallelism,
  }: { employeesListUrls: string[]; sessionId: string; parallelism: number }): Promise<string[]> {
    this.log
      .withMetadata({
        parallelism,
      })
      .info("Initiating extraction of employee's profile URLs for the employees");

    const employeesProfileUrls = await this.processBatchedUrls({
      urls: employeesListUrls,
      batchSize: parallelism,
      processor: async (url) => {
        const window = await this.airtop.createWindow(sessionId, url);

        this.log.info(`Scraping content for employee URL: ${url}`);
        const scrapedContent = await this.airtop.client.windows.scrapeContent(sessionId, window.data.windowId);

        return this.extractEmployeeProfileUrls(scrapedContent.data.modelResponse.scrapedContent.text);
      },
    });

    await this.airtop.terminateAllWindows();

    const result = employeesProfileUrls.flat();

    this.log
      .withMetadata({
        employeesProfileUrls: result,
      })
      .info("Successfully obtained employee profile URLs");

    return result;
  }

  /**
   * Gets the LinkedIn login page Live View URL
   * @param sessionId - The ID of the session
   * @returns The LinkedIn login page Live View URL
   */
  async getLinkedInLoginPageLiveViewUrl(sessionId: string): Promise<string> {
    const linkedInWindow = await this.airtop.createWindow(sessionId, LINKEDIN_FEED_URL);

    const windowInfo = await this.airtop.client.windows.getWindowInfo(sessionId, linkedInWindow.data.windowId);

    return windowInfo.data.liveViewUrl;
  }
}
