"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Code, GraduationCap, Wrench } from "lucide-react";

const links = [
  { name: "Home", href: "/", icon: Home },
  { name: "Experience", href: "/experience", icon: Briefcase },
  { name: "Projects", href: "/projects", icon: Code },
  { name: "Education", href: "/certifications", icon: GraduationCap },
  { name: "Skills", href: "/skills", icon: Wrench },
];

export function PageNavigation() {
  const pathname = usePathname();
  const current = pathname === "/profile" ? "/" : pathname;
  return (
    <nav aria-label="Portfolio pages" className="portfolio-dock">
      <div className="flex items-center justify-center gap-0 rounded-full border border-white/15 bg-neutral-950/95 p-1 shadow-lg lg:gap-1 lg:p-2">
        {links.filter((link) => link.href !== current).map(({ name, href, icon: Icon }) => (
          <Link key={href} href={href} aria-label={name} title={name}
            className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 lg:w-auto lg:px-4">
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden text-sm font-medium lg:inline">{name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
