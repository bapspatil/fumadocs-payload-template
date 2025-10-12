import path from "node:path";
import { fileURLToPath } from "node:url";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { importExportPlugin } from "@payloadcms/plugin-import-export";
import { searchPlugin } from "@payloadcms/plugin-search";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Categories } from "./collections/Categories";
import { Docs } from "./collections/Docs";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import "dotenv/config";

const filenameToPath = fileURLToPath(import.meta.url);
const dirname = path.dirname(filenameToPath);

export default buildConfig({
	admin: {
		importMap: {
			baseDir: path.resolve(dirname),
		},
		meta: {
			titleSuffix: " | Payload CMS Admin",
			description:
				"Admin panel for documentation - Manage your documentation and content.",
			defaultOGImageType: "dynamic",
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
		},
		theme: "light",
		components: {
			afterNavLinks: ["@/components/home-nav-link#HomeNavLink"],
		},
	},
	collections: [Users, Media, Categories, Docs],
	cors: {
		origins: [process.env.NEXT_PUBLIC_APP_URL as string],
	},
	csrf: [process.env.NEXT_PUBLIC_APP_URL as string],
	db: mongooseAdapter({
		url: process.env.PAYLOAD_DATABASE_URI || "",
		// Adjust connection options as needed
		connectOptions: {
			tls: true,
			ssl: true,
			ca: process.env.PAYLOAD_DATABASE_CA_FILE || "",
			cert: process.env.PAYLOAD_DATABASE_CERT_FILE || "",
			key: process.env.PAYLOAD_DATABASE_KEY_FILE || "",
		},
	}),
	editor: lexicalEditor(),
	email: nodemailerAdapter({
		defaultFromAddress: "noreply@example.com",
		defaultFromName: "Documentation",
		// Nodemailer transportOptions
		transportOptions: {
			host: process.env.SMTP_HOST,
			port: 587,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		},
	}),
	graphQL: {
		disable: false,
	},
	plugins: [
		importExportPlugin({
			collections: ["docs", "categories"],
		}),
		searchPlugin({
			collections: ["docs"],
			defaultPriorities: {
				docs: 10,
			},
			searchOverrides: {
				fields: ({ defaultFields }) => [
					...defaultFields,
					{
						name: "description",
						type: "textarea",
						admin: {
							position: "sidebar",
						},
					},
				],
			},
		}),
		s3Storage({
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
			bucket: process.env.S3_BUCKET || "",
			config: {
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
				},
				region: process.env.S3_REGION || "",
				endpoint: process.env.S3_ENDPOINT || "",
				forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
			},
		}),
	],
	secret: process.env.PAYLOAD_SECRET || "",
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
});
