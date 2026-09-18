"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, Linkedin, Instagram, Github, Link2, LucideBackpack, Download } from "lucide-react";
import { defaultSocials, type SocialItem } from "@/lib/default-data";

const socialIconMap = { Linkedin, Instagram, Github, LucideBackpack, Download };

export function SocialQuadrantMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [socialItems, setSocialItems] = useState<SocialItem[]>(defaultSocials);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/socials", { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data: SocialItem[]) => {
        if (Array.isArray(data) && data.length > 0) setSocialItems(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="portfolio-socials">
      {isOpen && (
        <nav id="social-links" aria-label="Social links"
          className="absolute bottom-full left-0 mb-3 w-60 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-neutral-950 p-2 text-white shadow-2xl">
          {socialItems.map((item) => {
            const Icon = socialIconMap[item.iconName as keyof typeof socialIconMap] || Link2;
            return (
              <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" download={item.download}
                onClick={() => setIsOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/10 focus-visible:bg-white/10">
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{item.label}</span>
              </a>
            );
          })}
        </nav>
      )}
      <button ref={triggerRef} type="button" aria-label={isOpen ? "Close social links" : "Open social links"}
        aria-expanded={isOpen} aria-controls="social-links" onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-lg lg:h-12 lg:w-12">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
