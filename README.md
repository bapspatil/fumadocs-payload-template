# Fumadocs x Payload CMS Template

This example demonstrates how to integrate [Payload CMS](https://payloadcms.com) with [Fumadocs](https://fumadocs.dev/) for content management. It showcases a complete documentation site powered by Payload CMS with a custom fumadocs source adapter.

[Demo Video](https://github.com/bapspatil/fumadocs-payload-template/raw/refs/heads/main/public/demo.mp4)

## What's Included

- **Payload CMS Integration**: Full headless CMS backend for documentation
- **Custom Source Adapter**: Transform Payload data into fumadocs format
- **Role-Based Access Control (RBAC)**: Owner, Admin and User roles for RBAC
- **Sidebar Tabs**: Each category becomes an isolated sidebar tab
- **Hierarchical Docs**: Parent/child relationships for nested documentation
- **Lexical Editor**: Rich text editing with HTML serialization
- **MongoDB Storage**: Persistent database storage with KV adapter support
- **S3 Media**: Optional S3-compatible media storage
- **Search**: Built-in search via fumadocs
- **MCP Support**: Model Context Protocol integration for AI/LLM interactions
- **LLM Routes**: Auto-generated `/llms.txt` and `/llms-full.txt`
- **OG Images**: Dynamic OpenGraph image generation

## Project Structure

```
payload-cms/
├── app/
│   ├── (fumadocs)/           # Public documentation routes
│   │   ├── (home)/           # Landing page with category cards
│   │   ├── docs/             # Documentation pages
│   │   │   ├── [[...slug]]/  # Dynamic doc pages
│   │   │   └── layout.tsx    # Docs layout with sidebar tabs
│   │   ├── api/search/       # Search API endpoint
│   │   ├── docs-og/          # OpenGraph image generation
│   │   ├── llms.txt/         # LLM-friendly content index
│   │   └── llms-full.txt/    # Full LLM content dump
│   └── (payload)/            # Payload admin (protected)
├── collections/
│   ├── Categories.ts         # Doc categories
│   ├── Docs.ts              # Documentation pages
│   └── Media.ts             # File uploads
├── components/
│   └── ui/                  # UI components
├── lib/
│   ├── source.ts            # 🔑 Fumadocs source adapter
│   ├── lexical-serializer.ts # Lexical to HTML converter
│   └── utils.ts             # Helper functions
└── payload.config.ts        # Payload CMS config
```

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (or npm/pnpm/yarn)
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

   # S3 Storage (optional but recommended)
   S3_ENABLED=true
   S3_BUCKET=your-bucket
   S3_REGION=us-east-1
   S3_ACCESS_KEY_ID=your-key
   S3_SECRET_ACCESS_KEY=your-secret
   ```

3. **Start development**:
   ```bash
   bun run dev
   ```

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
- **MCP Enabled**: Exposed through Model Context Protocol for AI access

### Media
File uploads:
- `alt`: Alt text for images
- Stored in S3 or local filesystem
- Automatic optimization

## How It Works

### Source Adapter Pattern

The heart of this example is `lib/source.ts` - the fumadocs source adapter:

```typescript
import { loader } from "fumadocs-core/source";
import { getPayload } from "payload";

// Create cached source
export const getSource = cache(async () => {
  const payloadSource = await createPayloadSource();
  return loader({
    baseUrl: "/docs",
    source: payloadSource,
  });
});
```

**What it does**:
1. Fetches categories and docs from Payload
2. Transforms Payload data into fumadocs `VirtualFile` format
3. Builds hierarchical paths (e.g., `/docs/category/parent/child`)
4. Creates meta files for sidebar tabs and ordering
5. Provides standard fumadocs APIs

**In your routes**:
```typescript
const source = await getSource();
const page = source.getPage(slugs);
const tree = source.pageTree;
```

### Sidebar Tabs

Each category becomes an isolated sidebar tab:

1. **Meta files** with `root: true` mark categories as root folders
2. **Pages array** defines document order (preserves Payload `order` field)
3. **Auto-detection** by fumadocs creates the tab interface

When viewing a doc, only that category's docs appear in the sidebar.

### Content Flow

```
Payload CMS (Lexical)
       ↓
Source Adapter (Transform)
       ↓
VirtualFiles (Fumadocs format)
       ↓
Lexical Serializer (HTML)
       ↓
Rendered Page
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

3. **Publish**:
   - Change status to "Published"
   - Content appears immediately (with revalidation)

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

⚠️ The `source.pageTree` getter requires async access:

```typescript
// ❌ This won't work (synchronous access)
import { source } from '@/lib/source';
const tree = source.pageTree; // Error!

// ✅ Do this instead (async access)
import { getSource } from '@/lib/source';
const source = await getSource();
const tree = source.pageTree; // Works!
```

This is due to React's cache() requiring async initialization.

### Meta File Ordering

The source adapter uses meta files with `pages` arrays to preserve order:

```typescript
// Category meta file
{
  title: "Getting Started",
  root: true,
  pages: ["installation", "configuration"] // Explicit order
}
```

Without this, fumadocs sorts alphabetically. The adapter automatically generates these based on Payload's `order` field.

### Top-Level vs Nested Docs

The `pages` array only includes **top-level docs** (no parent):
- ✅ Docs without a parent
- ❌ Child docs (they appear under their parent automatically)

This prevents duplicates and maintains hierarchy.

### Content Serialization

Lexical content must be serialized to HTML:

```typescript
import { serializeLexical } from '@/lib/lexical-serializer';

const htmlContent = await serializeLexical(doc.content, payload);
```

The serializer handles:
- Headings, paragraphs, lists
- Links, images, code blocks
- Custom Lexical nodes
- Table of contents extraction

### Database KV Adapter

The template includes support for Payload's database KV adapter, which provides:
- **Key-Value Storage**: Efficient storage for cache, sessions, and temporary data
- **Performance**: Faster access to frequently used data
- **Scalability**: Better handling of high-traffic scenarios
- **Integration**: Seamless integration with MongoDB for persistent storage

The KV adapter is automatically configured and works alongside your main MongoDB database for optimal performance.

### MCP (Model Context Protocol) Support

This template includes MCP integration for enhanced AI/LLM capabilities:
- **AI-Friendly Content**: Structured data access for AI models
- **Standardized Protocol**: Uses industry-standard Model Context Protocol
- **Documentation Access**: Enables AI systems to query and understand your documentation
- **Enhanced Search**: Improves AI-powered search and content discovery

The MCP plugin exposes your documentation collections through a standardized API that AI systems can consume, making your content more accessible to LLMs and other AI tools.

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

The example uses Next.js revalidation:

```typescript
export const revalidate = 30; // Revalidate every 30 seconds
```

Adjust based on your needs:
- `revalidate: 0` - No cache (always fresh)
- `revalidate: 3600` - Cache for 1 hour
- `revalidate: false` - Cache indefinitely

### Media Storage

S3 is **optional** but recommended:
- **With S3**: Scalable, CDN-ready
- **Without S3**: Local storage (not ideal for production)

Set `S3_ENABLED=false` to use local storage for development.

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
   ```typescript
   data: {
     ...doc,
     author: doc.author, // Include new field
   }
   ```

3. **Use in Pages**:
   ```typescript
   const page = source.getPage(slugs);
   console.log(page.data.author);
   ```

### Custom Styling

- Tailwind config: `tailwind.config.ts`
- Global styles: `app/global.css`
- Fumadocs theme: `app/(fumadocs)/layout.config.tsx`

### Adding Routes

Create LLM-friendly or custom routes following the pattern:
- Use `getSource()` for data access
- Leverage `source.getPages()`, `source.getPage()`
- Serialize Lexical content when needed

## Troubleshooting

### "pageTree must be accessed via getSource()"

You're trying to access `source.pageTree` directly. Use:
```typescript
const src = await getSource();
const tree = src.pageTree;
```

### Docs not appearing in sidebar

Check:
1. Doc is Published (not Draft)
2. Doc is assigned to a category
3. Category exists and has an `order` value
4. Clear cache and restart dev server

### Images not loading

If using S3:
1. Verify S3 credentials
2. Check bucket permissions
3. Ensure `S3_ENABLED=true`

If local:
1. Files are in `/public/media`
2. Set `S3_ENABLED=false`

### Sidebar order is wrong

The source adapter preserves Payload's `order` field. Verify:
1. Docs have `order` values set
2. Order is ascending (1, 2, 3...)
3. No duplicate orders at the same level

## Scripts

```bash
bun run dev          # Development server
bun run build        # Production build
bun run start        # Start production server
bun run payload      # Payload CLI commands
```

## Learn More

- [Fumadocs Documentation](https://fumadocs.vercel.app)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Source API Reference](https://fumadocs.vercel.app/docs/headless/source-api)
- [Lexical Editor](https://lexical.dev)
- [Payload MCP Plugin](https://payloadcms.com/docs/plugins/mcp)
- [Payload Database KV Adapter](https://payloadcms.com/docs/configuration/database-adapters#database-kv-adapter)

## License

MIT
