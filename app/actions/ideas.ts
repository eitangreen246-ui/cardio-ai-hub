"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type IdeaInput = {
  name: string;
  purpose: string;
  category: string;
  kind: "agent" | "prompt" | "automation" | "custom_gpt" | "other";
  status: "submitted" | "under_review" | "in_development" | "done";
};

function validate(input: IdeaInput) {
  if (!input.name.trim()) throw new Error("Idea name is required");
}

export async function createIdea(input: IdeaInput) {
  validate(input);
  const { error } = await supabase().from("recommendations").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/ideas");
  revalidatePath("/");
}

export async function updateIdea(id: string, input: IdeaInput) {
  validate(input);
  const { error } = await supabase().from("recommendations").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ideas");
}

export async function deleteIdea(id: string) {
  const { error } = await supabase().from("recommendations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ideas");
  revalidatePath("/");
}
