import { StartForm } from "@/components/forms/StartForm";
import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@local/ui";

export default function MainPage() {
  return (
    <>
      <div className="flex-col">
        <PageHeader title="Linkedin Scraper" description="Scrapes data from a user's LinkedIn page." />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <StartForm />
        </CardContent>
      </Card>
    </>
  );
}
