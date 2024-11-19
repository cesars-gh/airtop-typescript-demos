import { startController } from "@/app/api/start/start.controller";
import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Initializes the Airtop session and start the process of extracting data from LinkedIn.
 * - Returns with a URL for the user to sign in via the live session if necessary
 * - Otherwise, will return with the extracted data
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/start]");

  const data = (await request.json()) as StartRequest;

  log.info("LALALA Received request data", JSON.stringify(data, null, 2));

  log.info("LALALA Validating request data");

  try {
    startRequestSchema.parse(data);

    log.info("LALALA Request data is valid");

    const controllerResponse = await startController({ log, ...data });
    return NextResponse.json<StartResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
