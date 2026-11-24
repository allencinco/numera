"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Grid2X2 } from "lucide-react";

const links = [
  { href: "/explore", label: "Experiments" },
  { href: "/creations", label: "My Creations" },
  { href: "/studio", label: "Studio" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="top-nav">
      <Link className="brand" href="/" aria-label="Numera home">
        <span className="brand-mark"><Grid2X2 size={16} strokeWidth={1.8} /></span>
        <span>NUMERA</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link className="nav-launch" href="/studio">
        Launch Studio <ArrowUpRight size={15} />
      </Link>
    </header>
  );
}
