export type Profile = { id: string; full_name: string; created_at?: string };

export const FIELD_OPTIONS = [
  "Feature Writing",
  "Competitive Research",
  "UX",
  "Market Research",
  "Data Analysis",
  "Regulatory",
  "Other",
] as const;

export const TOOL_CATEGORIES = [
  "Research",
  "Writing",
  "UX & Design",
  "Data",
  "Development",
  "Productivity",
  "Other",
] as const;

export const IDEA_KINDS = [
  { value: "agent", label: "Agent" },
  { value: "prompt", label: "Prompt" },
  { value: "automation", label: "Automation" },
  { value: "custom_gpt", label: "Custom GPT" },
  { value: "other", label: "Other" },
] as const;

export const IDEA_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "in_development", label: "In development" },
  { value: "done", label: "Done" },
] as const;

export type Rating = { rating: number; profile_id: string };

export type Prompt = {
  id: string;
  title: string;
  content: string;
  description: string;
  field_of_interest: string;
  remarks: string;
  author_id: string;
  copy_count: number;
  created_at: string;
  updated_at: string;
  author?: Pick<Profile, "id" | "full_name"> | null;
  ratings?: Rating[];
};

export type Tool = {
  id: string;
  name: string;
  purpose: string;
  category: string;
  location: string;
  status: "ready" | "in_development";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  author?: Pick<Profile, "id" | "full_name"> | null;
};

export type Recommendation = {
  id: string;
  name: string;
  purpose: string;
  category: string;
  kind: "agent" | "prompt" | "automation" | "custom_gpt" | "other";
  status: "submitted" | "under_review" | "in_development" | "done";
  author_id: string;
  created_at: string;
  author?: Pick<Profile, "id" | "full_name"> | null;
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  tags: string[];
  relevance_score: number | null;
  hidden: boolean;
  published_at: string | null;
  fetched_at: string;
};

export function averageRating(ratings?: { rating: number }[]): number | null {
  if (!ratings || ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
}
