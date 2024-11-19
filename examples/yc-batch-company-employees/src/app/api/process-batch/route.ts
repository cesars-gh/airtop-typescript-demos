import { processBatchController } from "@/app/api/process-batch/process-batch.controller";
import {
  type ProcessBatchRequest,
  type ProcessBatchResponse,
  processBatchRequestSchema,
} from "@/app/api/process-batch/process-batch.validation";
import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/process-batch]");

  log.info("LALALA got into the route", JSON.stringify(request, null, 2));
  const data = (await request.json()) as ProcessBatchRequest;

  log.info("LALALA Validating request data", JSON.stringify(data, null, 2));

  try {
    processBatchRequestSchema.parse(data);
    log.info("LALALA Request data is valid", JSON.stringify(data, null, 2));

    const controllerResponse = await processBatchController({ log, ...data });
    return NextResponse.json<ProcessBatchResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
