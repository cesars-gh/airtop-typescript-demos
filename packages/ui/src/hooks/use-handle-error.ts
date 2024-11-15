import { useToast } from "@/hooks/use-toast.js";
import { type ErrorResponse, getLogger } from "@local/utils";
import { useCallback } from "react";

export function useHandleError() {
  const { toast } = useToast();

  return useCallback(
    ({
      error,
      consoleLogMessage,
      toastTitle,
    }: { error: ErrorResponse; consoleLogMessage?: string; toastTitle?: string }) => {
      toast({
        title: toastTitle || "An error occurred",
        description: "See console logs for more information.",
      });

      if (consoleLogMessage) {
        getLogger().withError(error).error(consoleLogMessage);
      } else {
        getLogger().errorOnly(error);
      }
    },
    [toast],
  );
}
