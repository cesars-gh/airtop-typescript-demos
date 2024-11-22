import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import "./globals.css";
import { exampleListings } from "@internal/home-config";
import { Body } from "@local/ui";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = exampleListings.LINKEDIN_DATA_EXTRACTION.metadata;

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <Body>{children}</Body>
    </html>
  );
}
