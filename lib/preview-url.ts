type PreviewDoc = {
  id?: string;
  slug?: string;
  parent?: unknown;
  category?: unknown;
};

function getCategorySlug(category: unknown): string | undefined {
  if (
    category &&
    typeof category === "object" &&
    "slug" in category &&
    typeof category.slug === "string"
  ) {
    return category.slug;
  }
}

export function getDocPreviewUrl(data: Record<string, unknown>): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const categorySlug = getCategorySlug(data.category);

  if (!categorySlug) {
    return `${appUrl}/docs`;
  }

  const segments: string[] = [];
  const visited = new Set<string>();
  let current: unknown = data;

  while (current && typeof current === "object") {
    const doc = current as PreviewDoc;
    if (doc.id) {
      const id = String(doc.id);
      if (visited.has(id)) {
        break;
      }
      visited.add(id);
    }

    if (doc.slug) {
      segments.unshift(doc.slug);
    }

    current = doc.parent && typeof doc.parent === "object" ? doc.parent : null;
  }

  const path = segments.join("/");
  return path
    ? `${appUrl}/docs/${categorySlug}/${path}`
    : `${appUrl}/docs/${categorySlug}`;
}
