export default function DbNotice() {
  return (
    <div className="card mt-6 border-amber/50 bg-amber/10 p-4 text-sm text-amber">
      Database not reachable — apply <code className="font-mono">supabase/schema.sql</code> in Supabase and
      set <code className="font-mono">SUPABASE_URL</code> /{" "}
      <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
      <code className="font-mono">.env.local</code>, then reload.
    </div>
  );
}
