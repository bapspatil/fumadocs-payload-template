import "./global.css";
import "video.js/dist/video-js.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  authors: [{ name: "Bapusaheb Patil" }],
  creator: "Bapusaheb Patil",
  description: "Comprehensive documentation and guides",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    description: "Comprehensive documentation and guides",
    locale: "en_US",
    siteName: "Fumadocs with Payload CMS",
    title: "Fumadocs with Payload CMS",
    type: "website",
  },
  title: {
    default: "Fumadocs with Payload CMS",
    template: "%s | Fumadocs with Payload CMS",
  },
  twitter: {
    card: "summary_large_image",
    description: "Comprehensive documentation and guides",
    title: "Fumadocs with Payload CMS",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"flex min-h-screen flex-col"}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
