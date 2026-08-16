import { generate as DefaultImage } from "fumadocs-ui/og";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getPageImageUrl, source } from "@/lib/source";

export const runtime = "nodejs";
export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const page = await source.getPage(slug.slice(0, -1));

  if (!page) {
    notFound();
  }

  return new ImageResponse(
    <DefaultImage
      description={page.data.description}
      site="FumaPayload"
      title={page.data.title}
    />,
    {
      height: 630,
      width: 1200,
    }
  );
}

export async function generateStaticParams() {
  const pages = await source.getPages();

  return pages.map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}
