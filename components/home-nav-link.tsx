"use client";

import { Home } from "lucide-react";
import Link from "next/link";

export function HomeNavLink() {
	return (
		<div className="nav-link-wrapper">
			<Link
				href="/"
				className="nav__link"
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.5rem",
					padding: "0.75rem 1rem",
					textDecoration: "none",
					color: "var(--theme-text)",
					transition: "all 0.2s ease",
				}}
			>
				<Home size={16} />
				<span>Home</span>
			</Link>
		</div>
	);
}
