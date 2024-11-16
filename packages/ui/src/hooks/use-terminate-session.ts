import { useHandleError } from "@/hooks/use-handle-error.js";
import { useCallback } from "react";

/**
 * For use with the terminate-session API route (/api/terminate-session) to terminate a session.
 */
export function useTerminateSession({
  apiKey,
  sessionId,
  onTerminate,
}: {
  apiKey?: string;
  sessionId?: string;
  onTerminate?: () => void;
}) {
  const handleError = useHandleError();

  return useCallback(async () => {
    if (!apiKey || !sessionId) {
      return;
    }

    try {
      const response = await fetch("/api/terminate-session", {
        method: "POST",
        body: JSON.stringify({
          apiKey,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      if (onTerminate) {
        onTerminate();
      }
    } catch (e: any) {
      handleError(e);
    }
  }, [apiKey, sessionId, onTerminate, handleError]);
}
