import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { homeOptions } from "@/app/(fumadocs)/layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...homeOptions}>{children}</HomeLayout>;
}
