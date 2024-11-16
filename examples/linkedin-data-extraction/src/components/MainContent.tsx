"use client";
import { DisplayPromptResponse } from "@/components/views/DisplayPromptResponse";
import { InitializeView } from "@/components/views/InitializeView";
import { ShowLiveView } from "@/components/views/ShowLiveView";
import { useAppStore } from "@/store";
import { useTerminateSession } from "@local/ui";
import { useEffect } from "react";

export function MainContent() {
  // Get API key and response from global state
  const apiKey = useAppStore((state) => state.apiKey);
  const apiResponse = useAppStore((state) => state.response);

  // Hook to handle session termination when needed
  const terminateSession = useTerminateSession({
    apiKey,
    sessionId: apiResponse.sessionId,
  });

  // Effect to clean up sessions when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only terminate if we have an active session (sessionId + apiKey)
      // but no content yet (still processing)
      if (apiResponse.sessionId && apiKey && !apiResponse.content) {
        terminateSession();
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [apiKey, apiResponse.sessionId, apiResponse.content, terminateSession]);

  // Conditional rendering based on application state:

  // 1. Show LinkedIn authentication view if sign-in is required
  if (apiResponse?.signInRequired && apiResponse?.liveViewUrl) {
    return <ShowLiveView liveViewUrl={apiResponse.liveViewUrl} />;
  }

  // 2. Show results if we have content
  if (apiResponse.content) {
    return <DisplayPromptResponse content={apiResponse.content} />;
  }

  // 3. Default view - show initialization screen
  return <InitializeView />;
}
