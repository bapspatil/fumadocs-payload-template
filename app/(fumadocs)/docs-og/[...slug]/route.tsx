import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { source } from "@/lib/source";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  // Remove "image.png" from the end
  const pathParts = slug.slice(0, -1);
  const origin = new URL(req.url).origin;

  async function renderOG(title: string, description: string) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#171638",
          color: "#f7f7fb",
          padding: "48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo */}
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
            Fumadocs with Payload CMS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.4,
                color: "#aab0c0",
                maxWidth: 980,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#e6f4d8",
            }}
          >
            {origin.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  }

  // Find the page by slug
  const page = await source.getPage(pathParts);

  if (!page) {
    notFound();
  }

  return renderOG(page.data.title, page.data.description || "");
}

export async function generateStaticParams() {
  const pages = await source.getPages();

  const params = pages.map((page) => {
    // Convert URL path to slug array and append "image.png"
    const slugParts = page.url.replace("/docs/", "").split("/");
    return { slug: [...slugParts, "image.png"] };
  });

  return params;
}
