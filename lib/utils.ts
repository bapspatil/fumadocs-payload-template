import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-/]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|\/-/g, (value) => (value === "/-" ? "/" : ""));
}

export const slugPattern =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

export function validateSlug(value: unknown): true | string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Slug is required";
  }

  if (!slugPattern.test(value)) {
    return "Use lowercase letters, numbers, hyphens, and optional '/' separators";
  }

  return true;
}

type DocNode = {
  slug?: string | null | undefined;
  parent?: unknown;
};

const isDocNode = (value: unknown): value is DocNode =>
  value !== null && typeof value === "object";

export function buildDocPath(doc: DocNode, byId: Map<string, unknown>): string {
  const segments: string[] = [];
  let current: DocNode | null | undefined = doc;
  while (current) {
    // Include all slugs, including "index"
    if (current.slug) {
      segments.unshift(String(current.slug));
    }
    const parent = current.parent;
    if (
      parent &&
      typeof parent === "object" &&
      "id" in (parent as Record<string, unknown>) &&
      (parent as Record<string, unknown>).id != null
    ) {
      const next = byId.get(String((parent as Record<string, unknown>).id));
      current = isDocNode(next) ? next : null;
    } else if (typeof parent === "string" || typeof parent === "number") {
      const next = byId.get(String(parent));
      current = isDocNode(next) ? next : null;
    } else {
      current = null;
    }
  }
  return segments.join("/");
}
