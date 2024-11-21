import { ThemeProvider } from "@/components/providers/ThemeProvider.jsx";
import { Toaster } from "@/components/ui/toaster.jsx";
import { fontMono, fontSans } from "@/lib/fonts.js";
import { cn } from "@/lib/index.js";
import type { PropsWithChildren } from "react";
import { HeaderNavigation } from "./HeaderNavigation.jsx";

export function Body({ children }: PropsWithChildren) {
  return (
    <body
      className={cn("min-h-screen bg-background font-sans antialiased mx-12", fontSans.variable, fontMono.variable)}
    >
      <ThemeProvider>
        <HeaderNavigation />
        <div>
          <div className="relative flex min-h-screen flex-col bg-background">{children}</div>
        </div>
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
