import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
}

export function DisplayPromptResponse({ content }: DisplayPromptResponseProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Scraped Data</CardTitle>
      </CardHeader>
      <CardContent>
        <pre>{content}</pre>
      </CardContent>
    </Card>
  );
}
