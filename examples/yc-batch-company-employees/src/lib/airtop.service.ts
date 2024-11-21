import { AirtopClient } from "@airtop/sdk";

/**
 * Base service for interacting with Airtop.
 */
export class AirtopService {
  airtop: AirtopClient;

  constructor({ apiKey }: { apiKey: string }) {
    this.airtop = new AirtopClient({ apiKey });
  }

  /**
   * Terminates a session.
   * @param sessionId - The ID of the session to terminate
   */
  async terminateSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    await this.airtop.sessions.terminate(sessionId);
  }
}
