import path from "node:path";
import { fileURLToPath } from "node:url";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { importExportPlugin } from "@payloadcms/plugin-import-export";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { searchPlugin } from "@payloadcms/plugin-search";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig, databaseKVAdapter } from "payload";
import sharp from "sharp";
import { Categories } from "./collections/Categories";
import { Docs } from "./collections/Docs";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { getDocPreviewUrl } from "./lib/preview-url";
import "dotenv/config";

const filenameToPath = fileURLToPath(import.meta.url);
const dirname = path.dirname(filenameToPath);
const useDatabaseTls =
  process.env.PAYLOAD_DATABASE_TLS === "true" ||
  Boolean(process.env.PAYLOAD_DATABASE_CA_FILE);

export default buildConfig({
  admin: {
    components: {
      afterNavLinks: ["@/components/home-nav-link#HomeNavLink"],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      collections: ["docs"],
      url: ({ data, collectionConfig }) => {
        if (collectionConfig?.slug === "docs") {
          return getDocPreviewUrl(data);
        }

        return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      },
    },
    meta: {
      defaultOGImageType: "dynamic",
      description:
        "Admin panel for documentation - Manage your documentation and content.",
      icons: [
        {
          rel: "icon",
          type: "image/x-icon",
          url: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          type: "image/x-icon",
          url: "/favicon.ico",
        },
      ],
      robots: "noindex, nofollow",
      titleSuffix: " | Payload CMS Admin",
    },
    theme: "light",
  },
  collections: [Users, Media, Categories, Docs],
  cors: {
    origins: [process.env.NEXT_PUBLIC_APP_URL as string],
  },
  csrf: [process.env.NEXT_PUBLIC_APP_URL as string],
  db: mongooseAdapter({
    url: process.env.PAYLOAD_DATABASE_URI || "",
    ...(useDatabaseTls
      ? {
          connectOptions: {
            ca: process.env.PAYLOAD_DATABASE_CA_FILE || undefined,
            cert: process.env.PAYLOAD_DATABASE_CERT_FILE || undefined,
            key: process.env.PAYLOAD_DATABASE_KEY_FILE || undefined,
            ssl: true,
            tls: true,
          },
        }
      : {}),
  }),
  editor: lexicalEditor(),
  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: "noreply@example.com",
          defaultFromName: "Documentation",
          transportOptions: {
            auth: {
              pass: process.env.SMTP_PASS,
              user: process.env.SMTP_USER,
            },
            host: process.env.SMTP_HOST,
            port: 587,
          },
        }),
      }
    : {}),
  graphQL: {
    disable: false,
  },
  kv: databaseKVAdapter(),
  plugins: [
    importExportPlugin({
      collections: [
        {
          export: { disableJobsQueue: true },
          import: { disableJobsQueue: true },
          slug: "docs",
        },
        {
          export: { disableJobsQueue: true },
          import: { disableJobsQueue: true },
          slug: "categories",
        },
      ],
    }),
    mcpPlugin({
      collections: {
        categories: {
          description:
            "Documentation categories that become isolated Fumadocs sidebar tabs.",
          enabled: { create: false, delete: false, find: true, update: false },
        },
        docs: {
          description:
            "Published documentation pages with Lexical rich text, category, parent, and order fields.",
          enabled: true,
        },
      },
      mcp: {
        serverOptions: {
          instructions:
            "This MCP server exposes a Fumadocs + Payload CMS documentation site. Prefer find on docs and categories. Doc content is Lexical JSON; public pages live at /docs/{category}/{...slug}. Markdown is available at the same path with a .md suffix, plus /llms.txt and /llms-full.txt.",
          serverInfo: {
            name: "FumaPayload Docs",
            version: "1.4.0",
          },
        },
      },
    }),
    searchPlugin({
      beforeSync: ({ originalDoc, searchDoc }) => ({
        ...searchDoc,
        description:
          typeof originalDoc.description === "string"
            ? originalDoc.description
            : "",
      }),
      collections: ["docs"],
      defaultPriorities: {
        docs: 10,
      },
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            admin: {
              position: "sidebar",
            },
            name: "description",
            type: "textarea",
          },
        ],
      },
    }),
    s3Storage({
      bucket: process.env.S3_BUCKET || "",
      clientUploads: true,
      collections: {
        media: {
          signedDownloads: {
            shouldUseSignedURL: ({ filename }) =>
              filename.endsWith(".mp4") ||
              filename.endsWith(".webm") ||
              filename.endsWith(".mov") ||
              filename.endsWith(".mkv") ||
              filename.endsWith(".avi"),
          },
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
        endpoint: process.env.S3_ENDPOINT || "",
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
        region: process.env.S3_REGION || "",
      },
      enabled:
        process.env.S3_ENABLED !== "false" && Boolean(process.env.S3_BUCKET),
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
