import Link from "next/link";
import { ArrowRight, Lightbulb, MessageSquareText, Newspaper, SlidersHorizontal } from "lucide-react";
import PulseDivider from "@/components/PulseDivider";
import { getCounts, getNews } from "@/lib/queries";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let counts = { prompts: 0, tools: 0, ideas: 0, news: 0 };
  let news: NewsItem[] = [];
  let dbReady = true;
  try {
    [counts, news] = await Promise.all([getCounts(), getNews(3)]);
  } catch {
    dbReady = false;
  }

  const sections = [
    {
      href: "/prompts",
      icon: MessageSquareText,
      color: "var(--blue)",
      title: "Prompt library",
      desc: "Battle-tested prompts from the team — rated, searchable, one click to copy.",
      count: counts.prompts,
      label: "prompts",
    },
    {
      href: "/tools",
      icon: SlidersHorizontal,
      color: "var(--violet)",
      title: "AI tools",
      desc: "The tools we already have: what they do and where to find them.",
      count: counts.tools,
      label: "tools",
    },
    {
      href: "/ideas",
      icon: Lightbulb,
      color: "var(--amber)",
      title: "Ideas board",
      desc: "Propose the next AI tool we should build — agent, prompt or automation.",
      count: counts.ideas,
      label: "ideas",
    },
    {
      href: "/news",
      icon: Newspaper,
      color: "var(--teal)",
      title: "Cardiology AI news",
      desc: "Auto-curated headlines where AI meets cardiology, refreshed every two days.",
      count: counts.news,
      label: "stories",
    },
  ];

  return (
    <div>
      <section className="pt-6 sm:pt-10">
        <span className="eyebrow badge-blue">Cardiology product team</span>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Your team&apos;s AI, <span style={{ color: "var(--blue)" }}>in one place</span>.
        </h1>
        <p className="mt-4 max-w-xl text-[17px] text-soft">
          Share the prompts that work, find the tools we already have, pitch the next one — and stay
          current on AI in cardiology without lifting a finger.
        </p>
        <PulseDivider className="mt-8 h-10 w-full sm:h-11" />
      </section>

      {!dbReady && (
        <div className="card mt-8 p-4 text-sm" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>
          Database not configured yet — apply <code className="font-mono">supabase/schema.sql</code> and set{" "}
          <code className="font-mono">SUPABASE_URL</code> /{" "}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      )}

      <section className="mt-10 grid gap-5 sm:grid-cols-2">
        {sections.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className="card dash-card card-glow rise group relative overflow-hidden p-7"
            style={{ animationDelay: `${i * 70}ms`, ["--accent" as string]: s.color }}
          >
            <div className="relative flex items-start justify-between">
              <span className="icon-badge" style={{ color: s.color }}>
                <s.icon size={21} />
              </span>
              <span className="text-right">
                <span className="font-display text-3xl font-extrabold tabular-nums">{s.count}</span>
                <span className="ml-1.5 text-[11px] font-bold uppercase tracking-wider text-faint">{s.label}</span>
              </span>
            </div>
            <h2 className="relative mt-5 font-display text-xl font-bold tracking-tight">{s.title}</h2>
            <p className="relative mt-1.5 text-sm text-soft">{s.desc}</p>
            <span
              className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: s.color }}
            >
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>

      {news.length > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">Latest in cardiology AI</h2>
            <Link href="/news" className="text-sm font-bold" style={{ color: "var(--teal)" }}>
              All news →
            </Link>
          </div>
          <div className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
            {news.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-0.5 border-b py-3.5 last:border-0"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                  {n.source || "News"}
                  {n.published_at
                    ? ` · ${new Date(n.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Jerusalem" })}`
                    : ""}
                </span>
                <span className="font-semibold transition-colors group-hover:opacity-80">{n.title}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
