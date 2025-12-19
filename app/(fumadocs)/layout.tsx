import "./global.css";
import "video.js/dist/video-js.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	),
	title: {
		default: "Fumadocs with Payload CMS",
		template: "%s | Fumadocs with Payload CMS",
	},
	description: "Comprehensive documentation and guides",
	authors: [{ name: "Bapusaheb Patil" }],
	creator: "Bapusaheb Patil",
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: "Fumadocs with Payload CMS",
		title: "Fumadocs with Payload CMS",
		description: "Comprehensive documentation and guides",
	},
	twitter: {
		card: "summary_large_image",
		title: "Fumadocs with Payload CMS",
		description: "Comprehensive documentation and guides",
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
