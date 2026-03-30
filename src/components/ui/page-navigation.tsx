"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Code, GraduationCap, Wrench } from "lucide-react";

export function PageNavigation() {
  const pathname = usePathname();

  // Do not show on homepage (which includes resume) or the profile 3D scene
  if (pathname === "/" || pathname === "/profile") {
    return null;
  }

  const links = [
    { name: "Homepage", href: "/", icon: Home },
    { name: "Experience", href: "/experience", icon: Briefcase },
    { name: "Projects", href: "/projects", icon: Code },
    { name: "Education", href: "/certifications", icon: GraduationCap },
    { name: "Skills", href: "/skills", icon: Wrench },
  ];

  // Filter out the current page
  const filteredLinks = links.filter((link) => link.href !== pathname);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full border border-transparent hover:border-white/20"
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
