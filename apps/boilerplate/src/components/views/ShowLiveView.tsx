import { ContinueForm } from "@/components/forms/ContinueForm";
import { Card, CardContent, CardHeader, CardTitle, LiveView } from "@local/ui";

interface ShowLiveViewProps {
  liveViewUrl: string;
}

export function ShowLiveView({ liveViewUrl }: ShowLiveViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sign in to LinkedIn to Continue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex">
            <LiveView liveViewUrl={liveViewUrl} />
          </div>
          <div className="flex m-4">
            <ContinueForm />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
