import "./globals.css";

import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { auth } from "@/auth";
import { Modals } from "@/components/modals";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { SubscriptionAlert } from "@/features/subscriptions/components/subscription-alert";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Stencil - Create Beautiful Designs",
    template: "%s | Stencil",
  },
  description:
    "A powerful, intuitive graphic design platform built with Next.js. Create stunning visuals, edit images, and design like a pro.",
  keywords: ["graphic design", "image editor", "stencil", "design tool"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Stencil",
    title: "Stencil - Create Beautiful Designs",
    description: "A powerful, intuitive graphic design platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stencil preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stencil - Create Beautiful Designs",
    description: "A powerful, intuitive graphic design platform.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html
        className={cn(
          "h-full",
          "antialiased",
          geistSans.variable,
          geistMono.variable,
          "font-sans",
          inter.variable,
        )}
        lang="en"
        suppressHydrationWarning
      >
        <body className="flex min-h-full flex-col">
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <Providers>
            <Toaster />
            <Modals />
            <Suspense fallback={null}>
              <SubscriptionAlert />
            </Suspense>
            {children}
          </Providers>
        </body>
      </html>
    </SessionProvider>
  );
}
