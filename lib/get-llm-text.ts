import type { source } from "@/lib/source";

export async function getLLMText(page: NonNullable<Awaited<ReturnType<typeof source.getPage>>>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}
URL: ${page.url}

${processed}`;
}
