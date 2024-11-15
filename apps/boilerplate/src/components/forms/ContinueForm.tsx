"use client";

import type { ContinueRequest, ContinueResponse } from "@/app/api/continue/continue.validation";
import { useAppStore } from "@/store";
import { Button } from "@local/ui";
import { useCallback, useRef, useState } from "react";

export function ContinueForm() {
  const setContinueResponse = useAppStore((state) => state.setContinueResponse);
  const apiKey = useAppStore((state) => state.apiKey);
  const startResponse = useAppStore((state) => state.response);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const processingTimer = useRef<NodeJS.Timeout>();

  const onSubmit = useCallback(async () => {
    if (processingTimer.current) {
      clearInterval(processingTimer.current);
      processingTimer.current = undefined;
    }

    processingTimer.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    setIsSubmitting(true);
    const response = await fetch("/api/continue", {
      method: "POST",
      body: JSON.stringify({
        apiKey,
        sessionId: startResponse.sessionId,
        windowId: startResponse.windowId,
      } as ContinueRequest),
    });

    const result = (await response.json()) as ContinueResponse;
    setContinueResponse(result);

    setIsSubmitting(false);
    clearInterval(processingTimer.current);
    processingTimer.current = undefined;

    return () => {
      if (processingTimer.current) {
        clearInterval(processingTimer.current);
        processingTimer.current = undefined;
      }
    };
  }, [setContinueResponse, apiKey, startResponse]);

  return (
    <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
      {isSubmitting ? `Scraping... ${elapsedTime}s` : `I've signed in`}
    </Button>
  );
}
