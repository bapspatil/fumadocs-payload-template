import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VideoJSPlayer from "@/components/videojs-player";
import config from "@/payload.config";
import type { Media } from "@/payload-types";

const demoVideoHtml = `
  <div class="w-full">
    <video
      class="video-js vjs-default-skin"
      data-videojs-player="true"
      data-video-src="/demo.mp4"
      data-video-type="video/mp4"
      data-video-title="Product Demo"
      playsinline
      controls
    ></video>
  </div>
`;

export default async function HomePage() {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  const { docs: categories } = await payload.find({
    collection: "categories",
    sort: "order",
    limit: 1000,
    depth: 1,
  });

  // Get the first doc for each category to link to
  const categoriesWithFirstDoc = await Promise.all(
    categories.map(async (category) => {
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
        sort: "order",
        limit: 1,
      });

      return {
        ...category,
        firstDoc: categoryDocs[0],
      };
    })
  );

  return (
    <main className="flex flex-1 flex-col px-4 py-4 md:px-8 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-1 flex-col justify-center gap-4 text-center">
        <div className="mb-4 flex items-center justify-center gap-2 md:gap-4">
          <h1 className="font-bold font-serif text-4xl tracking-wide md:text-5xl">
            Documentation
          </h1>
        </div>
        <p className="mb-8 text-fd-muted-foreground text-md">
          Browse documentation categories below.
        </p>
        {/* TODO: Delete this after you create your first user */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-6xl">
              <VideoJSPlayer html={demoVideoHtml} />
            </div>
            <div className="flex w-full flex-col justify-center gap-4 md:flex-row md:flex-wrap md:gap-6">
              <Link className="block w-full md:w-80" href="/admin">
                <Card className="transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>
                      Begin by creating your first admin user. Delete this card
                      after you're done in /app/(fumadocs)/(home)/page.tsx
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center gap-4 md:flex-row md:flex-wrap md:gap-6">
            {categoriesWithFirstDoc.map((category) => {
              // Build the URL from category slug and first doc slug
              const href = category.firstDoc
                ? `/docs/${category.slug}/${category.firstDoc.slug}`
                : `/docs/${category.slug}`;

              // Get icon URL from media relationship
              const iconUrl =
                typeof category.icon === "object" &&
                category.icon !== null &&
                "url" in category.icon
                  ? (category.icon as Media).url
                  : null;

              return (
                <Link
                  className="block w-full md:w-80"
                  href={href}
                  key={category.id}
                >
                  <Card className="transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardHeader>
                      {iconUrl ? (
                        <div className="mb-2">
                          <Image
                            alt={category.title}
                            className="object-contain"
                            height={32}
                            src={iconUrl}
                            width={32}
                          />
                        </div>
                      ) : null}
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>
                        {category.description || ""}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-16 border-fd-border border-t py-6 text-center">
        <p className="text-fd-muted-foreground text-sm">
          Template by{" "}
          <a
            className="font-medium text-fd-foreground underline decoration-fd-primary/30 transition-colors hover:text-fd-primary hover:decoration-fd-primary"
            href="https://www.bapspatil.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Bapusaheb Patil
          </a>
        </p>
      </footer>
    </main>
  );
}
