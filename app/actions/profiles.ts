"use server";

import { supabase } from "@/lib/supabase";

export async function listProfiles() {
  const { data, error } = await supabase().from("profiles").select("id, full_name").order("full_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProfile(fullName: string) {
  const name = fullName.trim();
  if (!name) throw new Error("Name is required");
  // reuse an existing profile with the same name instead of failing on the unique constraint
  const { data: existing } = await supabase()
    .from("profiles")
    .select("id, full_name")
    .ilike("full_name", name)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase()
    .from("profiles")
    .insert({ full_name: name })
    .select("id, full_name")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
