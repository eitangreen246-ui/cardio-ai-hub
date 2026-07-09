"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

/** Soft-hide an off-topic item. The row (and its URL) stays so the worker never re-imports it. */
export async function hideNewsItem(id: string) {
  const { error } = await supabase().from("news_items").update({ hidden: true }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/news");
  revalidatePath("/");
}
