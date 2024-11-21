import { IS_LOGGED_IN_OUTPUT_SCHEMA, IS_LOGGED_IN_PROMPT, type IsLoggedInResponse, LINKEDIN_FEED_URL } from "@/consts";
import type { AirtopService } from "@/lib/airtop.service";
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
  async processBatchedUrls<T>(
    urls: string[],
    processor: (url: string) => Promise<T>,
    batchSize = 3,
    delayBetweenBatchesInMs = 3000,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      const batchResults = await Promise.all(batch.map(processor));

      results.push(...batchResults);

      // Wait for the specified delay between batches
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
   * Gets the LinkedIn employees list URLs for a list of company LinkedIn profile URLs
   * @param companyLinkedInProfileUrls - The list of company LinkedIn profile URLs
   * @param sessionId - The ID of the session
   * @returns The list of LinkedIn employees list URLs
   */
  async getEmployeesListUrls(companyLinkedInProfileUrls: string[], sessionId: string): Promise<string[]> {
    const employeesListUrls = await this.processBatchedUrls(companyLinkedInProfileUrls, async (url) => {
      let windowId: string | null = null;
      try {
        const companyProfileWindow = await this.airtop.createWindow(sessionId, url);
        windowId = companyProfileWindow.data.windowId;

        const scrapedContent = await this.airtop.client.windows.scrapeContent(
          sessionId,
          companyProfileWindow.data.windowId,
        );

        return this.extractEmployeeListUrl(scrapedContent.data.modelResponse.scrapedContent.text);
      } catch (error) {
        this.log.error("Error extracting employees list URL for company LinkedIn profile URL", JSON.stringify(error));
        this.log.error("Company LinkedIn profile URL:", url);
        this.log.error("Session ID:", sessionId);
        this.log.error("Window ID:", windowId);
        return null;
      }
    });

    await this.airtop.terminateAllWindows();

    // Filter out any null values and remove duplicates
    return [...new Set(employeesListUrls.filter((url) => url !== null))];
  }

  /**
   * Gets the LinkedIn employees profile URLs for a list of LinkedIn employees list URLs
   * @param employeesListUrls - The list of LinkedIn employees list URLs
   * @param sessionId - The ID of the session
   * @returns The list of LinkedIn employees profile URLs
   */
  async getEmployeesProfileUrls(employeesListUrls: string[], sessionId: string): Promise<string[]> {
    const employeesProfileUrls = await this.processBatchedUrls(employeesListUrls, async (url) => {
      const window = await this.airtop.createWindow(sessionId, url);

      const scrapedContent = await this.airtop.client.windows.scrapeContent(sessionId, window.data.windowId);

      return this.extractEmployeeProfileUrls(scrapedContent.data.modelResponse.scrapedContent.text);
    });

    await this.airtop.terminateAllWindows();

    return employeesProfileUrls.flat();
  }

  /**
   * Gets the LinkedIn login page Live View URL
   * @param sessionId - The ID of the session
   * @returns The LinkedIn login page Live View URL
   */
  async getLinkedInLoginPageLiveViewUrl(sessionId: string): Promise<string> {
    const linkedInWindow = await this.airtop.createWindow(sessionId, LINKEDIN_FEED_URL);

    const windowInfo = await this.airtop.client.windows.getWindowInfo(sessionId, await linkedInWindow.data.windowId);

    return windowInfo.data.liveViewUrl;
  }
}
