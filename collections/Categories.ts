import type { CollectionConfig } from "payload";
import { validateSlug } from "@/lib/utils";

export const Categories: CollectionConfig = {
  access: {
    // Owner and admins can create categories
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
    // Public read access for categories
    read: () => true,
    // Owner and admins can update categories
    update: ({ req: { user } }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      return user.role === "owner" || user.role === "admin";
    },
  },
  admin: {
    defaultColumns: ["title", "slug", "order"],
    useAsTitle: "title",
  },
  fields: [
    {
      admin: {
        description: "The display title for this category/sidebar tab",
      },
      name: "title",
      required: true,
      type: "text",
    },
    {
      admin: {
        description: "URL-friendly identifier",
      },
      name: "slug",
      required: true,
      type: "text",
      unique: true,
      validate: validateSlug,
    },
    {
      admin: {
        description: "Brief description of this documentation category",
      },
      name: "description",
      type: "textarea",
    },
    {
      admin: {
        description: "Icon image for the category",
        position: "sidebar",
      },
      filterOptions: {
        mimeType: { contains: "image" },
      },
      name: "icon",
      relationTo: "media" as any,
      type: "upload",
    },
    {
      admin: {
        description: "Order in which this category appears in the sidebar",
        position: "sidebar",
      },
      defaultValue: 0,
      name: "order",
      required: true,
      type: "number",
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
  slug: "categories",
};
