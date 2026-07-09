# Cardio AI Hub

Internal hub for the cardiology product team: shared prompt library, AI tools catalog, ideas board, and an auto-updated AI-in-cardiology news feed.

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS v4
- Supabase (Postgres) - all access server-side via service-role key; RLS locked, no public policies
- News worker: Railway cron (every 2 days) -> RSS feeds -> Claude Haiku relevance gate -> Supabase

## Local development

    cp .env.example .env.local   # fill in Supabase + Anthropic keys
    npm install
    npm run dev                  # http://localhost:3000
    npm run fetch-news           # run the news worker once manually

## Database

Apply supabase/schema.sql in the Supabase SQL editor (one-time setup).

## Deployment (Railway)

Two services from this repo:

| Service | Start command | Env |
|---|---|---|
| web | npm run build + npm run start | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| news-worker | npm run fetch-news (cron 0 5 */2 * *) | same + ANTHROPIC_API_KEY |
