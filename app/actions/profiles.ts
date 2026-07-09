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
  // escape LIKE wildcards so a name like "a%" cannot match another member,
  // and limit(1) so case-variant duplicates cannot crash maybeSingle
  const pattern = name.replace(/[\\%_]/g, (m) => `\\${m}`);
  const { data: existing } = await supabase()
    .from("profiles")
    .select("id, full_name")
    .ilike("full_name", pattern)
    .limit(1)
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
