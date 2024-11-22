"use client";

import { type ExampleListing, exampleListings, getAppUrl } from "@internal/home-config";
import { Card, CardContent, CardHeader } from "@local/ui";

export function MainContent() {
  return (
    <div>
      {Object.values<ExampleListing>(exampleListings).map((listing) => (
        <Card
          key={listing.dirName}
          className="mb-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]"
          onClick={() => window.open(getAppUrl(listing.dirName), "_blank")}
        >
          <CardHeader className="text-xl font-bold">{listing.metadata.title.replace("Airtop:", "")}</CardHeader>
          <CardContent>
            <p className="text-xs italic">{getAppUrl(listing.dirName)}</p>
            <p className="pt-2">{listing.metadata.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
