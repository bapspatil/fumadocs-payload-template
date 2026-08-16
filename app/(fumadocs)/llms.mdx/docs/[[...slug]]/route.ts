import { notFound } from "next/navigation";
import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const page = await source.getPage(slug);

  if (!page) {
    notFound();
  }

  return new Response(getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export async function generateStaticParams() {
  return await source.generateParams();
}
