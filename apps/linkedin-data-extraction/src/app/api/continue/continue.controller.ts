import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
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
  const service = new LinkedInExtractorService({ apiKey, log });

  const content = await service.extractLinkedInData({
    sessionId,
    windowId,
  });

  return {
    content,
  };
}
