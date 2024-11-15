import { MainContent } from "@/components/MainContent";
import { PageHeader } from "@local/ui";

export default function MainPage() {
  return (
    <>
      <div className="flex-col">
        <PageHeader
          title="Airtop Demo: LinkedIn Data Extraction"
          description="Extracts data from a user's LinkedIn page."
        />
      </div>
      <MainContent />
    </>
  );
}
