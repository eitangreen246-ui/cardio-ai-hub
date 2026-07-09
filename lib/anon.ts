/**
 * Invisible per-browser id used ONLY to keep "one rating per person" working
 * without any name/login. Replaced by the real user id when auth arrives.
 */
export function getAnonId(): string {
  try {
    let id = localStorage.getItem("cah-anon-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("cah-anon-id", id);
    }
    return id;
  } catch {
    return "00000000-0000-4000-8000-000000000000";
  }
}
