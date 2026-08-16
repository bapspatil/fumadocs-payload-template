import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  access: {
    // Only owner and admins can access the admin panel
    admin: ({ req: { user } }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      return user.role === "owner" || user.role === "admin";
    },
    // Owner can create any user, admins can only create normal users
    create: ({ req: { user } }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      if (user.role === "owner") {
        return true;
      }
      if (user.role === "admin") {
        return true;
      }
      return false;
    },
    // Owner can delete any user except themselves, admins cannot delete
    delete: ({ req: { user }, id }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      // Owner can delete anyone except themselves
      if (user.role === "owner") {
        return user.id !== id;
      }
      return false;
    },
    // All authenticated users can read user data
    read: ({ req: { user } }) => Boolean(user),
    // Owner can update any user, admins can update normal users, users can update themselves
    update: ({ req: { user }, id }) => {
      if (!(user && "role" in user)) {
        return false;
      }
      // Owner can update anyone
      if (user.role === "owner") {
        return true;
      }
      // Admins can update users, but not other admins or owners (enforced by query constraint)
      if (user.role === "admin") {
        return {
          role: {
            equals: "user",
          },
        };
      }
      // Normal users can only update themselves (non-role fields)
      return user.id === id;
    },
  },
  admin: {
    useAsTitle: "name",
  },
  auth: true,
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
    },
    {
      name: "email",
      required: true,
      type: "email",
      unique: true,
    },
    {
      access: {
        // Only owner can modify roles
        create: ({ req: { user } }) =>
          Boolean(user && "role" in user && user.role === "owner"),
        // Everyone can read roles
        read: () => true,
        update: ({ req: { user } }) =>
          Boolean(user && "role" in user && user.role === "owner"),
      },
      admin: {
        // Show role field only for owners
        // Hidden on create-first-user page and for admins
        condition: (_data, _siblingData, { user }) => {
          // Show field only if the current user is an owner
          return Boolean(user && "role" in user && user.role === "owner");
        },
        description:
          "Owner: Full system access. Admin: Can create users and content. User: Read-only access. Admins will automatically create users with 'user' role.",
      },
      defaultValue: "user",
      name: "role",
      options: [
        {
          label: "Owner",
          value: "owner",
        },
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
      required: true,
      type: "select",
    },
  ],
  hooks: {
    afterOperation: [
      async ({ args, operation, result }) => {
        // Create Getting Started content when first user is created
        if (operation === "create" && args.req && result) {
          const payload = args.req.payload;

          // Check if this is the first user
          const { totalDocs } = await payload.count({
            collection: "users",
          });

          if (totalDocs === 1) {
            // Create Getting Started category
            const category = await payload.create({
              collection: "categories",
              data: {
                description: "Learn how to use this documentation system",
                order: 1,
                slug: "getting-started",
                title: "Getting Started",
              },
            });

            // Create welcome doc
            await payload.create({
              collection: "docs",
              data: {
                _status: "published",
                category: category.id,
                content: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            text: "Welcome to Your Documentation System",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h2",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Congratulations! You've successfully set up your documentation system. This template combines the power of Payload CMS for content management with Fumadocs for beautiful documentation rendering.",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "What You Can Do",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Create and organize documentation in categories",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Manage user roles and permissions (Owner, Admin, User)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Upload and manage media files (images, videos)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Use the powerful Lexical rich text editor",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Next Steps",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Read through the Getting Started guide to learn how to use all the features of this system. Start by understanding the role-based access control system, then move on to creating your first category and documentation.",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1,
                  },
                },
                description:
                  "Welcome to your new documentation system powered by Payload CMS and Fumadocs",
                order: 1,
                slug: "welcome",
                title: "Welcome",
              },
            });

            // Create Understanding Roles doc
            await payload.create({
              collection: "docs",
              data: {
                _status: "published",
                category: category.id,
                content: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            text: "Role-Based Access Control",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h2",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "This system uses three distinct roles to manage access and permissions:",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Owner",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "You are the Owner! As the first user, you have full system access including:",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Create, update, and delete all content",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Manage users with any role (Owner, Admin, User)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Full access to the admin panel",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Admin",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Admins can manage content and create normal users. They can:",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Create and edit documentation, categories, and media",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Create users (but only with 'User' role)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Access the admin panel",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "User",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Regular users have read-only access. They can:",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "View all published documentation",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Update their own profile information",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1,
                  },
                },
                description:
                  "Learn about the different user roles and their permissions",
                order: 2,
                slug: "understanding-roles",
                title: "Understanding Roles",
              },
            });

            // Create Managing Content doc
            await payload.create({
              collection: "docs",
              data: {
                _status: "published",
                category: category.id,
                content: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            text: "Creating Categories",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h2",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Categories are the main organizational structure for your documentation. Each category appears as a tab in the sidebar.",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Navigate to Collections > Categories in the admin panel",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Click 'Create New'",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Fill in the title, slug, and description",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Set the order number (lower numbers appear first)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "number",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Creating Documentation Pages",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h2",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Once you have categories, you can create documentation pages:",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Navigate to Collections > Docs in the admin panel",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Click 'Create New'",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Fill in the title, slug, and description",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Select a category from the sidebar",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Write your content using the Lexical editor",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Set the order number to control position in the sidebar",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "number",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Nested Documentation",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h2",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "You can create nested documentation by selecting a parent page in the sidebar when creating a new doc. This creates a hierarchy in your documentation structure.",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1,
                  },
                },
                description:
                  "Learn how to create and organize your documentation",
                order: 3,
                slug: "managing-content",
                title: "Managing Content",
              },
            });

            // Create Using the Editor doc
            await payload.create({
              collection: "docs",
              data: {
                _status: "published",
                category: category.id,
                content: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            text: "The Lexical Editor",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h2",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "This system uses the Lexical rich text editor, a powerful and modern editor for creating documentation. Here are the main features:",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Text Formatting",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Bold, italic, underline, and strikethrough",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Headings (H1 through H6)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Code blocks and inline code",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Lists and Structure",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Bullet lists",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Numbered lists",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Block quotes",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Media",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "You can embed images and videos directly in your content. Upload media files first through the Media collection, then insert them into your documentation.",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            text: "Tips",
                            type: "text",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        tag: "h3",
                        type: "heading",
                        version: 1,
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                text: "Use headings to structure your content (helps with table of contents)",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Save drafts regularly using the autosave feature",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                          {
                            children: [
                              {
                                text: "Use the 'Publish' button when ready to make content live",
                                type: "text",
                                version: 1,
                              },
                            ],
                            indent: 0,
                            type: "listitem",
                            version: 1,
                          },
                        ],
                        indent: 0,
                        listType: "bullet",
                        type: "list",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1,
                  },
                },
                description:
                  "Learn how to use the Lexical rich text editor for creating content",
                order: 4,
                slug: "using-the-editor",
                title: "Using the Editor",
              },
            });

            console.log(
              "✅ Getting Started category and documentation created successfully!"
            );
          }
        }
      },
    ],
    beforeOperation: [
      async ({ args, operation }) => {
        // Make the first user an owner
        if (operation === "create" && args.req) {
          const { data } = args;
          const payload = args.req.payload;

          // Check if there are any users in the database
          const { totalDocs } = await payload.count({
            collection: "users",
          });

          // If this is the first user, make them owner
          if (totalDocs === 0 && data) {
            data.role = "owner";
          } else if (data && !data.role) {
            // Default new users to 'user' role
            data.role = "user";
          }

          // If an admin is trying to create a user, prevent them from creating admins or owners
          const currentUser = args.req.user;
          if (
            currentUser &&
            "role" in currentUser &&
            currentUser.role === "admin" &&
            data?.role &&
            data.role !== "user"
          ) {
            throw new Error("Admins can only create users with 'user' role");
          }
        }
      },
    ],
  },
  slug: "users",
};
