"use client";

import { ThemeProvider } from "next-themes";

import { QueryProvider } from "@/components/query-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
};
