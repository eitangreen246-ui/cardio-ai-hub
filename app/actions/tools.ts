"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type ToolInput = {
  name: string;
  purpose: string;
  category: string;
  location: string;
  status: "ready" | "in_development";
};

function validate(input: ToolInput) {
  if (!input.name.trim()) throw new Error("Tool name is required");
}

export async function createTool(input: ToolInput, creatorId: string | null) {
  validate(input);
  const { error } = await supabase().from("tools").insert({ ...input, created_by: creatorId });
  if (error) throw new Error(error.message);
  revalidatePath("/tools");
  revalidatePath("/");
}

export async function updateTool(id: string, input: ToolInput) {
  validate(input);
  const { error } = await supabase()
    .from("tools")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tools");
}

export async function deleteTool(id: string) {
  const { error } = await supabase().from("tools").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tools");
  revalidatePath("/");
}
