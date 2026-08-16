/** biome-ignore-all lint/suspicious/noExplicitAny: CollectionConfig requires any */

import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { getDocPreviewUrl } from "@/lib/preview-url";
import { validateSlug } from "@/lib/utils";

export const Docs: CollectionConfig = {
  access: {
    // Owner and admins can create docs
    create: ({ req: { user } }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      return user.role === "owner" || user.role === "admin";
    },
    // Owner can always delete; admins can soft-delete (trash) but not permanently delete
    delete: ({ req: { user }, data }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      if (user.role === "owner") {
        return true;
      }
      if (user.role === "admin") {
        return Boolean(data?.deletedAt);
      }
      return false;
    },
    // Public read access for documentation
    read: () => true,
    // Owner and admins can update docs
    update: ({ req: { user } }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      return user.role === "owner" || user.role === "admin";
    },
  },
  admin: {
    defaultColumns: ["title", "category", "slug", "order", "parent"],
    livePreview: {
      url: ({ data }) => getDocPreviewUrl(data),
    },
    useAsTitle: "title",
  },
  enableQueryPresets: true,
  fields: [
    {
      admin: {
        description: "The page title",
      },
      name: "title",
      required: true,
      type: "text",
    },
    {
      admin: {
        description: "URL-friendly identifier for this page",
      },
      name: "slug",
      required: true,
      type: "text",
      validate: validateSlug,
    },
    {
      admin: {
        description: "Brief description or excerpt for this page",
      },
      name: "description",
      type: "textarea",
    },
    {
      admin: {
        description: "The sidebar tab/category this doc belongs to",
        position: "sidebar",
      },
      name: "category",
      relationTo: "categories" as any,
      required: true,
      type: "relationship",
    },
    {
      admin: {
        description: "Parent page for nested documentation structure",
        position: "sidebar",
      },
      filterOptions: ({ id }) => ({
        id: {
          not_equals: id,
        },
      }),
      name: "parent",
      relationTo: "docs" as any,
      type: "relationship",
    },
    {
      admin: {
        description: "Order within the category/parent",
        position: "sidebar",
      },
      defaultValue: 0,
      name: "order",
      required: true,
      type: "number",
    },
    {
      admin: {
        description: "The main content of the documentation page",
      },
      editor: lexicalEditor({}),
      name: "content",
      required: true,
      type: "richText",
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        const { revalidateDocs } = await import("@/lib/revalidate-docs");
        await revalidateDocs();
      },
    ],
    afterDelete: [
      async () => {
        const { revalidateDocs } = await import("@/lib/revalidate-docs");
        await revalidateDocs();
      },
    ],
  },
  slug: "docs",
  versions: {
    drafts: {
      autosave: {
        interval: 120_000, // 2 minutes
        showSaveDraftButton: true,
      },
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 10,
  },
};
