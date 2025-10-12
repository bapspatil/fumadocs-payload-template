import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/(fumadocs)/layout.config";
import { getSource } from "@/lib/source";

export default async function Layout({ children }: { children: ReactNode }) {
  const source = await getSource();
  const tree = source.pageTree;

  return (
    <DocsLayout
      tree={tree}
      {...baseOptions}
      sidebar={{
        prefetch: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}

export const revalidate = 30;
