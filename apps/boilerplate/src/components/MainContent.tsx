"use client";
import { DisplayPromptResponse } from "@/components/views/DisplayPromptResponse";
import { InitializeView } from "@/components/views/InitializeView";
import { ShowLiveView } from "@/components/views/ShowLiveView";
import { useAppStore } from "@/store";

export function MainContent() {
  const apiResponse = useAppStore((state) => state.response);

  if (apiResponse?.signInRequired && apiResponse?.liveViewUrl) {
    return <ShowLiveView liveViewUrl={apiResponse.liveViewUrl} />;
  }

  if (apiResponse.content) {
    return <DisplayPromptResponse content={apiResponse.content} />;
  }

  return <InitializeView />;
}
