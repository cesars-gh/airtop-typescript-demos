import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import type { StartResponse } from "@/app/api/start/start.validation";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  apiKey: string;
  response: StartResponse;
};

type Actions = {
  setApiKey: (apiKey: string) => void;
  setStartResponse: (startResponse: StartResponse) => void;
  setContinueResponse: (continueResponse: ContinueResponse) => void;
};

export const useAppStore = create<State & Actions>()(
  immer((set) => ({
    apiKey: "",
    response: {},
    setApiKey: (apiKey: string) => {
      set((state) => {
        state.apiKey = apiKey;
      });
    },
    setStartResponse: (startResponse: StartResponse) => {
      set((state) => {
        state.response = startResponse;
      });
    },
    setContinueResponse: (continueResponse: ContinueResponse) => {
      set((state) => {
        state.response.signInRequired = false;
        state.response.content = continueResponse.content;
      });
    },
  })),
);
