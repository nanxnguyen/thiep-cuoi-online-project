# Firebase services landscape (web / Next.js) — as of Sep 2026

## Which Firebase services are relevant for a consumer web app in 2026

### Takeaway
Firebase splits into "no-cost" (Analytics, FCM, Crashlytics, App Check, Performance, Remote Config, A/B Testing, In-App Messaging) and metered (Auth, Firestore, Storage, Functions, Hosting, Realtime DB) products; for a pure web consumer app the practical set is Auth, Firestore, Storage, FCM, Analytics, Remote Config, Performance Monitoring, and App Check — Crashlytics is still mobile-only.

### Cited Findings
- No-cost products are: "A/B Testing, Analytics, App Check, App Distribution, Cloud Messaging (FCM), Crashlytics, In-App Messaging, and Performance Monitoring." — [Source](https://firebase.google.com/pricing)
- Metered/paid-quota products include App Hosting + Hosting, Authentication (phone), Firestore, Storage, Functions, Realtime Database, Test Lab, Firebase AI Logic, Remote Config (new metered fetch pricing) — [Source](https://firebase.google.com/pricing)
- The FCM JavaScript API "lets you receive notification messages in web apps running in browsers that support the Push API" and "The FCM SDK is supported only in pages served over HTTPS. This is due to its use of service workers" — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- Firebase JS client SDK latest version is 12.19.0 ("Firebase JavaScript library for web and Node.js. Latest version: 12.19.0") — [Source](https://www.npmjs.com/package/firebase)
- firebase-admin latest version is 14.5.0 ("Firebase admin SDK for Node.js. Latest version: 14.5.0", Aug 2026) — [Source](https://www.npmjs.com/package/firebase-admin?activeTab=dependencies)
- Remote Config has a full Web SDK: `import { getRemoteConfig } from "firebase/remote-config"` plus `fetchAndActivate()`, with recommended production fetch interval of 12 hours — [Source](https://firebase.google.com/docs/remote-config/web/get-started)
- Remote Config pricing change: "This pricing takes effect starting September 1, 2026. No-cost up to 100,000 per day per project. Then, $0.000006 per request ($0.06/10K requests) for usage between 100,001 and 10,000,000 per day" — [Source](https://firebase.google.com/pricing)
- Auth web supports password, email-link, Google/Facebook/Apple/Twitter/GitHub/Microsoft/Yahoo, phone, OIDC, SAML, anonymous, custom auth, MFA (SMS + TOTP), auth-state persistence, redirect best practices — [Source](https://firebase.google.com/docs/app-check) (docs nav listing under Authentication > Web)
- Firestore Standard free quota: 1 GiB stored, 10 GiB/month egress, 50K reads/day, 20K writes/day, 20K deletes/day (Spark and Blaze no-cost tier identical) — [Source](https://firebase.google.com/pricing)
- Auth free tier: 50K MAU for Tier 1 (email, social, anonymous), 50 MAU for SAML/OIDC; beyond that $0.0055–$0.0025/MAU Tier 1, $0.015/MAU Tier 2; SMS billed per-message by region — [Source](https://blog.logto.io/firebase-authentication-pricing)
- Cloud Storage new `*.firebasestorage.app` buckets (Blaze no-cost): 5 GB stored, 100 GB/month download, 5K uploads/month, 50K downloads/month, and "No-cost quotas are only available for buckets in ... `us-central1`, `us-west1`, `us-east1`" — [Source](https://firebase.google.com/pricing)
- Crashlytics "is a lightweight, realtime crash reporter that helps you track, prioritize, and fix stability issues" — [Source](https://firebase.google.com/docs/crashlytics)
- "Firebase Crashlytics doesn't support web apps directly" (custom-workaround guide) — [Source](https://blog.kleinpixelagency.com/firebase-crashlytics-for-web-77c4af1d5687); consistent with long-standing Stack Overflow consensus "not supported at all" for web — [Source](https://stackoverflow.com/questions/54322479/can-we-use-firebase-crashlytics-for-our-web-application)
- Crashlytics-for-web was announced as incoming ("Firebase is bringing Crashlytics support to web apps... Crashlytics for Web is finally happening", Feb 2026 Firebase team post on X) with an open RFC "Web Observability with Crashlytics #9273" requesting source-map upload support — [Source](https://x.com/puf/status/1993392580499845454); [Source](https://github.com/firebase/firebase-js-sdk/discussions/9273)
- App Hosting (successor path for Next.js SSR hosting) Blaze: 10 GiB/month free bandwidth then $0.20/GiB uncached / $0.15/GiB cached, 5 GB storage free then $0.10/GB, plus underlying Cloud Run/Build/Registry/Logging charges — [Source](https://firebase.google.com/pricing)

### Inferences
- For a wedding-invitation consumer web app (Next.js 16 App Router): use Auth (Google + anonymous), Firestore, Storage, FCM, Analytics, Remote Config, Performance Monitoring, App Check. Skip Crashlytics on web for now; use Sentry or similar until Crashlytics-for-web ships.
- Pin `firebase@^12.x` (client) and `firebase-admin@^14.x` (server) versions; both are the current 2026 majors.

### Gaps
- Could not verify a GA date or JS API surface for Crashlytics-for-web; treat as "announced/in-RFC, not yet usable" until official docs list a Web get-started page.
- Next.js 16-specific Firebase sample code not found in official docs; integration patterns below are composed from current FCM web docs + community Next.js guides.

## How does FCM web push work technically (service worker, VAPID, permission flow, Next.js integration pattern)?

### Takeaway
FCM web push = Web Push Protocol via a `firebase-messaging-sw.js` service worker + VAPID key pair + `Notification.requestPermission()` + FID/token registration; sending is done server-side via FCM v1 API / Admin SDK. In Next.js App Router the service worker must live in `public/`, messaging code must be client-only, and tokens/FIDs are POSTed to your backend for storage.

### Cited Findings
- "The FCM Web interface uses Web credentials called VAPID keys, to authorize send requests to supported web push services... generate a new key pair or import your existing key pair through the Firebase console" (Settings > General > Cloud Messaging tab > Web configuration > Web Push certificates > Generate Key Pair) — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- Client wiring: `register(messaging, {vapidKey: "BKagOny0KF_2pCJQ3m....moL0ewzQ8rZu"})` — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- Permission flow: "first request notification permissions from the user with `Notification.requestPermission()`" — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- "FCM requires a `firebase-messaging-sw.js` file. Unless you already have a `firebase-messaging-sw.js` file, create an empty file with that name and place it in the root of your domain" — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- New 2026 registration model: `onRegistered(messaging, (installationId) => {...})` + `register(messaging, { vapidKey })` using Firebase Installation IDs (FIDs); triggered on manual register, FID change, or `pushsubscriptionchange` — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- Old model deprecated: "Access the registration token (deprecated)... This feature is deprecated. Use Firebase Installation IDs, as this method will be removed in a future release" (`getToken(messaging, { vapidKey })`) — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- VAPID explained: "A Push is a service that works behind the scenes of your browser... a Service Worker. The VAPID (Voluntary Application Server Identification)" key pair authenticates the application server to push services — [Source](https://medium.com/bawilabs/web-push-notifications-through-vapid-method-7d4d6927a006)
- Next.js pattern (community, stable across versions): register `/firebase-messaging-sw.js` from `public/` with `navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" })`, `await navigator.serviceWorker.ready` — [Source](https://docs.knock.app/tutorials/sending-web-push-notifications-with-fcm); dedicated Next.js+FCM walkthroughs exist — [Source](https://dev.to/na1969na/implementing-push-notifications-with-nextjs-and-firebase-cloud-messaging-4n6o); [Source](https://medium.com/entech-solutions/push-notifications-in-next-js-and-firebase-with-demo-and-full-code-f4ada05e5d24)
- Send path options: "Use the FCM v1 API", "Use the Admin SDK", "Use the Firebase console"; plus topics, device groups, and token-management best practices — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started) (docs nav)
- Test flow: "Send test message... In the field labeled Add an FCM registration token, enter your registration token. Select Test. After you select Test, the targeted client device, with the app in the background, should receive the notification" — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- New projects need the FCM Registration API enabled in Google Cloud console ("If you are using FCM for web and want to upgrade to SDK 6.7.0 or later, you must enable the FCM Registration API... New projects adding the FCM SDK have this API enabled by default") — [Source](https://firebase.google.com/docs/cloud-messaging/web/get-started)

### Inferences
- Recommended Next.js 16 App Router pattern: (1) `public/firebase-messaging-sw.js` with `importScripts` + `onBackgroundMessage` handler; (2) client component/hook that `initializeApp` + `getMessaging` + `Notification.requestPermission()` + `register({vapidKey: NEXT_PUBLIC_FCM_VAPID_KEY})` + `onRegistered` → POST FID to a Route Handler/Server Action storing it in Firestore; (3) foreground handler via `onMessage`; (4) send via `firebase-admin` `messaging.send()` (FCM v1) from Route Handler or Cloud Function. Keep all `firebase/messaging` imports out of Server Components (client-only, `window`/`Notification`/`serviceWorker` needed).
- Migrate any old `getToken()` code to `register()` + `onRegistered()` since token APIs are deprecated and slated for removal.

### Gaps
- No official Next.js 16 App Router sample in Firebase docs; `firebase-messaging-sw.js` interplay with Next.js PWA plugins (e.g. `next-pwa`) and Turbopack builds was not verified from primary sources.

## What are the free-tier limits and pricing gotchas for FCM, Analytics, Crashlytics?

### Takeaway
FCM, Analytics, and Crashlytics are all "No-cost" products with no metered overage line on the pricing page — the real cost risks for a small web app sit in Firestore reads, Storage egress/ops, Auth phone SMS, and the new Remote Config fetch billing.

### Cited Findings
- "#### Cloud Messaging (FCM) | No-cost", "#### Analytics | No-cost", "#### Crashlytics | No-cost" — no quota table rows, unlike Firestore/Storage/Hosting — [Source](https://firebase.google.com/pricing)
- "No-cost Products: A/B Testing, Analytics, App Check, App Distribution, Cloud Messaging (FCM), Crashlytics, In-App Messaging, and Performance Monitoring" — [Source](https://firebase.google.com/pricing)
- Firestore gotchas: free only 50K reads/20K writes/20K deletes per day and 1 GiB stored + 10 GiB/month egress; overage billed per Google Cloud pricing; community reports costs spike from inefficient queries (each document read counts) — [Source](https://firebase.google.com/pricing); [Source](https://www.reddit.com/r/Firebase/comments/1d8r3bb/firestore_free_tier_gets_expensive_really_quick/)
- Storage gotcha: new buckets' free download-ops quota is only 50K/month and uploads 5K/month; region-restricted (`us-central1/us-west1/us-east1`) for free tier — [Source](https://firebase.google.com/pricing)
- Auth gotcha: only 10 free SMS/day; per-SMS regional rates ($0.01–$0.46) apply on Blaze with worked example of ~$197 for ~20K SMS — [Source](https://blog.logto.io/firebase-authentication-pricing)
- Remote Config NEW gotcha (effective Sep 1, 2026): free only to 100K fetches/day/project, then $0.06/10K up to 10M/day, $0.01/10K above — a polling-heavy web client can now incur charges; fetch throttling/minimum-interval tuning matters — [Source](https://firebase.google.com/pricing)
- Hosting gotcha: only 360 MB/day transfer free, then $0.15/GB — image-heavy invitation pages served from Hosting can exceed this — [Source](https://firebase.google.com/pricing)
- Reviewer consensus: "Generous free tier... but repeatedly flag unpredictable billing, cost spikes from inefficient queries, and no way to cap spend" — [Source](https://checkthat.ai/brands/firebase/pricing)

### Inferences
- For this project: FCM/Analytics/Crashlytics cost ≈ $0 at any realistic invitation traffic. Budget attention should go to: Firestore read count (denormalize + paginate + cache), Storage image sizes (compress, CDN), avoiding phone-auth SMS, and setting Remote Config `minimumFetchIntervalMillis` to ≥1h (docs recommend 12h production default).
- Set up Blaze budget alerts even while expecting $0; Spark blocks Functions-to-non-Google egress and has no Functions free lunch beyond trial, so background send jobs may force Blaze.

### Gaps
- FCM has documented throttling/quotas pages (message deprioritization, collapsible-message limits) but no numeric free-tier cap was found on the pricing page; exact high-volume FCM throughput limits were not extracted.

## What is Firebase App Check and how does it protect public API endpoints from bots/abuse?

### Takeaway
App Check attests that traffic comes from your genuine app (reCAPTCHA v3/Enterprise on web) and issues short-lived tokens that Firebase services — and your own APIs via Admin SDK verification — can enforce, blocking bots, scrapers, and API abuse.

### Cited Findings
- Web providers: "Get started using App Check with reCAPTCHA v3 in web apps" and "Get started using App Check with reCAPTCHA Enterprise in web apps" — [Source](https://firebase.google.com/docs/app-check/web/recaptcha-provider); [Source](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- Setup: register site for reCAPTCHA v3, put secret key in Firebase console Security > App Check > Apps tab, then `initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true })` (modular) — [Source](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider); [Source](https://developers.google.com/maps/documentation/javascript/places-app-check)
- Enforcement model: "App Check... requiring it to access the products you've turned it on for" (Firestore, Storage, Functions, Realtime DB enforcement toggles) — [Source](https://www.reddit.com/r/Firebase/comments/s6z299/recaptcha_v3_and_firebase_is_appcheck_enough_web/)
- Custom-backend protection: official docs cover "Protect custom resources — Send tokens from the client (Web)" + "Verify tokens on the backend" with Admin SDK — [Source](https://firebase.google.com/docs/app-check) (docs nav)
- Pricing: "App Check | No-cost, subject to quotas and limits that vary based on attestation provider" (i.e., reCAPTCHA quotas apply) — [Source](https://firebase.google.com/pricing)
- Debug flow for local dev: dedicated "Debug & test providers > Web" docs exist — [Source](https://firebase.google.com/docs/app-check) (docs nav)
- Known limitation: "Web AppCheck is not GDPR compliant #5095 — App Check in web apps uses ReCAPTCHA v3 by default" (loads Google risk-scoring on every page; EU consent implications) — [Source](https://github.com/firebase/firebase-js-sdk/discussions/5095)

### Inferences
- For public invitation endpoints (RSVP submit, wish wall, view-counter): enable App Check enforcement on Firestore/Functions, attach App Check tokens from the Next.js client (`getToken(appCheck)`), and verify with `firebase-admin` `appCheck().verifyToken()` in Route Handlers before writing. This stops trivial curl/bot spam but is not a CAPTCHA challenge — pair with rate limiting + Firestore rules.
- Prefer reCAPTCHA Enterprise provider for production (score-based, per-domain keys, never add localhost to prod keys); use debug provider for localhost/dev.

### Gaps
- Exact reCAPTCHA Enterprise free quota (10K assessments/month historically) was not re-verified against a 2026 primary source; confirm in Google Cloud reCAPTCHA pricing before launch.
