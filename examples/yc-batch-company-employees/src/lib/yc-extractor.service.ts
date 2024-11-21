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
import { AirtopService } from "@/lib/airtop.service";
import type { SessionResponse } from "@airtop/sdk/api";
import type { LogLayer } from "loglayer";

/**
 * Service for extracting data from Y Combinator.
 */
export class YCExtractorService extends AirtopService {
  log: LogLayer;
  sessions: SessionResponse[];

  /**
   * Creates a new instance of YCExtractorService.
   * @param {Object} params - Configuration parameters
   * @param {string} params.apiKey - API key for Airtop client authentication
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({ apiKey, log }: { apiKey: string; log: LogLayer }) {
    super({ apiKey });
    this.log = log;
    this.sessions = [];
  }

  /**
   * Creates a new session.
   * @returns {Promise<SessionResponse>} A promise that resolves to the created session
   */
  async createSession(): Promise<SessionResponse> {
    const session = await this.airtop.sessions.create({
      configuration: {
        timeoutMinutes: 15,
        persistProfile: false,
      },
    });

    this.sessions.push(session);

    return session;
  }

  /**
   * Terminates a session.
   * @param sessionId - The ID of the session to terminate
   */
  async terminateSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    await super.terminateSession(sessionId);
    this.sessions = this.sessions.filter((session) => session.data.id !== sessionId);
  }

  /**
   * Terminates all active sessions.
   */
  async terminateAllSessions(): Promise<void> {
    await Promise.all(this.sessions.map(async (session) => this.terminateSession(session.data.id)));
    this.sessions = [];
  }

  /**
   * Gets the Y Combinator batches from the Y Combinator Company Directory page.
   * @returns {Promise<string[]>} A promise that resolves to an array of batches
   */
  async getYcBatches(sessionId?: string): Promise<string[]> {
    // Get session info if provided, otherwise create a new session
    const session = sessionId ? await this.airtop.sessions.getInfo(sessionId) : await this.createSession();

    // YC Company Directory window
    const window = await this.airtop.windows.create(session.data.id, {
      url: YC_COMPANIES_URL,
    });

    // Extract the batches from the YC Company Directory page
    const modelResponse = await this.airtop.windows.pageQuery(session.data.id, window.data.windowId, {
      prompt: GET_YC_BATCHES_PROMPT,
      configuration: {
        outputSchema: GET_YC_BATCHES_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No batches found");
    }

    const batches = JSON.parse(modelResponse.data.modelResponse) as GetYcBatchesResponse;

    if (batches.error) {
      throw new Error(batches.error);
    }

    return batches.batches;
  }

  /**
   * Gets the companies in a given Y Combinator batch.
   * @param {string} batch - The batch to get companies for
   * @returns {Promise<string[]>} A promise that resolves to an array of company names
   */
  async getCompaniesInBatch(batch: string, sessionId?: string): Promise<Company[]> {
    const session = sessionId ? await this.airtop.sessions.getInfo(sessionId) : await this.createSession();

    // YC Company Directory window
    const window = await this.airtop.windows.create(session.data.id, {
      url: `${YC_COMPANIES_URL}?batch=${batch}`,
    });

    const modelResponse = await this.airtop.windows.pageQuery(session.data.id, window.data.windowId, {
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

    return response.companies;
  }

  /**
   * Gets the LinkedIn profile URLs for a list of companies.
   * @param {Company[]} companies - The companies to get LinkedIn profile URLs for
   * @returns {Promise<string[]>} A promise that resolves to an array of LinkedIn profile URLs
   */
  async getCompaniesLinkedInProfileUrls(companies: Company[]): Promise<string[]> {
    const companyLinks = companies.map((c) => c.link);

    const companyLinkedInProfileUrls = await Promise.all(
      companyLinks.map(async (link) => this.getCompanyLinkedInProfileUrl(link)),
    );

    await this.terminateAllSessions();

    return companyLinkedInProfileUrls.filter(Boolean) as string[];
  }

  /**
   * PRIVATE METHOD
   * Gets the LinkedIn profile URL for a company.
   * @param {string} companyLink - The URL of the company to get the LinkedIn profile URL for
   * @returns {Promise<string | null>} A promise that resolves to the LinkedIn profile URL or null if not found
   */
  private async getCompanyLinkedInProfileUrl(companyLink: string): Promise<string | null> {
    try {
      const session = await this.createSession();

      const window = await this.airtop.windows.create(session.data.id, {
        url: companyLink,
      });

      const modelResponse = await this.airtop.windows.pageQuery(session.data.id, window.data.windowId, {
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
    } catch (error) {
      this.log.error(`Error getting LinkedIn profile URL for ${companyLink}`);
      return null;
    }
  }
}
