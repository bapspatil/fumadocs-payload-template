# Fumadocs x Payload CMS Template

This example demonstrates how to integrate [Payload CMS](https://payloadcms.com) with [Fumadocs](https://fumadocs.dev/) for content management. It showcases a complete documentation site powered by Payload CMS with a custom Fumadocs source adapter.

[Demo Video](https://github.com/bapspatil/fumadocs-payload-template/raw/refs/heads/main/public/demo.mp4)

## What's Included

- **Payload CMS 3.88**: Headless CMS backend for documentation, with live preview
- **Fumadocs 16.14**: Docs UI, ZBSearch, LLM routes, and Open Graph images
- **Dynamic source adapter**: Payload collections are loaded through Fumadocs `dynamicLoader()`
- **Role-Based Access Control (RBAC)**: Owner, Admin, and User roles
- **Sidebar Tabs**: Each category becomes an isolated sidebar tab
- **Hierarchical Docs**: Parent/child relationships for nested documentation
- **Lexical Editor**: Rich text editing with HTML serialization
- **MongoDB Storage**: Persistent database storage with KV adapter support
- **S3 Media**: Optional S3-compatible media storage
- **Search**: Public docs search via Fumadocs (ZBSearch) plus Payload admin search
- **MCP Support**: Model Context Protocol tools for docs and categories
- **LLM Routes**: `/llms.txt`, `/llms-full.txt`, and `/docs/...md` markdown
- **OG Images**: Dynamic OpenGraph images via `fumadocs-ui/og`
- **Import / Export**: CSV/JSON import-export for docs and categories (runs synchronously)

## Project Structure

```
fumadocs-payload-template/
├── app/
│   ├── (fumadocs)/                 # Public documentation routes
│   │   ├── (home)/                 # Landing page with category cards
│   │   ├── docs/                   # Documentation pages
│   │   │   ├── [[...slug]]/        # Dynamic doc pages
│   │   │   └── layout.tsx          # Docs layout with sidebar tabs
│   │   ├── api/search/             # Fumadocs search API
│   │   ├── docs-og/                # OpenGraph image generation
│   │   ├── llms.txt/               # LLM-friendly content index
│   │   ├── llms-full.txt/          # Full LLM content dump
│   │   └── llms.mdx/docs/          # Per-page markdown for AI agents
│   └── (payload)/                  # Payload admin (protected)
├── collections/
│   ├── Categories.ts               # Doc categories
│   ├── Docs.ts                     # Documentation pages
│   └── Media.ts                    # File uploads
├── components/
│   └── ui/                         # UI components
├── lib/
│   ├── source.ts                   # Fumadocs dynamic source adapter
│   ├── theme-script.ts             # Blocking theme init (React 19 / next-themes)
│   ├── lexical-serializer.ts       # Lexical to HTML converter
│   ├── lexical-to-markdown.ts      # Lexical to Markdown converter
│   └── utils.ts                    # Helper functions
├── proxy.ts                        # Accept: text/markdown negotiation
└── payload.config.ts               # Payload CMS config
```

## Getting Started

### Prerequisites

- Node.js 20.9+
- [Bun](https://bun.sh) (or pnpm)
- MongoDB (local or hosted like MongoDB Atlas)
- S3-compatible storage (optional, for media)

### Installation

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

   **Required variables**:
   ```env
   # Payload Core
   PAYLOAD_SECRET=your-secret-key-here
   PAYLOAD_DATABASE_URI=mongodb://localhost:27017/payload-cms

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Optional S3 storage**:
   ```env
   S3_ENABLED=true
   S3_BUCKET=your-bucket
   S3_REGION=us-east-1
   S3_ACCESS_KEY_ID=your-key
   S3_SECRET_ACCESS_KEY=your-secret
   S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
   ```

   Leave `S3_BUCKET` empty for local uploads.

   **Optional email** (only configured when `SMTP_HOST` is set):
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_USER=your-smtp-user
   SMTP_PASS=your-smtp-password
   ```

   **Optional MongoDB TLS** (custom CA/client certificates). Typical Atlas `mongodb+srv://` URIs already use TLS and do not need these:
   ```env
   PAYLOAD_DATABASE_TLS=true
   PAYLOAD_DATABASE_CA_FILE=
   PAYLOAD_DATABASE_CERT_FILE=
   PAYLOAD_DATABASE_KEY_FILE=
   ```

3. **Start development**:
   ```bash
   bun run dev
   ```

   The dev script uses `--no-server-fast-refresh`, which Payload requires on Next.js 16.2+.

4. **Access the app**:
   - **Public Docs**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

   First time? You'll be prompted to create an admin user.

## Collections

### Categories
Organize documentation into sections:
- `title`: Category name
- `slug`: URL identifier (e.g., "getting-started")
- `description`: Brief description
- `icon`: Optional icon image
- `order`: Display order (ascending)

### Docs
Documentation pages:
- `title`: Page title
- `slug`: URL-friendly slug
- `description`: Page excerpt/description
- `content`: Rich content (Lexical editor)
- `category`: Belongs to which category
- `parent`: Optional parent doc (for nesting)
- `order`: Sort order within category (ascending)
- `_status`: Draft or Published
- **Live Preview**: Opens the public docs URL while editing
- **MCP Enabled**: Exposed through Model Context Protocol for AI access

### Media
File uploads:
- `alt`: Alt text for images
- Stored in S3 or local filesystem
- Automatic optimization

## How It Works

### Dynamic Source Adapter

The heart of this example is `lib/source.ts` — a Fumadocs [dynamic source](https://www.fumadocs.dev/docs/headless/source-api/source) consumed by `dynamicLoader()`:

```typescript
import { dynamicLoader } from "fumadocs-core/source/dynamic";

const docsLoader = dynamicLoader(createPayloadSource(), {
  baseUrl: "/docs",
});

export async function getSource() {
  return docsLoader.get();
}
```

**What it does**:
1. Fetches categories and published docs from Payload
2. Transforms Payload data into Fumadocs virtual files
3. Builds hierarchical paths (e.g., `/docs/category/parent/child`)
4. Creates meta files for sidebar tabs and ordering
5. Provides standard Fumadocs APIs (`getPage`, `getPages`, `getPageTree`)
6. Invalidates on Payload `afterChange` / `afterDelete` hooks

**In your routes**:
```typescript
const source = await getSource();
const page = source.getPage(slugs);
const tree = source.getPageTree();
```

### Sidebar Tabs

Each category becomes an isolated sidebar tab:

1. **Meta files** with `root: true` mark categories as root folders
2. **Pages array** defines document order (preserves Payload `order` field)
3. **Auto-detection** by Fumadocs creates the tab interface

When viewing a doc, only that category's docs appear in the sidebar.

### Content Flow

```
Payload CMS (Lexical)
       ↓
Dynamic Source Adapter
       ↓
Virtual files (Fumadocs format)
       ↓
Lexical Serializer (HTML) or Markdown extractor
       ↓
Rendered page / LLM routes / search
```

## Usage Guide

### Creating Content

1. **Add a Category** (Admin → Categories):
   - Set title, slug, and order
   - Upload an icon (optional)

2. **Create Docs** (Admin → Docs):
   - Assign to a category
   - Set order for positioning
   - Use parent field for nesting
   - Write content in Lexical editor
   - Use **Live Preview** to see the public page while editing

3. **Publish**:
   - Change status to "Published"
   - Content is revalidated immediately via collection hooks

### Hierarchical Documentation

To create nested docs:
1. Create parent doc (leave `parent` empty)
2. Create child doc, set `parent` to the parent doc
3. Order determines child position under parent

Example:
```
Getting Started (order: 1)
├── Installation (order: 1, parent: Getting Started)
└── Configuration (order: 2, parent: Getting Started)
```

### Custom Ordering

Documents are ordered by the `order` field (ascending) within their level:
- Categories: Sorted by `order` (sidebar tab order)
- Top-level docs: Sorted by `order` within category
- Child docs: Sorted by `order` under their parent

The source adapter preserves this order using `pages` arrays in meta files.

## Important Considerations

### Async Source Access

The loader is created with `dynamicLoader()`, so you must `await getSource()`:

```typescript
// This won't work (there is no sync module-level loader)
import { source } from '@/lib/source';
const tree = source.pageTree;

// Do this instead
import { getSource } from '@/lib/source';
const source = await getSource();
const tree = source.getPageTree();
```

A compatibility `source` object still exposes async `getPage()`, `getPages()`, and `generateParams()`.

### Meta File Ordering

The source adapter uses meta files with `pages` arrays to preserve order:

```typescript
{
  title: "Getting Started",
  root: true,
  pages: ["installation", "configuration"]
}
```

Without this, Fumadocs sorts alphabetically. The adapter generates these from Payload's `order` field.

### Top-Level vs Nested Docs

The `pages` array only includes **top-level docs** (no parent):
- Docs without a parent
- Child docs appear under their parent automatically

This prevents duplicates and maintains hierarchy.

### Content Serialization

Lexical content must be serialized to HTML for the docs UI:

```typescript
import { serializeLexical } from '@/lib/lexical-serializer';

const htmlContent = await serializeLexical(doc.content, payload);
```

For LLM/markdown routes, use `extractMarkdownFromLexical()` in `lib/lexical-to-markdown.ts`.

### Database KV Adapter

The template uses Payload's database KV adapter (`payload.kv`) alongside MongoDB for cache/session-style key-value storage. MongoDB creates the `payload-kv` collection automatically.

### MCP (Model Context Protocol)

The MCP plugin exposes `docs` (full access) and `categories` (read-only) at `POST /api/mcp`. Every request needs `Authorization: Bearer <api-key>`. Create keys in Admin → **MCP → API Keys**.

The server advertises instructions so clients know to query docs/categories and that public markdown lives at `/docs/{path}.md`, `/llms.txt`, and `/llms-full.txt`.

### Database Depth

When querying Payload, use `depth: 2` for collections:

```typescript
const { docs } = await payload.find({
  collection: 'docs',
  depth: 2, // Resolves category and parent relationships
});
```

This ensures relationships are populated, not just IDs.

### Revalidation

Routes still use Next.js ISR:

```typescript
export const revalidate = 30;
```

Payload collection hooks also call `revalidatePath` and invalidate the Fumadocs dynamic loader, so published edits show up without waiting for the 30s interval.

### Media Storage

S3 is **optional** but recommended:
- **With S3**: Scalable, CDN-ready
- **Without S3**: Local storage (not ideal for production)

Leave `S3_BUCKET` empty or set `S3_ENABLED=false` to use local storage for development.

### Markdown for AI agents

- `/llms.txt` — index generated by Fumadocs `llms(source).index()`
- `/llms-full.txt` — full markdown dump of every page
- `/docs/{slug}.md` — rewrite to `/llms.mdx/docs/{slug}`
- Requests with `Accept: text/markdown` are rewritten by `proxy.ts`

Docs pages include **Copy Markdown**, **View Options**, last-updated timestamps, and an **Edit Page** link into Payload.

## Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Import to Vercel**
3. **Add Environment Variables**:
   ```
   PAYLOAD_SECRET=<random-string>
   PAYLOAD_DATABASE_URI=<mongodb-atlas-uri>
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   S3_ENABLED=true
   S3_BUCKET=<your-bucket>
   S3_REGION=<region>
   S3_ACCESS_KEY_ID=<key>
   S3_SECRET_ACCESS_KEY=<secret>
   ```

4. **Deploy**

### Database Setup (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `PAYLOAD_DATABASE_URI`
4. Whitelist Vercel's IP ranges

### S3 Setup

Any S3-compatible service works:
- AWS S3
- DigitalOcean Spaces
- Cloudflare R2
- Backblaze B2

## Customization

### Adding Fields to Docs

1. **Update Collection** (`collections/Docs.ts`):
   ```typescript
   fields: [
     // ... existing fields
     {
       name: 'author',
       type: 'text',
     }
   ]
   ```

2. **Update Source Adapter** (`lib/source.ts`):
   The adapter spreads the Payload doc into page data, so new fields are available on `page.data`.

3. **Use in Pages**:
   ```typescript
   const page = source.getPage(slugs);
   console.log(page.data.author);
   ```

4. **Regenerate types**:
   ```bash
   bun run generate:types
   ```

### Custom Styling

- Global styles: `app/(fumadocs)/global.css` (Tailwind CSS v4)
- Fumadocs theme: `app/(fumadocs)/layout.config.tsx`

### Adding Routes

Create LLM-friendly or custom routes following the pattern:
- Use `getSource()` for data access
- Leverage `source.getPages()`, `source.getPage()`, `source.getPageTree()`
- Serialize Lexical content when needed

## Troubleshooting

### "getPageTree must be accessed via getSource()"

You're trying to access the page tree on the async compatibility object. Use:
```typescript
const src = await getSource();
const tree = src.getPageTree();
```

### Docs not appearing in sidebar

Check:
1. Doc is Published (not Draft)
2. Doc is assigned to a category
3. Category exists and has an `order` value
4. Clear cache and restart the dev server

### Images not loading

If using S3:
1. Verify S3 credentials
2. Check bucket permissions
3. Ensure `S3_BUCKET` is set and `S3_ENABLED` is not `false`

If local:
1. Files are in `/public/media`
2. Leave `S3_BUCKET` empty or set `S3_ENABLED=false`

### "Encountered a script tag while rendering React component"

React 19 does not execute `<script>` tags rendered from Client Components. Fumadocs `RootProvider` uses `next-themes`, which used to inject its FOUC script that way.

This template:

1. Injects a blocking theme script from the **server** layout (`lib/theme-script.ts`)
2. Patches `next-themes@0.4.6` so `ThemeScript` returns `null` (see `patches/next-themes@0.4.6.patch`)

Keep `next-themes` pinned to `0.4.6` so the patch continues to apply. After `next-themes` ships a React 19-safe release, the patch and layout script can be removed.

### Sidebar order is wrong

The source adapter preserves Payload's `order` field. Verify:
1. Docs have `order` values set
2. Order is ascending (1, 2, 3...)
3. No duplicate orders at the same level

## Scripts

```bash
bun run dev                  # Development server (Next.js 16.3 + Payload)
bun run build                # Production build
bun run start                # Start production server
bun run payload              # Payload CLI commands
bun run generate:types       # Regenerate payload-types.ts
bun run generate:importmap   # Regenerate Payload admin import map
bun run lint                 # Ultracite / Biome check
bun run format               # Ultracite / Biome fix
```

## Learn More

- [Fumadocs Documentation](https://fumadocs.dev)
- [Fumadocs Loader API](https://fumadocs.dev/docs/headless/source-api)
- [Fumadocs LLM integration](https://fumadocs.dev/docs/integrations/llms)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload MCP Plugin](https://payloadcms.com/docs/plugins/mcp)
- [Payload Import/Export Plugin](https://payloadcms.com/docs/plugins/import-export)
- [Payload Live Preview](https://payloadcms.com/docs/live-preview/overview)
- [Lexical Editor](https://lexical.dev)

## License

MIT
