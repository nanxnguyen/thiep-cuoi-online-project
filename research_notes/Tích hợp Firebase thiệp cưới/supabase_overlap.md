# Supabase vs Firebase — Functional Overlap (as of 2026)

## Feature-by-feature overlap: auth, database, storage, realtime, functions

### Takeaway
For a project already on Supabase (Postgres + Auth + Storage + Realtime + Edge Functions), adopting Firestore/Auth/Storage/Cloud Functions would almost entirely duplicate existing functionality; only Firebase's mobile/growth services add something new.

### Cited Findings
- Supabase's core is a single Postgres instance per project with auto-generated REST/GraphQL APIs, Realtime subscriptions, Storage, and RLS; architecture diagram shows GoTrue, PostgREST, Realtime, Storage, Functions all backed by one Postgres — [Supabase Architecture Docs](https://supabase.com/docs/guides/getting-started/architecture)
- Comparison table (2026): Supabase Postgres vs Firebase Firestore + Realtime DB + Data Connect; Supabase Auth vs Firebase Auth both cover email/social/phone/MFA/passkeys/anonymous; Supabase Edge Functions (Deno/TS) vs Cloud Functions (Node/Python/Go/Java/.NET); Supabase S3-compatible storage with RLS vs GCS storage with Security Rules — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Both platforms cover mainstream auth cases — email/password, OAuth, phone, MFA, and passkeys GA on both in 2025; Supabase enforces access via Postgres RLS in SQL while Firebase uses Security Rules DSL per service (Data Connect uses IAM + per-query auth) — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Supabase Edge Functions are server-side TypeScript on Deno, run globally at the edge, used for webhooks and third-party integrations (e.g. Stripe) — [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- Supabase explicitly positions itself as "an open-source alternative built on Postgres that offers similar services — auth, storage, real-time, and functions"; Firebase "combines a NoSQL database with authentication, file storage and serverless functions" — [Supabase vs Firebase page](https://supabase.com/alternatives/supabase-vs-firebase)
- Firestore added vector search and aggregation queries (count/sum/avg); Firebase Realtime Database remains a lightweight JSON tree for mobile sync — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Firebase's realtime/offline is described as "gold standard for mobile": automatic sync, mature offline persistence with local queue + replay, conflict resolution; Supabase Realtime v2 (logical replication + Phoenix Channels) supports table/row-level INSERT/UPDATE/DELETE subscriptions, presence, broadcast, but client offline support is "improving but still less mature" — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Community assessment: "Firebase is smoother out of the box" for realtime; "Supabase is better for nuanced use cases" via full SQL filters on live queries — [DEV Community 2025 comparison](https://dev.to/dev_tips/firebase-vs-supabase-in-2025-which-one-actually-scales-with-you-2374)

### Inferences
- Firestore, Firebase Auth, Firebase Storage, Cloud Functions/Realtime DB are pure duplicates of the existing Supabase stack — adopting them means two sources of truth with no new capability.
- Only exception within "overlap" services: Firebase offline persistence is genuinely more mature, which matters for offline-first mobile but not for a web wedding-invitation app.

### Gaps
- No head-to-head latency/throughput benchmarks found with reproducible methodology; performance claims are qualitative.

## What Firebase uniquely offers that Supabase lacks or does poorly

### Takeaway
Firebase's genuinely new capabilities vs Supabase are FCM push notifications, Crashlytics, Performance Monitoring, Remote Config, A/B Testing, Analytics, App Check, and In-App Messaging — Supabase has no native equivalents and officially recommends integrating FCM/OneSignal via Edge Functions.

### Cited Findings
- "Supabase doesn't have native push notification support" — self-hosted or cloud, you must integrate FCM/APNs; recommended pattern is database trigger → webhook → Edge Function → FCM — [Supascale FCM guide](https://www.supascale.app/blog/push-notifications-for-selfhosted-supabase-a-complete-fcm-gu)
- Supabase official docs push-notification example delegates delivery to Expo push / FCM / APNs via an Edge Function + database webhook, including `EXPO_ACCESS_TOKEN` secret setup — [Supabase Docs: Sending Push Notifications](https://supabase.com/docs/guides/functions/examples/push-notifications)
- Community standard pattern: insert row → database webhook → Edge Function → FCM HTTP v1 API using stored device tokens — [Medium: Realtime Push with Supabase Edge Functions + Firebase](https://medium.com/@vignarajj/real-time-push-notifications-with-supabase-edge-functions-and-firebase-581c691c610e)
- Supabase's official Flutter video guide sends push via "database webhook → Edge Function → FCM API" — [Supabase YouTube: Push to Flutter with Edge Functions & FCM](https://www.youtube.com/watch?v=CiSv9E6ZKVc)
- OneSignal is a listed Supabase partner integration using database webhooks + Edge Functions to send push — [Supabase Partners: OneSignal](https://supabase.com/partners/catalog/onesignal)
- Firebase Crashlytics is a "lightweight, realtime crash reporter" for Apple/Android/Flutter/Unity that groups crashes and highlights root cause; setup is add-SDK + auto-collect — [Firebase Crashlytics Docs](https://firebase.google.com/docs/crashlytics)
- Firebase Remote Config "lets you change the behavior and appearance of your app without requiring users to download an app update", usable as server-driven feature flags with audience segmentation — [Firebase Remote Config Docs](https://firebase.google.com/docs/remote-config)
- Firebase A/B Testing "streamlines the way you run, analyze, and scale product and marketing experiments", works with Remote Config + FCM + In-App Messaging, tracking retention/revenue/engagement via Google Analytics; A/B Testing for web launched March 2026 — [Firebase A/B Testing Docs](https://firebase.google.com/docs/ab-testing); [Firebase Blog: A/B Testing for web](https://firebase.blog/posts/2026/03/ab-testing-for-web)
- Firebase AI Logic SDK calls Gemini/Imagen from clients; Genkit GA for building AI features; Crashlytics AI Insights gives Gemini-generated crash analysis — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Firebase SQL Connect (renamed from Data Connect, April 2026) is a managed Cloud SQL for PostgreSQL with GraphQL layer and realtime sync, Kotlin/Swift/Flutter/Web SDKs — [Firebase SQL Connect Docs](https://firebase.google.com/docs/sql-connect); [Firebase Blog: Data Connect → SQL Connect](https://firebase.blog/posts/2026/04/whats-new-sql-connect)

### Inferences
- For a Supabase-primary project, the Firebase services worth adopting are narrowly: FCM (push), and optionally Crashlytics, Analytics, Remote Config, App Check — none of which require migrating data or auth.
- Firebase SQL Connect/Data Connect does not add value when Postgres already lives in Supabase; it would create a second Postgres to manage.

### Gaps
- Exact FCM quotas/pricing lines were not re-verified from the pricing page in this pass; FCM is historically no-cost but volume/rate limits should be confirmed before launch planning.
- App Check and Performance Monitoring specifics were not deep-read; treat as standard Firebase client SDKs, not blockers.

## What Supabase does better that Firebase cannot replace

### Takeaway
Supabase's irreplaceable core is real relational Postgres (SQL, joins, ACID, extensions) with RLS as a single authorization model, plus open-source self-hosting — Firebase's NoSQL services and even its Cloud SQL wrapper do not reproduce this.

### Cited Findings
- Supabase: "We do not abstract the Postgres database — you can access it with full privileges"; choice of Postgres over NoSQL was deliberate — [Supabase Architecture Docs](https://supabase.com/docs/guides/getting-started/architecture)
- Supabase per-project Postgres gives full ACID, joins, CTEs, stored procedures, triggers, extensions (pgvector, PostGIS, pgmq, pg_cron, pg_mooncake for Iceberg), physical read replicas, RLS as primary authorization — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Supabase is open-source (Apache 2.0 for most components), self-hostable via Docker Compose/K8s; "no data leaves your infrastructure" — relevant for SOC 2/HIPAA/GDPR residency; Firebase is closed-source, Google-hosted, "no self-hosting path" — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Supabase's own comparison page: "you can inspect the code, contribute... and, if needed, host your own Supabase instance"; exit path is `pg_dump` — [Supabase vs Firebase page](https://supabase.com/alternatives/supabase-vs-firebase); [Bytebase philosophy section](https://www.bytebase.com/blog/supabase-vs-firebase)
- Firebase Data Connect/SQL Connect runs on Cloud SQL for Postgres but exposes a GraphQL-like layer — "you don't get direct SQL access in the same way; schema modeling is done in .gql files, and self-hosting isn't an option" — [Bytebase FAQ](https://www.bytebase.com/blog/supabase-vs-firebase)
- SQL Connect pricing starts "as low as $9.37/month" plus requires Blaze pay-as-you-go plan — [Firebase Pricing](https://firebase.google.com/pricing)
- Supabase AI story is Postgres-native: pgvector with HNSW, MCP server for AI agents, pg_mooncake Iceberg tables, dashboard AI assistant generating SQL/RLS — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Practitioner note: "Supabase's Postgres foundation means decades of PostgreSQL optimization for free — indexes, query plans, VACUUM — while Firestore requires learning an entirely different mental model" — [Tech-Insider 2026 comparison](https://tech-insider.org/supabase-vs-firebase-2026)

### Inferences
- Replacing Supabase Postgres with Firestore would be a downgrade for any relational workload (guest lists, RSVPs, orders, joins across events/guests) and would sacrifice RLS, SQL tooling, and the self-host exit door.
- Firebase SQL Connect narrows but does not close the gap: it adds a second managed Postgres behind a GraphQL facade rather than full SQL access.

### Gaps
- pgTAP-style testing was not found as a first-class Supabase feature in sources; Supabase migrations travel via SQL files + CLI (`supabase db push`) and per-PR Branching previews — test-framework specifics remain unverified.

## Risks and costs of running both backends in parallel

### Takeaway
Dual-backend means two bills with incompatible pricing models, two auth systems requiring explicit bridging, and data-sync/lock-in overhead — viable only if Firebase is scoped to stateless edge services (push/crash/analytics), never as a second database.

### Cited Findings
- Pricing models differ fundamentally: Supabase is tiered flat (Free / $25 Pro per project / $599 Team / custom) while Firebase is usage-based Blaze pay-as-you-go per operation on top of Spark free tier — "fixed-price buffet vs à la carte" — [Bytebase 2026 comparison](https://www.bytebase.com/blog/supabase-vs-firebase)
- Worked example: 10k DAU + 10M reads/day estimated at $50–100/mo on Supabase vs $500–1,500/mo on Firebase (3–5x multiplier) because per-operation Firestore billing compounds with listeners/fan-out — [Justin McKelvey pricing analysis 2026](https://justinmckelvey.com/blog/supabase-vs-firebase)
- Practitioner warnings: Firestore per-document read/write/delete billing punishes unoptimized queries; Supabase charges for compute/storage, more predictable — [DB Pro Blog](https://www.dbpro.app/blog/supabase-vs-firebase); [Jake Prins 2024](https://www.jakeprins.com/blog/supabase-vs-firebase-2024)
- Firebase Auth + Supabase requires explicit bridging: register Firebase project ID as third-party auth, pass Firebase JWT via `accessToken`, assign `role: 'authenticated'` custom claim via blocking functions or onCreate + admin SDK backfill, and (self-hosted) add restrictive RLS policies since "Firebase Auth uses a single set of JWT signing keys for all projects" — unrelated Firebase JWTs could otherwise access data — [Supabase Docs: Firebase Auth](https://supabase.com/docs/guides/auth/third-party/firebase-auth)
- Bytebase FAQ: "Possible but uncommon. Teams sometimes use Firebase Auth + Cloud Messaging for mobile identity/push while keeping data in Supabase Postgres — the SDKs don't fight each other. More often, teams pick one platform and commit." — [Bytebase FAQ](https://www.bytebase.com/blog/supabase-vs-firebase)
- Supabase is self-hostable/open-source (exit via pg_dump); Firebase is proprietary with no self-host path — adding Firebase as a data store increases lock-in, adding it only for push/analytics does not — [Digital Applied 2026 guide](https://www.digitalapplied.com/blog/supabase-vs-firebase-2026-backend-comparison-guide)

### Inferences
- Cost risk concentrates in Firestore reads/writes and Cloud Functions invocations if Firebase is used as a database; scoping Firebase to FCM + Crashlytics + Analytics keeps marginal cost near zero while Supabase remains the billed system of record.
- Auth risk is the sharpest technical risk: two identity providers means JWT bridging, custom-claim backfill for existing users, and restrictive RLS hardening — avoid dual-auth unless a concrete Firebase-only need (e.g. phone auth UX) forces it.
- Operational risk: two consoles, two IAM models (RLS vs Security Rules), two log/monitoring surfaces, and any cross-system sync (e.g. mirroring users into Firestore) creates eventual-consistency bugs.

### Gaps
- No published case study found quantifying dual-bill overhead for a Supabase+FCM-only hybrid; cost estimates above are single-platform comparisons extrapolated to hybrid.
- Latency impact of Edge Function → FCM hop was not benchmarked in sources.

## Hybrid architectures documented (Supabase primary + Firebase for push/edge)

### Takeaway
The documented, Supabase-endorsed hybrid is Supabase as system of record + Firebase only for FCM push (and optionally Firebase Auth as IdP): DB webhook → Edge Function → FCM, with device tokens stored in Postgres.

### Cited Findings
- Supabase official push example: database webhook triggers Edge Function (`supabase/functions/push`), which calls Expo/FCM/APNs APIs; deploy via `supabase functions deploy push` + secrets — [Supabase Docs: Sending Push Notifications](https://supabase.com/docs/guides/functions/examples/push-notifications)
- Independent guide with full code: Supabase Edge Function (Deno) detects DB changes, fetches device tokens from the database, mints FCM access token, sends via FCM HTTP v1 API; deploy with `supabase functions deploy fcm-push` — [Medium: Realtime Push with Supabase Edge Functions + Firebase](https://medium.com/@vignarajj/real-time-push-notifications-with-supabase-edge-functions-and-firebase-581c691c610e)
- Self-hosted variant of the same pattern (trigger → webhook → Edge Function → FCM) framed as "reliable, scalable, works with any mobile framework" — [Supascale FCM guide](https://www.supascale.app/blog/push-notifications-for-selfhosted-supabase-a-complete-fcm-gu)
- Supabase YouTube walkthrough for Flutter: insert row → DB webhook → Edge Function → FCM API — [Supabase YouTube](https://www.youtube.com/watch?v=CiSv9E6ZKVc)
- Alternative push vendor on same pattern: OneSignal integration via DB webhooks + Edge Function, keyed on Supabase user ID — [Supabase Partners: OneSignal](https://supabase.com/partners/catalog/onesignal)
- Supabase natively supports Firebase Auth as third-party IdP (dashboard Third-Party Auth section or `supabase/config.toml [auth.third_party.firebase]`), with per-platform `accessToken` wiring for Web/Flutter/Swift/Kotlin — [Supabase Docs: Firebase Auth](https://supabase.com/docs/guides/auth/third-party/firebase-auth)
- Community hybrid write-up: "Firebase acts as the authentication identity provider for Supabase" bridging both ecosystems — [Medium: SpireBase](https://medium.com/@darsboi_cjd/spirebase-building-with-supabase-firebase-fc8cc2bd1c00)
- Practitioner report of running both together (FlutterFlow context) noting Firebase is simple at first but relating data is difficult vs Supabase SQL — [Reddit FlutterFlow thread](https://www.reddit.com/r/FlutterFlow/comments/1hwm8rh/how_to_use_both_firebase_and_supabase_together_my)

### Inferences
- Recommended hybrid for the wedding-invitation project: keep Supabase for DB/Auth/Storage/Realtime/Edge Functions; add a Firebase project used exclusively for FCM (device-token table in Postgres + `fcm-push` Edge Function) and optionally Crashlytics/Analytics/Remote Config SDKs in the client — no Firestore, no Firebase Auth, no second database.
- This hybrid is additive, not migratory: if FCM is later replaced (e.g. OneSignal/Expo push), only the Edge Function changes; no data migration.

### Gaps
- No authoritative Supabase doc found for Crashlytics/Remote Config/App Check alongside Supabase; these are client-SDK additions assumed compatible but not covered by an official Supabase guide.
- FCM token lifecycle management (refresh, multi-device, cleanup on logout) is described per-guide but no single canonical schema was identified; implementation detail left to build phase.
