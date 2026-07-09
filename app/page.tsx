import Link from "next/link";
import { ArrowRight, BookText, Lightbulb, Newspaper, Wrench } from "lucide-react";
import EcgLine from "@/components/EcgLine";
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
      icon: BookText,
      title: "Prompt library",
      desc: "Battle-tested prompts from the team — rated, searchable, one click to copy.",
      count: counts.prompts,
      label: "prompts",
    },
    {
      href: "/tools",
      icon: Wrench,
      title: "AI tools",
      desc: "The tools we already have: what they do and where to find them.",
      count: counts.tools,
      label: "tools",
    },
    {
      href: "/ideas",
      icon: Lightbulb,
      title: "Ideas board",
      desc: "Propose the next AI tool we should build — agent, prompt or automation.",
      count: counts.ideas,
      label: "ideas",
    },
    {
      href: "/news",
      icon: Newspaper,
      title: "Cardiology AI news",
      desc: "Auto-curated headlines where AI meets cardiology, refreshed every two days.",
      count: counts.news,
      label: "stories",
    },
  ];

  return (
    <div>
      <section className="pt-4 sm:pt-8">
        <p className="label">Cardiology product team</p>
        <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Your team&apos;s AI, <span className="text-pulse">in one place</span>.
        </h1>
        <p className="mt-4 max-w-xl text-soft">
          Share the prompts that work, find the tools we already have, pitch the next one — and stay
          current on AI in cardiology without lifting a finger.
        </p>
        <EcgLine className="mt-8 h-10 w-full text-pulse sm:h-12" />
      </section>

      {!dbReady && (
        <div className="card mt-8 border-amber/50 bg-amber/10 p-4 text-sm text-amber">
          Database not configured yet — apply <code className="font-mono">supabase/schema.sql</code> and set{" "}
          <code className="font-mono">SUPABASE_URL</code> /{" "}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {sections.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className="card rise group p-6 transition-colors hover:border-pulse/60"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between">
              <s.icon size={20} className="text-pulse" />
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {s.count}
                <span className="ml-1.5 text-[11px] uppercase tracking-wider text-faint">{s.label}</span>
              </span>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{s.title}</h2>
            <p className="mt-1.5 text-sm text-soft">{s.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-pulse opacity-0 transition-opacity group-hover:opacity-100">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>

      {news.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight">Latest in cardiology AI</h2>
            <Link href="/news" className="text-sm font-medium text-pulse hover:underline">
              All news →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {news.map((n) => (
              <a key={n.id} href={n.url} target="_blank" rel="noreferrer" className="group flex flex-col gap-0.5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
                  {n.source || "News"}
                  {n.published_at
                    ? ` · ${new Date(n.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                    : ""}
                </span>
                <span className="font-medium transition-colors group-hover:text-pulse">{n.title}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
