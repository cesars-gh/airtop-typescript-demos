"use client";
import { DisplayPromptResponse } from "@/components/views/DisplayPromptResponse";
import { InitializeView } from "@/components/views/InitializeView";
import { ShowLiveView } from "@/components/views/ShowLiveView";
import { useAppStore } from "@/store";
import { useTerminateSession } from "@local/ui";
import { useEffect } from "react";

export function MainContent() {
  const apiKey = useAppStore((state) => state.apiKey);
  const apiResponse = useAppStore((state) => state.response);
  const terminateSession = useTerminateSession({
    apiKey,
    sessionId: apiResponse.sessionId,
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (apiResponse.sessionId && apiKey && !apiResponse.content) {
        // Terminate the session when the user navigates away from the page
        terminateSession();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [apiKey, apiResponse.sessionId, apiResponse.content, terminateSession]);

  if (apiResponse?.signInRequired && apiResponse?.liveViewUrl) {
    return <ShowLiveView liveViewUrl={apiResponse.liveViewUrl} />;
  }

  if (apiResponse.content) {
    return <DisplayPromptResponse content={apiResponse.content} />;
  }

  return <InitializeView />;
}
