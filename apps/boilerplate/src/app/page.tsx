import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@local/ui";

export default function MainPage() {
  return (
    <>
      <div className="flex-col">
        <PageHeader title="Sample Application" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12,234</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>
    </>
  );
}
