import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import VideoJSPlayer from "@/components/videojs-player";
import {
	extractTableOfContents,
	serializeLexical,
} from "@/lib/lexical-serializer";
import { source } from "@/lib/source";
import { EditButton, LLMCopyButton } from "./page.client";

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = await source.getPage(params.slug);

	if (!page) {
		notFound();
	}

	// Get payload instance for content serialization
	const payload = await getPayload({ config });

	// Serialize Lexical content to HTML
	const contentHtml = await serializeLexical(page.data.content, payload);
	const toc = extractTableOfContents(page.data.content);

	return (
		<DocsPage
			footer={{ enabled: false }}
			tableOfContent={{ style: "normal", single: false }}
			toc={toc}
		>
			<DocsTitle className="font-bold font-serif text-4xl md:text-5xl">
				{page.data.title}
			</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
			<div className="flex flex-row items-center gap-2 border-b pb-6">
				<LLMCopyButton slug={params.slug ?? []} />
				<EditButton
					payloadUrl={`/admin/collections/docs/${String(page.data.id)}`}
				/>
			</div>
			<DocsBody>
				<VideoJSPlayer html={contentHtml} />
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return await source.generateParams();
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = await source.getPage(params.slug);

	if (!page) {
		notFound();
	}

	const slugPath = params.slug?.join("/") || "";
	const image = `/docs-og/${slugPath}/image.png`;

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			images: image,
		},
		twitter: {
			card: "summary_large_image",
			images: image,
		},
	};
}

export const revalidate = 30;
