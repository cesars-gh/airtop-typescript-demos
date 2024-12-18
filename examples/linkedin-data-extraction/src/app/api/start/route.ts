import { startController } from "@/app/api/start/start.controller";
import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * Initializes the Airtop session and start the process of extracting data from LinkedIn.
 * - Returns with a URL for the user to sign in via the live session if necessary
 * - Otherwise, will return with the extracted data
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/start]");

  const data = (await request.json()) as StartRequest;

  log.info("Validating request data");

  try {
    startRequestSchema.parse(data);

    const controllerResponse = await startController({ log, ...data });
    return NextResponse.json<StartResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
