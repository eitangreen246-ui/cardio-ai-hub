/**
 * Cardiology-AI news worker.
 *
 * Runs on a Railway cron schedule (every 2 days) and exits when done:
 *   1. Pulls headlines from targeted RSS feeds (pre-scoped to cardiology + AI queries).
 *   2. Drops anything already in the database (including items the team removed).
 *   3. Asks Claude Haiku to score each item 0-10 against a strict "must be BOTH
 *      cardiology AND AI" rubric and write a 1-2 sentence summary + tags.
 *   4. Stores items scoring >= MIN_SCORE in Supabase for the /news page.
 */
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// --- tiny .env loader so `npm run fetch-news` works locally without extra deps ---
for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function gnews(query: string) {
  return {
    name: `Google News: ${query}`,
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
  };
}

// Layer 1 of relevance: the feeds themselves are already scoped to cardiology+AI.
// Add PubMed saved-search RSS URLs or journal feeds here any time.
const FEEDS = [
  gnews("artificial intelligence cardiology"),
  gnews('"AI" cardiology FDA'),
  gnews("machine learning cardiac imaging"),
  gnews('"AI" ECG'),
];

const MAX_ITEMS = Number(process.env.NEWS_MAX_ITEMS ?? 50);
const MIN_SCORE = 7;

type Candidate = { title: string; url: string; source: string; published_at: string | null };
type Graded = { i: number; relevance_score: number; summary: string; tags: string[] };

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const supabaseUrl = required("SUPABASE_URL");
  const supabaseKey = required("SUPABASE_SERVICE_ROLE_KEY");
  required("ANTHROPIC_API_KEY"); // the SDK reads it from the environment

  const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const parser = new Parser();

  // 1. Collect candidates from all feeds (dedupe by URL and by title across feeds)
  const byUrl = new Map<string, Candidate>();
  const seenTitles = new Set<string>();
  for (const feed of FEEDS) {
    try {
      const res = await parser.parseURL(feed.url);
      for (const item of res.items ?? []) {
        if (!item.link || !item.title) continue;
        // Google News titles end with " - Source"
        let title = item.title.trim();
        let source = "";
        const sep = title.lastIndexOf(" - ");
        if (sep > 10) {
          source = title.slice(sep + 3).trim();
          title = title.slice(0, sep).trim();
        }
        const titleKey = title.toLowerCase();
        if (seenTitles.has(titleKey) || byUrl.has(item.link)) continue;
        seenTitles.add(titleKey);
        byUrl.set(item.link, { title, url: item.link, source, published_at: item.isoDate ?? null });
      }
      console.log(`feed ok: ${feed.name} (${res.items?.length ?? 0} items)`);
    } catch (e) {
      console.error(`feed failed: ${feed.name} — ${e instanceof Error ? e.message : e}`);
    }
  }

  // 2. Drop URLs we already stored — including hidden ones, so removed items never return.
  // Google News URLs are hundreds of chars long, so an `in.()` query-string filter blows
  // the request-size limit (400 Bad Request) — read all stored URLs and diff in memory.
  const existing = new Set<string>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from("news_items").select("url").range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) existing.add(row.url as string);
    if (!data || data.length < PAGE) break;
  }
  const urls = [...byUrl.keys()];
  const fresh = urls
    .filter((u) => !existing.has(u))
    .slice(0, MAX_ITEMS)
    .map((u) => byUrl.get(u)!);
  console.log(`candidates: ${byUrl.size}, new: ${fresh.length} (cap ${MAX_ITEMS})`);
  if (fresh.length === 0) {
    console.log("nothing new — done");
    return;
  }

  // 3. Layer 2 of relevance: strict LLM gate (model chosen by the team for cost: Haiku)
  const anthropic = new Anthropic();
  const numbered = fresh.map((c, i) => ({ i, title: c.title, source: c.source }));
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8000,
    system: [
      "You screen news headlines for a cardiology product team's internal news feed.",
      "Score each item 0-10 for relevance. To score 7 or higher an item MUST be about BOTH:",
      "(a) AI / machine learning / LLM technology, AND",
      "(b) cardiology or cardiovascular medicine (cardiac imaging, ECG, arrhythmia, heart failure,",
      "structural heart, cardiac devices, FDA clearance of cardiac AI, cardiology research using AI).",
      "General health-AI news without a cardiac angle, or cardiology news without AI, must score below 7.",
      "For every item also write a factual 1-2 sentence summary in plain English based on the headline",
      "(do not invent specifics beyond it), and 1-3 short lowercase topic tags.",
    ].join("\n"),
    messages: [{ role: "user", content: JSON.stringify(numbered) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  i: { type: "integer" },
                  relevance_score: { type: "integer" },
                  summary: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                },
                required: ["i", "relevance_score", "summary", "tags"],
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
  });

  if (response.stop_reason === "max_tokens") {
    console.warn("warning: grading response was truncated; lower NEWS_MAX_ITEMS");
  }
  const text = response.content.find((b) => b.type === "text")?.text ?? '{"items":[]}';
  const graded: { items: Graded[] } = JSON.parse(text);

  // 4. Store the survivors
  const rows = graded.items
    .filter((g) => g.relevance_score >= MIN_SCORE && fresh[g.i])
    .map((g) => ({
      title: fresh[g.i].title,
      url: fresh[g.i].url,
      source: fresh[g.i].source,
      published_at: fresh[g.i].published_at,
      summary: g.summary,
      tags: (g.tags ?? []).slice(0, 3),
      relevance_score: g.relevance_score,
    }));

  if (rows.length > 0) {
    const { error } = await db.from("news_items").upsert(rows, { onConflict: "url", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  console.log(`kept ${rows.length}/${fresh.length} new items (score >= ${MIN_SCORE})`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("news worker failed:", e);
    process.exit(1);
  });
