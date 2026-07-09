-- Migration 002: remove name-based identification (run once in the SQL editor).
-- Content no longer records an author; ratings use an anonymous per-browser id.
-- The profiles table stays for the future email+password login.

alter table prompts alter column author_id drop not null;
alter table recommendations alter column author_id drop not null;
alter table prompt_ratings drop constraint if exists prompt_ratings_profile_id_fkey;
