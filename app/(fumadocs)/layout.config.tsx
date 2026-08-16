import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Home, Settings } from "lucide-react";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  links: [
    {
      active: "url",
      icon: <Home />,
      text: "Home",
      url: "/",
    },
    {
      active: "url",
      icon: <Settings />,
      text: "Admin",
      url: "/admin",
    },
  ],
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <span className="font-bold font-serif tracking-wide">FumaPayload</span>
      </div>
    ),
  },
  themeSwitch: {
    enabled: true,
    mode: "light-dark-system",
  },
};

export const homeOptions: BaseLayoutProps = {
  ...baseOptions,
  links: [
    {
      active: "url",
      text: "Admin",
      url: "/admin",
    },
  ],
};
