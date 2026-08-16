import { extractMarkdownFromLexical } from "@/lib/lexical-to-markdown";
import type { source } from "@/lib/source";

export function getLLMText(
  page: NonNullable<Awaited<ReturnType<typeof source.getPage>>>
): string {
  const processed = extractMarkdownFromLexical(page.data.content);

  return `# ${page.data.title} (${page.url})

${processed}`;
}
