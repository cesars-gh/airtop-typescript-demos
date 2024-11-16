"use client";

import type { ContinueRequest, ContinueResponse } from "@/app/api/continue/continue.validation";
import { useAppStore } from "@/store";
import { Button, ElapsedTime, useHandleError, useTerminateSession } from "@local/ui";
import { useCallback, useState } from "react";

export function ContinueForm() {
  const setContinueResponse = useAppStore((state) => state.setContinueResponse);
  const resetResponse = useAppStore((state) => state.resetResponse);
  const apiKey = useAppStore((state) => state.apiKey);
  const startResponse = useAppStore((state) => state.response);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleError = useHandleError();

  const onTerminateSession = useTerminateSession({
    sessionId: startResponse.sessionId!,
    apiKey,
    onTerminate: resetResponse,
  });

  const onSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/continue", {
        method: "POST",
        body: JSON.stringify({
          apiKey,
          sessionId: startResponse.sessionId,
          windowId: startResponse.windowId,
        } as ContinueRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = (await response.json()) as ContinueResponse;

      setContinueResponse(result);
    } catch (e: any) {
      handleError({
        error: e,
        consoleLogMessage: "Failed to extract",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [setContinueResponse, apiKey, startResponse, handleError]);

  return (
    <div className="flex gap-2">
      <div className="flex">
        {isSubmitting && <ElapsedTime content="Extracting..." />}
        {!isSubmitting && (
          <Button type="submit" onClick={onSubmit}>
            I've signed in
          </Button>
        )}
      </div>
      <div className="flex">
        <Button type="button" onClick={onTerminateSession} variant="destructive">
          Terminate session and start over
        </Button>
      </div>
    </div>
  );
}
