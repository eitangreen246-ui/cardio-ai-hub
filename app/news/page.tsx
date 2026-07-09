import { ExternalLink, HeartPulse } from "lucide-react";
import DbNotice from "@/components/DbNotice";
import { RemoveNewsButton } from "@/components/news-client";
import { getNews } from "@/lib/queries";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cardiology AI news" };

export default async function NewsPage() {
  let news: NewsItem[] = [];
  let dbError = false;
  try {
    news = await getNews();
  } catch {
    dbError = true;
  }

  const groups = new Map<string, NewsItem[]>();
  for (const item of news) {
    const key = new Date(item.fetched_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="label">Auto-curated every two days</p>
      <h1 className="font-display text-3xl font-bold tracking-tight">Cardiology AI news</h1>
      <p className="mt-2 max-w-xl text-sm text-soft">
        Headlines where AI meets cardiology — collected from targeted feeds, screened for relevance by
        Claude, removable by you if something slips through.
      </p>
      {dbError && <DbNotice />}
      {!dbError && news.length === 0 && (
        <div className="card mt-8 p-10 text-center">
          <HeartPulse className="mx-auto text-pulse" size={22} />
          <p className="mt-3 font-display text-lg font-semibold">No news yet</p>
          <p className="mt-1 text-sm text-soft">
            The news worker runs every two days. It can also be triggered manually with{" "}
            <code className="font-mono">npm run fetch-news</code>.
          </p>
        </div>
      )}
      {[...groups.entries()].map(([date, items]) => (
        <section key={date} className="mt-8">
          <div className="flex items-center gap-3">
            <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
              {date}
            </h2>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {items.map((n) => (
              <article key={n.id} className="card rise p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-faint">
                  {n.source || "News"}
                  {n.published_at
                    ? ` · ${new Date(n.published_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`
                    : ""}
                </p>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-display text-lg font-semibold leading-snug tracking-tight transition-colors hover:text-pulse"
                >
                  {n.title}
                </a>
                {n.summary && <p className="mt-1.5 text-sm text-soft">{n.summary}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {n.tags?.map((t) => (
                    <span key={t} className="badge">
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-4">
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-pulse hover:underline"
                    >
                      Read full article <ExternalLink size={13} />
                    </a>
                    <RemoveNewsButton id={n.id} title={n.title} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
