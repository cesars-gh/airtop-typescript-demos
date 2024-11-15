import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import { ScraperService } from "@/scraper.service";
import type { LogLayer } from "loglayer";

interface ContinueControllerParams {
  apiKey: string;
  sessionId: string;
  windowId: string;
  log: LogLayer;
}

export async function continueController({
  apiKey,
  log,
  sessionId,
  windowId,
}: ContinueControllerParams): Promise<ContinueResponse> {
  const service = new ScraperService({ apiKey, log });

  const content = await service.extractLinkedInData({
    sessionId,
    windowId,
  });

  return {
    content,
  };
}
