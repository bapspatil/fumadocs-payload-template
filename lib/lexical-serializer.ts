import type {
  DefaultNodeTypes,
  SerializedRelationshipNode,
  SerializedUploadNode,
  SerializedLinkNode,
} from "@payloadcms/richtext-lexical";
import { getPayloadPopulateFn } from "@payloadcms/richtext-lexical";
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
} from "@payloadcms/richtext-lexical/html-async";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Payload } from "payload";
import type { Category, Doc, Media } from "@/payload-types";

export interface TableOfContentsItem {
  title: string;
  url: string;
  depth: number;
}

/**
 * Escape HTML characters in a string
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Extract Vimeo video identifier from URL
 * Supports formats:
 * - https://vimeo.com/1116751860 -> "1116751860"
 * - https://vimeo.com/1116751860/27f4807174 -> "1116751860/27f4807174"
 * - https://player.vimeo.com/video/1116751860 -> "1116751860"
 * Returns the ID with privacy hash if present (required for private/unlisted videos)
 */
function extractVimeoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Check if it's a Vimeo domain
    if (!urlObj.hostname.includes("vimeo.com")) {
      return null;
    }

    // Match patterns like /1116751860 or /video/1116751860 or /1116751860/hash
    const match = urlObj.pathname.match(/\/(?:video\/)?(\d+(?:\/[\w-]+)?)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Convert text to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extract table of contents from Lexical content
 */
export function extractTableOfContents(content: any): TableOfContentsItem[] {
  if (!content?.root?.children) {
    return [];
  }

  const toc: TableOfContentsItem[] = [];
  const usedSlugs = new Map<string, number>();

  function extractHeadings(node: any): void {
    if (!node) return;

    if (node.type === "heading") {
      const tag = node.tag || "h2";
      const depth = Number.parseInt(tag.substring(1));

      // Extract text content from children
      const text = extractTextFromNode(node);

      if (text) {
        let slug = slugify(text);

        // Handle duplicate slugs by appending a number
        if (usedSlugs.has(slug)) {
          const count = usedSlugs.get(slug)! + 1;
          usedSlugs.set(slug, count);
          slug = `${slug}-${count}`;
        } else {
          usedSlugs.set(slug, 0);
        }

        toc.push({
          title: text,
          url: `#${slug}`,
          depth,
        });
      }
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        extractHeadings(child);
      }
    }
  }

  extractHeadings(content.root);
  return toc;
}

/**
 * Extract plain text from a node
 */
function extractTextFromNode(node: any): string {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join("");
  }

  return "";
}

/**
 * Serialize Payload's Lexical editor content to HTML
 */
export async function serializeLexical(
  content: SerializedEditorState | null | undefined,
  payload: Payload
): Promise<string> {
  if (!content?.root?.children) {
    return "";
  }

  const html = await convertLexicalToHTMLAsync({
    converters: createConverterOverrides(payload),
    data: content,
    populate: await getPayloadPopulateFn({
      currentDepth: 0,
      depth: 2,
      payload,
    }),
  });

  return html ?? "";
}

function createConverterOverrides(
  payload: Payload
): HTMLConvertersFunctionAsync<DefaultNodeTypes> {
  const headingSlugCounts = new Map<string, number>();
  const docCache = new Map<string, Doc>();
  const categoryCache = new Map<string, Category>();

  const getUniqueSlug = (baseSlug: string): string => {
    if (!baseSlug) {
      return "heading";
    }

    if (headingSlugCounts.has(baseSlug)) {
      const nextCount = headingSlugCounts.get(baseSlug)! + 1;
      headingSlugCounts.set(baseSlug, nextCount);
      return `${baseSlug}-${nextCount}`;
    }

    headingSlugCounts.set(baseSlug, 0);
    return baseSlug;
  };

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: async (args) => {
      const { node, nodesToHTML, providedStyleTag } = args as {
        node: {
          tag: string;
          children?: SerializedEditorState["root"]["children"];
        };
        nodesToHTML: (input: {
          nodes: SerializedEditorState["root"]["children"];
        }) => Promise<string[]>;
        providedStyleTag: string;
      };
      const children = await nodesToHTML({ nodes: node.children ?? [] });
      const baseSlug = slugify(extractTextFromNode(node));
      const slug = getUniqueSlug(baseSlug);
      const className = headingClasses[node.tag] ?? "";
      return `<${node.tag}${providedStyleTag} id="${slug}" class="${className}">${children.join("")}</${node.tag}>`;
    },
    upload: async (args) => {
      const node = args.node as SerializedUploadNode;
      const doc =
        typeof node.value === "object"
          ? node.value
          : await args.populate?.({
              collectionSlug: node.relationTo,
              id: node.value,
            });
      const media = doc as Media | undefined;
      if (
        media &&
        typeof media === "object" &&
        media.mimeType?.startsWith("video")
      ) {
        const titleValue =
          typeof media.alt === "string" && media.alt
            ? media.alt
            : typeof media.filename === "string"
              ? media.filename
              : "";
        const urlValue = typeof media.url === "string" ? media.url : "";
        if (!urlValue) {
          return "";
        }

        const typeValue =
          typeof media.mimeType === "string" && media.mimeType
            ? media.mimeType
            : "video/mp4";
        const posterValue =
          typeof media.thumbnailURL === "string" && media.thumbnailURL
            ? media.thumbnailURL
            : undefined;

        const attributes: string[] = [
          'class="video-js lexical-player vjs-default-skin w-full rounded-lg"',
          "controls",
          "playsinline",
          'preload="auto"',
          `data-videojs-player="true"`,
          `data-video-src="${escapeHtml(urlValue)}"`,
          `data-video-type="${escapeHtml(typeValue)}"`,
        ];

        if (titleValue) {
          const escapedTitle = escapeHtml(titleValue);
          attributes.push(`data-video-title="${escapedTitle}"`);
          attributes.push(`aria-label="${escapedTitle}"`);
        }

        if (posterValue) {
          const escapedPoster = escapeHtml(posterValue);
          attributes.push(`data-video-poster="${escapedPoster}"`);
          attributes.push(`poster="${escapedPoster}"`);
        }

        return `<video ${attributes.join(" ")}>
  <source src="${escapeHtml(urlValue)}" type="${escapeHtml(typeValue)}" />
</video>`;
      }
      const uploadConverter = defaultConverters.upload;
      if (typeof uploadConverter === "function") {
        return uploadConverter(args);
      }
      return uploadConverter ?? "";
    },
    relationship: async (args) => {
      const node = args.node as SerializedRelationshipNode;
      const relatedDoc = await resolveRelationshipDoc({
        node,
        categoryCache,
        docCache,
        payload,
      });
      if (!relatedDoc) {
        return "";
      }

      const title = relatedDoc.title ?? "Related document";
      const description = relatedDoc.description ?? "";
      const href = await resolveDocHref({
        doc: relatedDoc,
        docCache,
        categoryCache,
        payload,
      });
      const body = `<article class="lexical-relationship-card !mt-2 rounded-lg border border-border bg-card p-2 shadow-sm">
  <p class="text-sm font-semibold text-primary">${escapeHtml(title)}</p>
  ${description ? `<p class="text-sm text-muted-foreground">${escapeHtml(description)}</p>` : ""}
</article>`;
      return href
        ? `<a href="${href}" class="block no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">${body}</a>`
        : body;
    },
    link: async (args) => {
      const { node } = args;
      const url =
        typeof node.fields?.url === "string" ? node.fields.url : "";

      // Check if the URL is a Vimeo link
      const vimeoId = extractVimeoId(url);
      if (vimeoId) {
        // Parse video ID and hash (if present)
        const [videoId, hash] = vimeoId.split("/");
        const embedUrl = hash
          ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
          : `https://player.vimeo.com/video/${videoId}`;

        // Create a special marker for Vimeo embeds
        return `<div class="vimeo-embed-container" data-vimeo-id="${escapeHtml(videoId)}" data-vimeo-hash="${hash ? escapeHtml(hash) : ""}" data-vimeo-embed-url="${escapeHtml(embedUrl)}"></div>`;
      }

      // Default link rendering
      const linkConverter = defaultConverters.link;
      if (typeof linkConverter === "function") {
        return await linkConverter(args);
      }
      return linkConverter ?? "";
    },
  });
}

const headingClasses: Record<string, string> = {
  h1: "md:text-5xl text-4xl font-serif font-bold",
  h2: "md:text-4xl text-3xl font-serif font-bold",
  h3: "md:text-3xl text-2xl font-serif font-light text-primary dark:text-accent",
  h4: "md:text-2xl text-xl font-serif font-bold",
  h5: "md:text-xl text-lg font-serif font-light",
  h6: "md:text-lg text-base font-serif font-bold",
};

async function resolveRelationshipDoc({
  node,
  docCache,
  categoryCache,
  payload,
}: {
  node: SerializedRelationshipNode;
  docCache: Map<string, Doc>;
  categoryCache: Map<string, Category>;
  payload: Payload;
}): Promise<Doc | undefined> {
  if (node.relationTo !== "docs") {
    return;
  }

  const rawValue = node.value;

  if (isDoc(rawValue)) {
    return rawValue;
  }

  if (rawValue === null || rawValue === undefined) {
    return;
  }

  const docId = String(rawValue);
  if (docCache.has(docId)) {
    return docCache.get(docId);
  }

  const fetched = (await payload.findByID({
    collection: "docs",
    depth: 2,
    id: docId,
  })) as Doc;

  docCache.set(docId, fetched);
  if (
    typeof fetched.category === "string" &&
    !categoryCache.has(fetched.category)
  ) {
    const category = (await payload.findByID({
      collection: "categories",
      depth: 0,
      id: fetched.category,
    })) as Category;
    categoryCache.set(fetched.category, category);
  }

  return fetched;
}

async function resolveDocHref({
  doc,
  docCache,
  categoryCache,
  payload,
}: {
  doc: Doc;
  docCache: Map<string, Doc>;
  categoryCache: Map<string, Category>;
  payload: Payload;
}): Promise<string | undefined> {
  const categorySlug = await resolveCategorySlug({
    category: doc.category,
    categoryCache,
    payload,
  });

  if (!categorySlug) {
    return;
  }

  const segments: string[] = [];
  const visited = new Set<string>();

  let current: Doc | undefined = doc;

  while (current) {
    if (current.slug) {
      segments.unshift(current.slug);
    }

    const parent: Doc | string | number | null | undefined = current.parent;
    if (!parent) {
      break;
    }

    if (isDoc(parent)) {
      current = parent;
      continue;
    }

    const parentId = String(parent);
    if (visited.has(parentId)) {
      break;
    }
    visited.add(parentId);

    const cachedParent = docCache.get(parentId);
    if (cachedParent) {
      current = cachedParent;
      continue;
    }

    const fetchedParent = (await payload.findByID({
      collection: "docs",
      depth: 1,
      id: parentId,
    })) as Doc;
    docCache.set(parentId, fetchedParent);
    current = fetchedParent;
  }

  const normalizedSegments = segments.filter(Boolean);
  if (
    normalizedSegments.length > 0 &&
    normalizedSegments[normalizedSegments.length - 1] === "index"
  ) {
    normalizedSegments.pop();
  }

  const path = normalizedSegments.join("/");
  return path ? `/docs/${categorySlug}/${path}` : `/docs/${categorySlug}`;
}

async function resolveCategorySlug({
  category,
  categoryCache,
  payload,
}: {
  category: Doc["category"];
  categoryCache: Map<string, Category>;
  payload: Payload;
}): Promise<string | undefined> {
  if (!category) {
    return;
  }

  if (isCategory(category)) {
    return category.slug;
  }

  const categoryId = String(category);
  if (categoryCache.has(categoryId)) {
    return categoryCache.get(categoryId)?.slug;
  }

  const fetched = (await payload.findByID({
    collection: "categories",
    depth: 0,
    id: categoryId,
  })) as Category;
  categoryCache.set(categoryId, fetched);
  return fetched.slug;
}

function isDoc(value: unknown): value is Doc {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in (value as Record<string, unknown>)
  );
}

function isCategory(value: unknown): value is Category {
  return Boolean(
    value &&
      typeof value === "object" &&
      "slug" in (value as Record<string, unknown>)
  );
}
