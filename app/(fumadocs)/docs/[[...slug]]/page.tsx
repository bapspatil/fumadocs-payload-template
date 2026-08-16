import config from "@payload-config";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import VideoJSPlayer from "@/components/videojs-player";
import {
  extractTableOfContents,
  serializeLexical,
} from "@/lib/lexical-serializer";
import { getPageImageUrl, source } from "@/lib/source";
import { EditButton } from "./page.client";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = await source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const payload = await getPayload({ config });
  const contentHtml = await serializeLexical(page.data.content, payload);
  const toc = extractTableOfContents(page.data.content);
  const markdownUrl = `${page.url}.md`;
  const lastUpdated = page.data.updatedAt
    ? new Date(page.data.updatedAt)
    : undefined;

  return (
    <DocsPage tableOfContent={{ single: false, style: "clerk" }} toc={toc}>
      <DocsTitle className="font-bold font-serif text-4xl md:text-5xl">
        {page.data.title}
      </DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} />
        <EditButton
          payloadUrl={`/admin/collections/docs/${String(page.data.id)}`}
        />
      </div>
      <DocsBody>
        <VideoJSPlayer html={contentHtml} />
      </DocsBody>
      {lastUpdated ? <PageLastUpdate date={lastUpdated} /> : null}
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

  const image = getPageImageUrl(page).url;

  return {
    description: page.data.description,
    openGraph: {
      images: image,
    },
    title: page.data.title,
    twitter: {
      card: "summary_large_image",
      images: image,
    },
  };
}

export const revalidate = 30;
