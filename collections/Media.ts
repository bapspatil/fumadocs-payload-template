import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Public read access for media files
    read: () => true,
    // Owner and admins can upload media
    create: ({ req: { user } }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      return user.role === "owner" || user.role === "admin";
    },
    // Owner and admins can update media
    update: ({ req: { user } }) => {
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
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
};
