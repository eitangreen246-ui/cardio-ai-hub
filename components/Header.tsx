"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/prompts", label: "Prompts", color: "var(--blue)" },
  { href: "/tools", label: "Tools", color: "var(--violet)" },
  { href: "/ideas", label: "Ideas", color: "var(--amber)" },
  { href: "/news", label: "News", color: "var(--teal)" },
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
    <button
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors hover:border-blue"
      style={{ borderColor: "var(--line)", background: "var(--raised)", color: "var(--ink)" }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ borderColor: "var(--line)", backgroundColor: "color-mix(in oklch, var(--bg) 85%, transparent)" }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-3">
        <div
          className="flex items-center gap-2 rounded-full border p-2 pl-3"
          style={{ borderColor: "var(--line)", background: "var(--surface)", boxShadow: "var(--shadow)" }}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5 pr-2">
            <span
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--blue)" }}
            >
              <HeartPulse size={18} strokeWidth={2.4} color="white" />
            </span>
            <span className="font-display text-[17px] font-extrabold tracking-tight">
              Cardio <span style={{ color: "var(--blue)" }}>AI</span> Hub
            </span>
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-3.5 py-2 text-sm font-bold whitespace-nowrap transition-colors"
                  style={
                    active
                      ? { background: `color-mix(in oklch, ${n.color} 14%, transparent)`, color: n.color }
                      : { color: "var(--soft)" }
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
