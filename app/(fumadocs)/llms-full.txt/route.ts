import { source } from "@/lib/source";

// cached forever
export const revalidate = false;

/**
 * Extract formatted text from Lexical content preserving structure
 */
function extractTextFromLexical(content: any): string {
  if (!content?.root) {
    return "";
  }

  function extractFromNode(node: any): string {
    if (!node) {
      return "";
    }

    // Handle root node
    if (node.type === "root") {
      return (node.children || [])
        .map((child: any) => extractFromNode(child))
        .join("\n\n");
    }

    // Handle headings
    if (node.type === "heading") {
      const tag = node.tag || "h2";
      const depth = Number.parseInt(tag.substring(1));
      const hashes = "#".repeat(depth);
      const text = extractTextContent(node);
      return `${hashes} ${text}`;
    }

    // Handle paragraphs
    if (node.type === "paragraph") {
      return extractTextContent(node);
    }

    // Handle lists
    if (node.type === "list") {
      return (node.children || [])
        .map((child: any) => extractFromNode(child))
        .join("\n");
    }

    if (node.type === "listitem") {
      const text = extractTextContent(node);
      return `- ${text}`;
    }

    // Handle quote
    if (node.type === "quote") {
      const text = extractTextContent(node);
      return `> ${text}`;
    }

    // Handle code block
    if (node.type === "code") {
      const text = extractTextContent(node);
      const language = node.language || "";
      return `\`\`\`${language}\n${text}\n\`\`\``;
    }

    // Handle text node
    if (node.type === "text") {
      return node.text || "";
    }

    // Handle line break
    if (node.type === "linebreak") {
      return "\n";
    }

    // Fallback: extract children if they exist
    if (node.children && Array.isArray(node.children)) {
      return (node.children || [])
        .map((child: any) => extractFromNode(child))
        .join("\n\n");
    }

    return "";
  }

  function extractTextContent(node: any): string {
    if (!node) {
      return "";
    }

    if (node.type === "text") {
      return node.text || "";
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractTextContent).join("");
    }

    return "";
  }

  return extractFromNode(content.root);
}

export async function GET() {
  const pages = await source.getPages();

  const llmTexts = pages.map((page) => {
    const content = extractTextFromLexical(page.data.content);

    return `%23 ${page.data.title}
URL: ${page.url}

${content}`;
  });

  return new Response(llmTexts.join("\n\n"));
}
