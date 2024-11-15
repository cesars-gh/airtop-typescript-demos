import { AirtopError } from "@airtop/sdk";
import { ZodError } from "zod";

export function isAirtopClientError(error: any): error is AirtopError {
  return error instanceof AirtopError;
}

export function isZodError(error: any): error is ZodError {
  return error instanceof ZodError;
}

export interface ErrorResponse {
  type: "ZodError" | "AirtopError" | "Error";
  error: typeof ZodError | typeof AirtopError | Error;
}

export function serializeErrors(error: any): ErrorResponse {
  if (isZodError(error)) {
    return {
      type: "ZodError",
      error,
    };
  }

  if (isAirtopClientError(error)) {
    return {
      type: "AirtopError",
      error,
    };
  }

  return {
    type: "Error",
    error,
  };
}
