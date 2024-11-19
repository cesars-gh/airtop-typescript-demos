import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import type { StartResponse } from "@/app/api/start/start.validation";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ProcessBatchResponse } from "./app/api/process-batch/process-batch.validation";

type State = {
  apiKey: string;
  response: StartResponse;
  batches: string[];
  selectedBatch?: string;
  sessionId?: string;
};

type Actions = {
  resetResponse: () => void;
  setApiKey: (apiKey: string) => void;
  setStartResponse: (startResponse: StartResponse) => void;
  setProcessBatchResponse: (response: ProcessBatchResponse) => void;
  setContinueResponse: (continueResponse: ContinueResponse) => void;
  setBatches: (batches: string[]) => void;
  setSelectedBatch: (batch: string) => void;
};

export const useAppStore = create<State & Actions>()(
  immer((set) => ({
    apiKey: "",
    response: {},
    batches: [],
    resetResponse: () => {
      set((state) => {
        state.response = {};
        state.batches = [];
      });
    },
    setApiKey: (apiKey: string) => {
      set((state) => {
        state.apiKey = apiKey;
      });
    },
    setBatches: (batches: string[]) => {
      set((state) => {
        state.batches = batches;
      });
    },
    setSelectedBatch: (batch: string) => {
      set((state) => {
        state.selectedBatch = batch;
      });
    },
    setStartResponse: (startResponse: StartResponse) => {
      set((state) => {
        state.response = startResponse;
        if (startResponse.batches) {
          state.batches = startResponse.batches;
        }
      });
    },
    setProcessBatchResponse: (processBatchResponse: ProcessBatchResponse) => {
      set((state) => {
        state.response.content = processBatchResponse.content;
        state.response.signInRequired = processBatchResponse.signInRequired;
        if (processBatchResponse.liveViewUrl) {
          state.response.liveViewUrl = processBatchResponse.liveViewUrl;
        }
      });
    },
    setContinueResponse: (continueResponse: ContinueResponse) => {
      set((state) => {
        state.response.signInRequired = false;
        state.response.sessionId = continueResponse.sessionId;
        if (continueResponse.batches) {
          state.batches = continueResponse.batches;
        }
      });
    },
  })),
);
