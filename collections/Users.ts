import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "name",
  },
  auth: true,
  access: {
    // Only owner and admins can access the admin panel
    admin: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
    // All authenticated users can read user data
    read: ({ req: { user } }) => {
      return Boolean(user);
    },
    // Owner can create any user, admins can only create normal users
    create: ({ req: { user } }) => {
      // Owner can create any user
      if (user?.role === "owner") {
        return true;
      }
      // Admins can create users (but hooks will ensure they can only create normal users)
      if (user?.role === "admin") {
        return true;
      }
      return false;
    },
    // Owner can update any user, admins can update normal users, users can update themselves
    update: ({ req: { user }, id }) => {
      // Owner can update anyone
      if (user?.role === "owner") {
        return true;
      }
      // Admins can update users, but not other admins or owners (enforced by query constraint)
      if (user?.role === "admin") {
        // Return a query constraint to only allow updating normal users
        return {
          role: {
            equals: "user",
          },
        };
      }
      // Normal users can only update themselves (non-role fields)
      return user?.id === id;
    },
    // Owner can delete any user except themselves, admins cannot delete
    delete: ({ req: { user }, id }) => {
      // Owner can delete anyone except themselves
      if (user?.role === "owner") {
        return user.id !== id;
      }
      return false;
    },
  },
  hooks: {
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
            currentUser?.role === "admin" &&
            data?.role &&
            data.role !== "user"
          ) {
            throw new Error("Admins can only create users with 'user' role");
          }
        }
      },
    ],
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
                title: "Getting Started",
                slug: "getting-started",
                description: "Learn how to use this documentation system",
                order: 1,
              },
            });

            // Create welcome doc
            await payload.create({
              collection: "docs",
              data: {
                title: "Welcome",
                slug: "welcome",
                description:
                  "Welcome to your new documentation system powered by Payload CMS and Fumadocs",
                category: category.id,
                order: 1,
                content: {
                  root: {
                    type: "root",
                    format: "",
                    indent: 0,
                    version: 1,
                    direction: "ltr",
                    children: [
                      {
                        type: "heading",
                        tag: "h2",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Welcome to Your Documentation System",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Congratulations! You've successfully set up your documentation system. This template combines the power of Payload CMS for content management with Fumadocs for beautiful documentation rendering.",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "What You Can Do",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Create and organize documentation in categories",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Manage user roles and permissions (Owner, Admin, User)",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Upload and manage media files (images, videos)",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Use the powerful Lexical rich text editor",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Next Steps",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Read through the Getting Started guide to learn how to use all the features of this system. Start by understanding the role-based access control system, then move on to creating your first category and documentation.",
                            version: 1,
                          },
                        ],
                      },
                    ],
                  },
                },
                _status: "published",
              },
            });

            // Create Understanding Roles doc
            await payload.create({
              collection: "docs",
              data: {
                title: "Understanding Roles",
                slug: "understanding-roles",
                description:
                  "Learn about the different user roles and their permissions",
                category: category.id,
                order: 2,
                content: {
                  root: {
                    type: "root",
                    format: "",
                    indent: 0,
                    version: 1,
                    direction: "ltr",
                    children: [
                      {
                        type: "heading",
                        tag: "h2",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Role-Based Access Control",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "This system uses three distinct roles to manage access and permissions:",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Owner",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "You are the Owner! As the first user, you have full system access including:",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Create, update, and delete all content",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Manage users with any role (Owner, Admin, User)",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Full access to the admin panel",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Admin",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Admins can manage content and create normal users. They can:",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Create and edit documentation, categories, and media",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Create users (but only with 'User' role)",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Access the admin panel",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "User",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Regular users have read-only access. They can:",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "View all published documentation",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Update their own profile information",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
                _status: "published",
              },
            });

            // Create Managing Content doc
            await payload.create({
              collection: "docs",
              data: {
                title: "Managing Content",
                slug: "managing-content",
                description: "Learn how to create and organize your documentation",
                category: category.id,
                order: 3,
                content: {
                  root: {
                    type: "root",
                    format: "",
                    indent: 0,
                    version: 1,
                    direction: "ltr",
                    children: [
                      {
                        type: "heading",
                        tag: "h2",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Creating Categories",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Categories are the main organizational structure for your documentation. Each category appears as a tab in the sidebar.",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "number",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Navigate to Collections > Categories in the admin panel",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Click 'Create New'",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Fill in the title, slug, and description",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Set the order number (lower numbers appear first)",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h2",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Creating Documentation Pages",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Once you have categories, you can create documentation pages:",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "number",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Navigate to Collections > Docs in the admin panel",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Click 'Create New'",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Fill in the title, slug, and description",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Select a category from the sidebar",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Write your content using the Lexical editor",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Set the order number to control position in the sidebar",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h2",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Nested Documentation",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "You can create nested documentation by selecting a parent page in the sidebar when creating a new doc. This creates a hierarchy in your documentation structure.",
                            version: 1,
                          },
                        ],
                      },
                    ],
                  },
                },
                _status: "published",
              },
            });

            // Create Using the Editor doc
            await payload.create({
              collection: "docs",
              data: {
                title: "Using the Editor",
                slug: "using-the-editor",
                description:
                  "Learn how to use the Lexical rich text editor for creating content",
                category: category.id,
                order: 4,
                content: {
                  root: {
                    type: "root",
                    format: "",
                    indent: 0,
                    version: 1,
                    direction: "ltr",
                    children: [
                      {
                        type: "heading",
                        tag: "h2",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "The Lexical Editor",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "This system uses the Lexical rich text editor, a powerful and modern editor for creating documentation. Here are the main features:",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Text Formatting",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Bold, italic, underline, and strikethrough",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Headings (H1 through H6)",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Code blocks and inline code",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Lists and Structure",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Bullet lists",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Numbered lists",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Block quotes",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Media",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "paragraph",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "You can embed images and videos directly in your content. Upload media files first through the Media collection, then insert them into your documentation.",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "heading",
                        tag: "h3",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "text",
                            text: "Tips",
                            version: 1,
                          },
                        ],
                      },
                      {
                        type: "list",
                        listType: "bullet",
                        version: 1,
                        indent: 0,
                        children: [
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Use headings to structure your content (helps with table of contents)",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Save drafts regularly using the autosave feature",
                                version: 1,
                              },
                            ],
                          },
                          {
                            type: "listitem",
                            version: 1,
                            indent: 0,
                            children: [
                              {
                                type: "text",
                                text: "Use the 'Publish' button when ready to make content live",
                                version: 1,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
                _status: "published",
              },
            });

            console.log(
              "✅ Getting Started category and documentation created successfully!"
            );
          }
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
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
      access: {
        // Only owner can modify roles
        create: ({ req: { user } }) => {
          return user?.role === "owner";
        },
        update: ({ req: { user } }) => {
          return user?.role === "owner";
        },
        // Everyone can read roles
        read: () => true,
      },
      admin: {
        // Show role field only for owners
        // Hidden on create-first-user page and for admins
        condition: (_data, _siblingData, { user }) => {
          // Show field only if the current user is an owner
          return user?.role === "owner";
        },
        description:
          "Owner: Full system access. Admin: Can create users and content. User: Read-only access. Admins will automatically create users with 'user' role.",
      },
    },
  ],
};
