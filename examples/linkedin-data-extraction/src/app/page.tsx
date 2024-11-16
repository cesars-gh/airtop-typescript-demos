import { metadata } from "@/app/layout";
import { MainContent } from "@/components/MainContent";
import { PageHeader } from "@local/ui";

/**
 * The main page of the application.
 */
export default function MainPage() {
  return (
    <>
      <div className="flex-col">
        <PageHeader title={metadata.title! as string} description={metadata.description!} />
      </div>
      <MainContent />
    </>
  );
}
