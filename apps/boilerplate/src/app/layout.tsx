import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Airtop Demo",
  description: "Airtop demonstration",
};

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
      <body
        className={cn("min-h-screen bg-background font-sans antialiased mx-12", fontSans.variable, fontMono.variable)}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange enableColorScheme>
          <div>
            <div className="relative flex min-h-screen flex-col bg-background">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
