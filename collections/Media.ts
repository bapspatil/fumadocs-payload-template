import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Public read access for media files
    read: () => true,
    // Owner and admins can upload media
    create: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
    // Owner and admins can update media
    update: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
    // Only owner can delete media
    delete: ({ req: { user } }) => {
      return user?.role === "owner";
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
