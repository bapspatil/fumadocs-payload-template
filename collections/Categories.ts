import type { CollectionConfig } from "payload";
import { validateSlug } from "@/lib/utils";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order"],
  },
  access: {
    // Public read access for categories
    read: () => true,
    // Owner and admins can create categories
    create: ({ req: { user } }) => {
      if (!(user && "role" in user)) return false;
      return user.role === "owner" || user.role === "admin";
    },
    // Owner and admins can update categories
    update: ({ req: { user } }) => {
      if (!(user && "role" in user)) return false;
      return user.role === "owner" || user.role === "admin";
    },
    // Owner can always delete; admins can soft-delete (trash) but not permanently delete
    delete: ({ req: { user }, data }) => {
      if (!(user && "role" in user)) return false;
      if (user.role === "owner") return true;
      if (user.role === "admin") return Boolean(data?.deletedAt);
      return false;
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The display title for this category/sidebar tab",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      validate: validateSlug,
      admin: {
        description: "URL-friendly identifier",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Brief description of this documentation category",
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media" as any,
      admin: {
        description: "Icon image for the category",
        position: "sidebar",
      },
      filterOptions: {
        mimeType: { contains: "image" },
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Order in which this category appears in the sidebar",
        position: "sidebar",
      },
    },
  ],
};
