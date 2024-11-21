import { AirtopClient } from "@airtop/sdk";
import type { SessionResponse, WindowIdResponse } from "@airtop/sdk/api";

/**
 * Base service for interacting with Airtop.
 */
export class AirtopService {
  client: AirtopClient;
  savedSessions: SessionResponse[];
  savedWindows: { sessionId: string; windowId: string }[];

  constructor({ apiKey }: { apiKey: string }) {
    this.client = new AirtopClient({ apiKey });

    this.savedSessions = [];
    this.savedWindows = [];
  }

  /**
   * Creates a new session.
   * @param profileId - The ID of the profile to use for the session
   * @returns The created session
   */
  async createSession(profileId?: string): Promise<SessionResponse> {
    const session = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 15,
        persistProfile: Boolean(!profileId), // Only persist a new profile if we do not have an existing profileId
        ...(profileId ? { baseProfileId: profileId } : {}),
      },
    });

    this.savedSessions.push(session);

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

    const session = this.savedSessions.find((session) => session.data.id === sessionId);

    if (!session) {
      return;
    }

    // Terminate the session
    await this.client.sessions.terminate(sessionId);

    // Remove the session from the list
    const index = this.savedSessions.indexOf(session);
    this.savedSessions.splice(index, 1);
  }

  /**
   * Terminates all sessions.
   */
  async terminateAllSessions(): Promise<void> {
    await Promise.all(this.savedSessions.map(async (session) => this.terminateSession(session.data.id)));
  }

  /**
   * Creates a new window.
   * @param sessionId - The ID of the session to create the window in
   * @param url - The URL to navigate to
   * @returns The created window
   */
  async createWindow(sessionId: string, url: string): Promise<WindowIdResponse> {
    const window = await this.client.windows.create(sessionId, { url });

    this.savedWindows.push({ sessionId, windowId: window.data.windowId });

    return window;
  }

  /**
   * Terminates a window.
   * @param windowId - The ID of the window to terminate
   */
  async terminateWindow(windowId: string | undefined): Promise<void> {
    if (!windowId) {
      return;
    }

    const window = this.savedWindows.find((window) => window.windowId === windowId);

    if (!window) {
      return;
    }

    // Close the window
    await this.client.windows.close(window.sessionId, window.windowId);

    // Remove the window from the list
    const index = this.savedWindows.indexOf(window);
    this.savedWindows.splice(index, 1);
  }

  /**
   * Terminates all windows.
   */
  async terminateAllWindows(): Promise<void> {
    await Promise.all(this.savedWindows.map(async (window) => this.terminateWindow(window.windowId)));
  }
}
