import { terminateSessionController } from "@/api/terminate-session/terminate-session.controller.js";
import {
  type TerminateSessionRequest,
  type TerminateSessionResponse,
  terminateSessionRequestSchema,
} from "@/api/terminate-session/terminate-session.validation.js";
import { getLogger } from "@/logging.js";
import { type NextRequest, NextResponse } from "next/server.js";

/**
 * Terminates an Airtop session.
 */
export async function POST(request: NextRequest): Promise<NextResponse<TerminateSessionResponse>> {
  const log = getLogger().withPrefix("[api/terminate-session]");

  const data = (await request.json()) as TerminateSessionRequest;

  log.info("Validating request data");
  terminateSessionRequestSchema.parse(data);

  const response = await terminateSessionController({
    log,
    ...data,
  });

  return NextResponse.json<TerminateSessionResponse>(response);
}
