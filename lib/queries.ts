import { supabase } from "./supabase";
import { averageRating, type NewsItem, type Prompt, type Recommendation, type Tool } from "./types";

// prompts relates to profiles twice (author FK + via prompt_ratings), so the embed
// must name the FK explicitly or PostgREST rejects it as ambiguous (PGRST201)
const PROMPT_SELECT =
  "*, author:profiles!prompts_author_id_fkey(id, full_name), ratings:prompt_ratings(rating, profile_id)";

export type PromptListOpts = { q?: string; field?: string; sort?: string };

export async function getPrompts(opts: PromptListOpts = {}): Promise<Prompt[]> {
  let query = supabase().from("prompts").select(PROMPT_SELECT);
  if (opts.q) {
    const q = opts.q.replace(/[,()]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,content.ilike.%${q}%`);
  }
  if (opts.field && opts.field !== "All") query = query.eq("field_of_interest", opts.field);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const prompts = (data ?? []) as unknown as Prompt[];
  if (opts.sort === "top") {
    prompts.sort((a, b) => (averageRating(b.ratings) ?? -1) - (averageRating(a.ratings) ?? -1));
  } else if (opts.sort === "copied") {
    prompts.sort((a, b) => b.copy_count - a.copy_count);
  }
  return prompts;
}

export async function getPrompt(id: string): Promise<Prompt | null> {
  const { data, error } = await supabase().from("prompts").select(PROMPT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as Prompt | null;
}

export async function getTools(): Promise<Tool[]> {
  const { data, error } = await supabase()
    .from("tools")
    .select("*, author:profiles(id, full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Tool[];
}

export async function getIdeas(): Promise<Recommendation[]> {
  const { data, error } = await supabase()
    .from("recommendations")
    .select("*, author:profiles(id, full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Recommendation[];
}

export async function getNews(limit = 200): Promise<NewsItem[]> {
  const { data, error } = await supabase()
    .from("news_items")
    .select("*")
    .eq("hidden", false)
    .order("fetched_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as NewsItem[];
}

export async function getCounts() {
  const s = supabase();
  const [p, t, r, n] = await Promise.all([
    s.from("prompts").select("*", { count: "exact", head: true }),
    s.from("tools").select("*", { count: "exact", head: true }),
    s.from("recommendations").select("*", { count: "exact", head: true }),
    s.from("news_items").select("*", { count: "exact", head: true }).eq("hidden", false),
  ]);
  return { prompts: p.count ?? 0, tools: t.count ?? 0, ideas: r.count ?? 0, news: n.count ?? 0 };
}
