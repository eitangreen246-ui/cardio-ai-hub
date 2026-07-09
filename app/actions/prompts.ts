"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type PromptInput = {
  title: string;
  content: string;
  description: string;
  field_of_interest: string;
  remarks: string;
};

function validate(input: PromptInput) {
  if (!input.title.trim()) throw new Error("Title is required");
  if (!input.content.trim()) throw new Error("Prompt content is required");
}

function revalidate(id?: string) {
  revalidatePath("/prompts");
  revalidatePath("/");
  if (id) revalidatePath(`/prompts/${id}`);
}

export async function createPrompt(input: PromptInput, authorId: string) {
  validate(input);
  if (!authorId) throw new Error("Pick your name first");
  const { data, error } = await supabase()
    .from("prompts")
    .insert({ ...input, author_id: authorId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidate();
  return data.id as string;
}

export async function updatePrompt(id: string, input: PromptInput) {
  validate(input);
  const { error } = await supabase()
    .from("prompts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(id);
}

export async function deletePrompt(id: string) {
  const { error } = await supabase().from("prompts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(id);
}

export async function ratePrompt(promptId: string, profileId: string, rating: number) {
  if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5");
  const { error } = await supabase()
    .from("prompt_ratings")
    .upsert({ prompt_id: promptId, profile_id: profileId, rating }, { onConflict: "prompt_id,profile_id" });
  if (error) throw new Error(error.message);
  revalidate(promptId);
}

export async function recordCopy(promptId: string) {
  // atomic increment via SQL function; fire-and-forget from the client
  const { error } = await supabase().rpc("increment_copy_count", { p_id: promptId });
  if (error) throw new Error(error.message);
  revalidatePath("/prompts");
  revalidatePath(`/prompts/${promptId}`);
}
