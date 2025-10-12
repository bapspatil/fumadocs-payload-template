import { source } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const pages = await source.getPages();

  const scanned: string[] = [];
  scanned.push("# Fumadocs with Payload CMS");

  // Group pages by category
  const byCategory = new Map<string, typeof pages>();
  for (const page of pages) {
    const categorySlug = page.data.categorySlug || "index";
    const arr = byCategory.get(categorySlug) ?? [];
    arr.push(page);
    byCategory.set(categorySlug, arr);
  }

  // Generate markdown list for each category
  for (const [categorySlug, categoryPages] of byCategory) {
    const lines = categoryPages.map((page) => {
      const description = page.data.description || "";
      return `- [${page.data.title}](${page.url}): ${description}`;
    });

    scanned.push(`## ${categorySlug}`);
    scanned.push(lines.join("\n"));
  }

  return new Response(scanned.join("\n\n"));
}
