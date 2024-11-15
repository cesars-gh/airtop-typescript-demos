import { AirtopClient } from "@airtop/sdk";
import type { LogLayer } from "loglayer";

export async function terminateSessionController({
  log,
  apiKey,
  sessionId,
}: { log: LogLayer; apiKey: string; sessionId: string }) {
  const client = new AirtopClient({
    apiKey,
  });

  log.info("Terminating session: ", sessionId);

  await client.sessions.terminate(sessionId);

  log.info("Session terminated: ", sessionId);

  return {
    ok: true,
  };
}
