"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/prompts", label: "Prompts" },
  { href: "/tools", label: "Tools" },
  { href: "/ideas", label: "Ideas" },
  { href: "/news", label: "News" },
];

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    setDark(
      root.dataset.theme === "dark" ||
        (root.dataset.theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("cah-theme", next);
    } catch {}
    setDark(!dark);
  };

  return (
    <button onClick={toggle} className="btn btn-sm" aria-label="Toggle light/dark theme">
      {dark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <HeartPulse className="text-pulse" size={20} strokeWidth={2.2} />
          <span className="font-display text-[17px] font-bold tracking-tight">
            Cardio <span className="text-pulse">AI</span> Hub
          </span>
        </Link>
        <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-pulse/10 text-pulse" : "text-soft hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
