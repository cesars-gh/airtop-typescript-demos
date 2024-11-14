interface LiveViewProps {
  liveViewUrl: string;
}

export function LiveView({ liveViewUrl }: LiveViewProps) {
  return (
    <iframe
      className="h-[500px] w-full border"
      allow="clipboard-read;clipboard-write;"
      title="Airtop Live View"
      id="airtop-live-view"
      src={liveViewUrl}
    />
  );
}
