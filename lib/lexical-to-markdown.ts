type LexicalTextNode = {
  type: "text";
  text?: string;
  format?: number;
};

type LexicalNode = {
  type?: string;
  tag?: string;
  language?: string;
  url?: string;
  children?: LexicalNode[];
  fields?: {
    url?: string;
    newTab?: boolean;
  };
  value?: {
    url?: string;
    alt?: string;
    filename?: string;
  };
} & Record<string, unknown>;

type LexicalContent = {
  root?: LexicalNode;
};

const BOLD = 1;
const ITALIC = 2;
const STRIKETHROUGH = 4;
const CODE = 16;

function isTextNode(node: LexicalNode): node is LexicalNode & LexicalTextNode {
  return node.type === "text";
}

function applyTextFormat(text: string, format = 0): string {
  let result = text;
  if (format & CODE) {
    result = `\`${result}\``;
  }
  if (format & BOLD) {
    result = `**${result}**`;
  }
  if (format & ITALIC) {
    result = `*${result}*`;
  }
  if (format & STRIKETHROUGH) {
    result = `~~${result}~~`;
  }
  return result;
}

function extractInlineText(node: LexicalNode | undefined): string {
  if (!node) {
    return "";
  }

  if (isTextNode(node)) {
    return applyTextFormat(node.text ?? "", node.format);
  }

  if (node.type === "linebreak") {
    return "\n";
  }

  if (node.type === "link") {
    const href = typeof node.fields?.url === "string" ? node.fields.url : "";
    const label = (node.children ?? []).map(extractInlineText).join("");
    return href ? `[${label}](${href})` : label;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractInlineText).join("");
  }

  return "";
}

function extractFromNode(node: LexicalNode | undefined): string {
  if (!node) {
    return "";
  }

  if (node.type === "root") {
    return (node.children ?? [])
      .map((child) => extractFromNode(child))
      .filter(Boolean)
      .join("\n\n");
  }

  if (node.type === "heading") {
    const tag = node.tag || "h2";
    const depth = Number.parseInt(tag.slice(1), 10) || 2;
    const hashes = "#".repeat(depth);
    return `${hashes} ${extractInlineText(node)}`;
  }

  if (node.type === "paragraph") {
    return extractInlineText(node);
  }

  if (node.type === "list") {
    return (node.children ?? [])
      .map((child) => extractFromNode(child))
      .filter(Boolean)
      .join("\n");
  }

  if (node.type === "listitem") {
    return `- ${extractInlineText(node)}`;
  }

  if (node.type === "quote") {
    return `> ${extractInlineText(node)}`;
  }

  if (node.type === "code") {
    const language = node.language || "";
    return `\`\`\`${language}\n${extractInlineText(node)}\n\`\`\``;
  }

  if (node.type === "horizontalrule") {
    return "---";
  }

  if (node.type === "upload") {
    const media = node.value;
    const url = typeof media?.url === "string" ? media.url : "";
    const alt =
      (typeof media?.alt === "string" && media.alt) ||
      (typeof media?.filename === "string" && media.filename) ||
      "media";
    return url ? `![${alt}](${url})` : "";
  }

  if (node.type === "relationship") {
    return extractInlineText(node);
  }

  if (isTextNode(node)) {
    return applyTextFormat(node.text ?? "", node.format);
  }

  if (node.type === "linebreak") {
    return "\n";
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children
      .map((child) => extractFromNode(child))
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

export function extractPlainTextFromLexical(content: unknown): string {
  if (!content || typeof content !== "object" || !("root" in content)) {
    return "";
  }

  const markdown = extractMarkdownFromLexical(content);
  return markdown
    .replace(/[#>*`_[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractMarkdownFromLexical(content: unknown): string {
  if (!content || typeof content !== "object") {
    return "";
  }

  const lexical = content as LexicalContent;
  if (!lexical.root) {
    return "";
  }

  return extractFromNode(lexical.root).trim();
}
