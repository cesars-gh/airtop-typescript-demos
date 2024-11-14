"use client";

import type { ContinueRequest, ContinueResponse } from "@/app/api/continue/continue.validation";
import { useAppStore } from "@/store";
import { Button } from "@local/ui";
import { useCallback } from "react";

export function ContinueForm() {
  const setContinueResponse = useAppStore((state) => state.setContinueResponse);
  const apiKey = useAppStore((state) => state.apiKey);
  const startResponse = useAppStore((state) => state.response);

  const onSubmit = useCallback(async () => {
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
  }, [setContinueResponse, apiKey, startResponse]);

  return (
    <Button type="submit" onClick={onSubmit}>
      I've signed in
    </Button>
  );
}
