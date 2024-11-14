import { ThemeProvider, Toaster } from "@/components/index.js";
import { fontMono, fontSans } from "@/lib/fonts.js";
import { cn } from "@/lib/index.js";
import type { PropsWithChildren } from "react";

export function Body({ children }: PropsWithChildren) {
  return (
    <body
      className={cn("min-h-screen bg-background font-sans antialiased mx-12", fontSans.variable, fontMono.variable)}
    >
      <ThemeProvider>
        <div>
          <div className="relative flex min-h-screen flex-col bg-background">{children}</div>
        </div>
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
