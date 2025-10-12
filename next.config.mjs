import { withPayload } from "@payloadcms/next/withPayload";
import { createMDX } from "fumadocs-mdx/next";

const withMdx = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ["sharp"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.S3_ENDPOINT?.replace(/^https?:\/\//, "") || "",
      },
    ],
  },
};

export default withPayload(withMdx(config));
