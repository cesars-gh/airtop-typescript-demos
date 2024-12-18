import { processBatchController } from "@/app/api/process-batch/process-batch.controller";
import {
  type ProcessBatchRequest,
  type ProcessBatchResponse,
  processBatchRequestSchema,
} from "@/app/api/process-batch/process-batch.validation";
import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/process-batch]");

  const data = (await request.json()) as ProcessBatchRequest;
  log.withMetadata(data).info("Validating request data");

  try {
    processBatchRequestSchema.parse(data);

    const controllerResponse = await processBatchController({ log, ...data });
    return NextResponse.json<ProcessBatchResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
