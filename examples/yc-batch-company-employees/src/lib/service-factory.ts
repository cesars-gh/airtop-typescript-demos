import type { LogLayer } from "loglayer";
import { AirtopService } from "./airtop.service";
import { LinkedInExtractorService } from "./linkedin-extractor.service";
import { YCExtractorService } from "./yc-extractor.service";

const instances = new Map<
  string,
  {
    airtop: AirtopService;
    linkedin: LinkedInExtractorService;
    YCombinator: YCExtractorService;
  }
>();

export function getServices(apiKey: string, log: LogLayer) {
  // Use apiKey as unique identifier for the service group
  if (!instances.has(apiKey)) {
    const airtop = new AirtopService({ apiKey });
    const linkedin = new LinkedInExtractorService({ airtop, log });
    const YCombinator = new YCExtractorService({ airtop, log });

    instances.set(apiKey, { airtop, linkedin, YCombinator });
  }

  return instances.get(apiKey)!;
}

export function cleanup(apiKey: string) {
  instances.delete(apiKey);
}
