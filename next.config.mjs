import { withPayload } from "@payloadcms/next/withPayload";
import { createMDX } from "fumadocs-mdx/next";

const withMdx = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        hostname: process.env.S3_ENDPOINT?.replace(/^https?:\/\//, "") || "",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        destination: "/llms.mdx/docs/:path*",
        source: "/docs/:path*.md",
      },
    ];
  },
  serverExternalPackages: ["sharp"],
};

export default withPayload(withMdx(config));
