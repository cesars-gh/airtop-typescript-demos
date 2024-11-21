import type { LogLayer } from "loglayer";
import { AirtopService } from "./airtop.service";
import { LinkedInExtractorService } from "./linkedin-extractor.service";
import { YCExtractorService } from "./yc-extractor.service";

export function getServices(apiKey: string, log: LogLayer) {
  const airtop = new AirtopService({ apiKey, log });
  const linkedin = new LinkedInExtractorService({ airtop, log });
  const yCombinator = new YCExtractorService({ airtop, log });

  return { airtop, linkedin, yCombinator };
}
