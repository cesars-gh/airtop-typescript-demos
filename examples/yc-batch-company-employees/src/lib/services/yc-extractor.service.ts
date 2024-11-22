import {
  type Company,
  GET_COMPANIES_IN_BATCH_OUTPUT_SCHEMA,
  GET_COMPANIES_IN_BATCH_PROMPT,
  GET_COMPANY_LINKEDIN_PROFILE_URL_OUTPUT_SCHEMA,
  GET_COMPANY_LINKEDIN_PROFILE_URL_PROMPT,
  GET_YC_BATCHES_OUTPUT_SCHEMA,
  GET_YC_BATCHES_PROMPT,
  type GetCompaniesInBatchResponse,
  type GetCompanyLinkedInProfileUrlResponse,
  type GetYcBatchesResponse,
  YC_COMPANIES_URL,
} from "@/consts";
import type { AirtopService } from "@/lib/services/airtop.service";
import type { LogLayer } from "loglayer";

/**
 * Service for extracting data from Y Combinator.
 */
export class YCExtractorService {
  airtop: AirtopService;
  log: LogLayer;

  /**
   * Creates a new instance of YCExtractorService.
   * @param {Object} params - Configuration parameters
   * @param {AirtopService} params.airtop - Airtop client
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({ airtop, log }: { airtop: AirtopService; log: LogLayer }) {
    this.airtop = airtop;
    this.log = log;
  }

  /**
   * Gets the Y Combinator batches from the Y Combinator Company Directory page.
   * @returns {Promise<string[]>} A promise that resolves to an array of batches
   */
  async getYcBatches(sessionId?: string): Promise<string[]> {
    this.log.info("Initiating fetch to get YC batches");

    // Get session info if provided, otherwise create a new session
    const session = sessionId
      ? await this.airtop.client.sessions.getInfo(sessionId)
      : await this.airtop.createSession();

    // YC Company Directory window
    const window = await this.airtop.client.windows.create(session.data.id, {
      url: YC_COMPANIES_URL,
    });

    this.log.info("Extracting YC batches");
    // Extract the batches from the YC Company Directory page
    const modelResponse = await this.airtop.client.windows.pageQuery(session.data.id, window.data.windowId, {
      prompt: GET_YC_BATCHES_PROMPT,
      configuration: {
        outputSchema: GET_YC_BATCHES_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No batches found");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as GetYcBatchesResponse;

    if (response.error) {
      throw new Error(response.error);
    }

    this.log
      .withMetadata({
        batches: response.batches,
      })
      .info("Successfully fetched YC batches");

    return response.batches;
  }

  /**
   * Gets the companies in a given Y Combinator batch.
   * @param {string} batch - The batch to get companies for
   * @param {string} sessionId - The ID of the session
   * @returns {Promise<string[]>} A promise that resolves to an array of company names
   */
  async getCompaniesInBatch(batch: string, sessionId?: string): Promise<Company[]> {
    this.log.info(`Initiating fetch to get companies in Y Combinator batch "${batch}"`);

    const session = sessionId
      ? await this.airtop.client.sessions.getInfo(sessionId)
      : await this.airtop.createSession();

    // YC Company Directory window
    const window = await this.airtop.client.windows.create(session.data.id, {
      url: `${YC_COMPANIES_URL}?batch=${batch}`,
    });

    this.log.info(`Extracting companies in batch "${batch}"`);
    const modelResponse = await this.airtop.client.windows.pageQuery(session.data.id, window.data.windowId, {
      prompt: GET_COMPANIES_IN_BATCH_PROMPT,
      configuration: {
        outputSchema: GET_COMPANIES_IN_BATCH_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No companies found");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as GetCompaniesInBatchResponse;

    if (response.error) {
      throw new Error(response.error);
    }

    this.log
      .withMetadata({
        companies: response.companies,
      })
      .info("Successfully fetched companies in batch");

    return response.companies;
  }

  /**
   * Gets the LinkedIn profile URLs for a list of companies.
   * @param {Company[]} companies - The companies to get LinkedIn profile URLs for
   * @returns {Promise<string[]>} A promise that resolves to an array of LinkedIn profile URLs
   */
  async getCompaniesLinkedInProfileUrls(companies: Company[]): Promise<string[]> {
    const companyLinks = companies.map((c) => c.link);

    this.log.info("Getting LinkedIn profile URLs for companies");
    const companyLinkedInProfileUrls = await Promise.all(
      companyLinks.map(async (link) => this.getCompanyLinkedInProfileUrl(link)),
    );

    this.log
      .withMetadata({
        linkedInProfileUrls: companyLinkedInProfileUrls,
      })
      .info("Successfully fetched LinkedIn profile urls for the companies");

    return companyLinkedInProfileUrls.filter(Boolean) as string[];
  }

  /**
   * PRIVATE METHOD
   * Gets the LinkedIn profile URL for a company.
   * @param {string} companyLink - The URL of the company to get the LinkedIn profile URL for
   * @returns {Promise<string | null>} A promise that resolves to the LinkedIn profile URL or null if not found
   */
  private async getCompanyLinkedInProfileUrl(companyLink: string): Promise<string | null> {
    let sessionId: string | undefined;
    let windowId: string | undefined;

    try {
      this.log.info(`Creating session to get LinkedIn profile URL for ${companyLink}`);
      const session = await this.airtop.createSession();
      sessionId = session.data.id;
      const window = await this.airtop.client.windows.create(session.data.id, {
        url: companyLink,
      });
      windowId = window.data.windowId;

      this.log.info(`Scraping for LinkedIn profile URL via ${companyLink}`);
      const modelResponse = await this.airtop.client.windows.pageQuery(session.data.id, window.data.windowId, {
        prompt: GET_COMPANY_LINKEDIN_PROFILE_URL_PROMPT,
        configuration: {
          outputSchema: GET_COMPANY_LINKEDIN_PROFILE_URL_OUTPUT_SCHEMA,
        },
      });

      if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
        return null;
      }

      const response = JSON.parse(modelResponse.data.modelResponse) as GetCompanyLinkedInProfileUrlResponse;

      if (response.error) {
        return null;
      }

      return response.linkedInProfileUrl;
    } catch (error: any) {
      this.log
        .withError(error?.message ?? error)
        .withMetadata({ sessionId, windowId })
        .error(`Skipping LinkedIn profile URL for ${companyLink} due to an error`);
      return null;
    } finally {
      if (windowId) {
        await this.airtop.terminateWindow(windowId);
      }

      if (sessionId) {
        await this.airtop.terminateSession(sessionId);
      }
    }
  }
}
