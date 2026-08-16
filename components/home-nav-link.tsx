"use client";

import { Home } from "lucide-react";
import Link from "next/link";

export function HomeNavLink() {
  return (
    <div className="nav-link-wrapper">
      <Link
        className="nav__link"
        href="/"
        style={{
          alignItems: "center",
          color: "var(--theme-text)",
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          textDecoration: "none",
          transition: "all 0.2s ease",
        }}
      >
        <Home size={16} />
        <span>Home</span>
      </Link>
    </div>
  );
}
