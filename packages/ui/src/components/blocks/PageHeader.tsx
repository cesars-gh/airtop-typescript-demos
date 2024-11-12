export interface PageHeader {
  title: string;
}

export function PageHeader({ title }: PageHeader) {
  return (
    <div className="flex-1 space-y-4 pt-6 pb-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>
    </div>
  );
}
