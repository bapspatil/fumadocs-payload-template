import config from "@payload-config";
import type { StructuredData } from "fumadocs-core/mdx-plugins";
import type {
  DynamicSource,
  MetaData,
  VirtualFile,
} from "fumadocs-core/source";
import { dynamicLoader } from "fumadocs-core/source/dynamic";
import { getPayload } from "payload";
import type { Doc } from "@/payload-types";
import { extractTableOfContents } from "./lexical-serializer";
import { extractPlainTextFromLexical } from "./lexical-to-markdown";
import { buildDocPath } from "./utils";

export type PayloadPageData = Omit<Doc, "description"> & {
  categorySlug: string;
  categoryTitle: string;
  description?: string;
  structuredData: StructuredData;
};

export type PayloadMetaData = MetaData & {
  title: string;
  pages: string[];
};

type PayloadSourceConfig = {
  pageData: PayloadPageData;
  metaData: PayloadMetaData;
};

const docsLoader = dynamicLoader(createPayloadSource(), {
  baseUrl: "/docs",
});

export async function getSource() {
  return await docsLoader.get();
}

export function invalidateDocsSource(): void {
  docsLoader.invalidate();
}

export const source = {
  async generateParams() {
    const src = await getSource();
    return src.generateParams();
  },
  async getPage(slugs?: string[]) {
    const src = await getSource();
    return src.getPage(slugs);
  },
  async getPages() {
    const src = await getSource();
    return src.getPages();
  },
};

export function getPageImageUrl(page: { slugs: string[] }): {
  segments: string[];
  url: string;
} {
  const segments = [...page.slugs, "image.png"];
  return {
    segments,
    url: `/docs-og/${segments.join("/")}`,
  };
}

function createPayloadSource(): DynamicSource<PayloadSourceConfig> {
  return {
    files: loadPayloadFiles,
  };
}

async function loadPayloadFiles(): Promise<VirtualFile<PayloadSourceConfig>[]> {
  const payload = await getPayload({ config });
  const { docs: categories } = await payload.find({
    collection: "categories",
    depth: 2,
    limit: 1000,
    pagination: false,
    sort: "order",
  });

  const files: VirtualFile<PayloadSourceConfig>[] = [];

  for (const category of categories) {
    const { docs: categoryDocs } = await payload.find({
      collection: "docs",
      depth: 2,
      limit: 1000,
      pagination: false,
      sort: "order",
      where: {
        and: [
          {
            category: {
              equals: category.id,
            },
          },
          {
            or: [
              {
                _status: {
                  equals: "published",
                },
              },
              {
                _status: {
                  exists: false,
                },
              },
            ],
          },
        ],
      },
    });

    const byId = new Map<string, Doc>();
    for (const doc of categoryDocs) {
      byId.set(String(doc.id), doc);
    }

    const pagesOrder: string[] = [];

    for (const doc of categoryDocs) {
      const docPath = buildDocPath(doc, byId);
      const slugs = docPath ? docPath.split("/") : [];
      const fullPath =
        slugs.length > 0
          ? `${category.slug}/${slugs.join("/")}`
          : category.slug;

      if (doc.parent === null || doc.parent === undefined) {
        pagesOrder.push(doc.slug);
      }

      files.push({
        data: {
          ...doc,
          categorySlug: category.slug,
          categoryTitle: category.title,
          description: doc.description || undefined,
          structuredData: getStructuredData(doc),
        },
        path: fullPath,
        slugs: [category.slug, ...slugs],
        type: "page",
      });
    }

    files.push({
      data: {
        description: category.description || undefined,
        pages: pagesOrder,
        root: true,
        title: category.title,
      },
      path: `${category.slug}/meta`,
      type: "meta",
    });
  }

  return files;
}

function getStructuredData(doc: Doc): StructuredData {
  const toc = extractTableOfContents(doc.content);
  const body = extractPlainTextFromLexical(doc.content);

  return {
    contents: [
      {
        content: doc.description || "",
        heading: undefined,
      },
      {
        content: body,
        heading: doc.title,
      },
    ],
    headings: toc.map((item) => ({
      content: item.title,
      id: item.url.replace(/^#/, ""),
    })),
  };
}
