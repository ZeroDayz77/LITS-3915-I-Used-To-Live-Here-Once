"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Story" },
  { href: "/summary", label: "Summary" },
  { href: "/setting", label: "Setting" },
  { href: "/characters", label: "Characters" },
  { href: "/storyline", label: "Storyline" },
  { href: "/themes", label: "Themes" },
  { href: "/references", label: "Works Cited" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Main navigation">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`site-nav-link${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
