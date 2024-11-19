import { useAppStore } from "@/store";
import { Button, Card, CardContent, CardHeader, CardTitle, ElapsedTime } from "@local/ui";
import { useCallback, useState } from "react";

interface BatchSelectorFormProps {
  batches: string[];
}

export function BatchSelectorForm({ batches }: BatchSelectorFormProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiKey = useAppStore((state) => state.apiKey);
  const sessionId = useAppStore((state) => state.response.sessionId);
  const setProcessBatchResponse = useAppStore((state) => state.setProcessBatchResponse);
  const setGlobalSelectedBatch = useAppStore((state) => state.setSelectedBatch);

  const handleBatchSelect = useCallback(async () => {
    if (!selectedBatch || !sessionId) {
      console.error("Missing required data:", { selectedBatch, sessionId });
      return;
    }

    setIsSubmitting(true);
    try {
      setGlobalSelectedBatch(selectedBatch);
      console.log("Sending request to /api/process-batch");
      const response = await fetch("/api/process-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          batch: selectedBatch,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw errorData;
      }

      const result = await response.json();
      console.log("Success response:", result);
      setProcessBatchResponse(result);
    } catch (error) {
      console.error("Failed to process batch:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBatch, apiKey, sessionId, setProcessBatchResponse, setGlobalSelectedBatch]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Select YC Batch to pick companies from</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <select
            className="w-full p-2 border rounded-md bg-background"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">Select a batch...</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
          <Button onClick={handleBatchSelect} disabled={!selectedBatch || isSubmitting}>
            {isSubmitting ? <ElapsedTime content="Fetching employee profiles..." /> : "Process Batch"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
