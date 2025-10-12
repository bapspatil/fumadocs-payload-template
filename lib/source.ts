import {
	loader,
	type MetaData,
	type Source,
	type VirtualFile,
} from "fumadocs-core/source";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { StructuredData } from "fumadocs-core/mdx-plugins";
import { extractTableOfContents } from "./lexical-serializer";
import { buildDocPath } from "./utils";
import { cache } from "react";

// Create a cached function to get the source
// React cache ensures this is called once per request
export const getSource = cache(async () => {
	const payloadSource = await createPayloadSource();
	return loader({
		baseUrl: "/docs",
		source: payloadSource,
	});
});

// For backward compatibility, export a source object that delegates to getSource
export const source = {
	async getPage(slugs?: string[]) {
		const src = await getSource();
		return src.getPage(slugs);
	},
	async getPages() {
		const src = await getSource();
		return src.getPages();
	},
	async generateParams() {
		const src = await getSource();
		return src.generateParams();
	},
};

async function createPayloadSource(): Promise<
	Source<{
		metaData: MetaData;
		pageData: any;
	}>
> {
	const payload = await getPayload({ config });

	// Fetch all categories
	const { docs: categories } = await payload.find({
		collection: "categories",
		limit: 1000,
		pagination: false,
		sort: "order",
		depth: 2,
	});

	const files: VirtualFile[] = [];

	// Process each category
	for (const category of categories) {
		// Fetch all docs in this category
		const { docs: categoryDocs } = await payload.find({
			collection: "docs",
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
			limit: 1000,
			pagination: false,
			sort: "order",
			depth: 2,
		});

		// Build a map of doc IDs for path resolution
		const byId = new Map<string, any>();
		for (const doc of categoryDocs) {
			byId.set(String(doc.id), doc);
		}

		// Build pages array for ordered display (top-level docs only)
		const pagesOrder: string[] = [];

		// Transform each doc into a VirtualFile
		for (const doc of categoryDocs) {
			const docPath = buildDocPath(doc, byId);
			const slugs = docPath ? docPath.split("/") : [];

			// Build the full path including category
			const fullPath =
				slugs.length > 0
					? `${category.slug}/${slugs.join("/")}`
					: category.slug;

			// Add to pages order only if it's a top-level doc (no parent or parent is in different category)
			const isTopLevel = !doc.parent || typeof doc.parent !== "object";
			if (isTopLevel) {
				pagesOrder.push(doc.slug);
			}

			files.push({
				path: fullPath,
				slugs: [category.slug, ...slugs],
				data: {
					...doc,
					description: doc.description || undefined,
					get structuredData() {
						return getStructuredData(doc);
					},
				} as any,
				type: "page",
			});
		}

		// Add a meta file for the category to mark it as a root folder with pages order
		files.push({
			path: `${category.slug}/meta`,
			data: {
				title: category.title,
				description: category.description || undefined,
				root: true,
				pages: pagesOrder,
			} as any,
			type: "meta",
		});
	}

	return {
		files,
	};
}

function getStructuredData(doc: any): StructuredData {
	// Extract table of contents from Lexical content
	const toc = extractTableOfContents(doc.content);

	return {
		headings: toc.map((item: any) => ({
			content: item.title,
			id: item.url,
		})),
		contents: [
			{
				content: doc.description || "",
				heading: undefined,
			},
		],
	};
}
