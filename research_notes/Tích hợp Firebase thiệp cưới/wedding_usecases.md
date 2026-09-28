# Firebase Use Cases for Online Wedding Invitation App (Vietnam market, 2026)

## Push notifications: what owners and guests expect, and how wedding platforms actually notify

### Takeaway
For a wedding-invitation product, the proven notification loop is email/dashboard + messaging-app reminders (Zalo/WhatsApp/SMS), not web push; major platforms (The Knot, Zola, Joy, RSVPify, Invyt) rely on automated reminder emails and broadcast messages to non-responders, and web push is structurally weak in a Zalo-dominated, mobile-Safari-heavy market.

### Cited Findings
- 2026 best practice is a communication rhythm: save-the-date, formal invitation, RSVP reminder before deadline, final logistics update — with reminders sent only to guests who have not replied — [WhiteClover](https://whiteclover.io/post/latest-wedding-invitation-trends-2026)
- Recommended cadence: first reminder ~3 weeks before RSVP deadline, second 5–7 days before, final logistics message 2–3 days before the wedding — [WhiteClover](https://whiteclover.io/post/latest-wedding-invitation-trends-2026)
- The Knot syncs invitations with guest list and RSVP system including automated reminder emails to non-responders — [JuneWeddingZone](https://juneweddingzone.com/8-best-ways-to-send-wedding-invitations-digital-trendy-practical/)
- RSVPify sends automatic confirmations and reminders and lets couples send updates about schedule changes or travel details from the dashboard — [RSVPify](https://rsvpify.com/weddings/)
- Invyt's playbook: week-before-wedding broadcast to all confirmed guests with parking/arrival/day-of reminders, plus dashboard "not yet responded" filter for follow-up — [Invyt](https://invyt.io/wedding-invitations)
- RSVP.link guide: send reminders instantly to guests who haven't RSVP'd; totals update automatically when guests change RSVP — [RSVP.link](https://rsvp.link/guides/wedding/online-wedding-invitations-with-rsvp-complete-guide)
- Hybrid paper+digital is the 2026 norm: QR code on printed invite linking to RSVP page; 38% of UK invitations include a QR code, mostly for RSVP and live-update wedding websites — [WeddingsHub](https://weddingshub.co.uk/articles/wedding-stationery-trends-2026/)
- Zalo is Vietnam's dominant channel: 79.6M monthly active users end-2025, ~2.1B messages/day — [Vietnam.vn](https://www.vietnam.vn/en/gan-80-trieu-nguoi-dung-zalo-moi-thang-trong-nam-2025-post1623499.html); 79% messaging penetration vs Facebook 69%, Messenger 54% (Decision Lab Q1/2025) — [Vietnam.vn](https://www.vietnam.vn/en/zalo-tiep-tuc-bo-xa-facebook-va-messenger-tai-viet-nam); 98% app usage rate in Q&Me March 2026 report — [BaoNgheAn](https://baonghean.vn/en/zalo-thong-tri-thi-truong-ung-dung-di-dong-viet-nam-nam-2026-voi-ty-le-su-dung-cham-muc-98-10329834.html)
- Vietnam mobile browsers June 2026: Chrome ~62.9%, Safari ~29.4% — [Statcounter](https://gs.statcounter.com/browser-market-share/mobile/viet-nam)
- Vietnamese businesses use Zalo Mini App + Push Notification / Zalo OA messages and ZNS (Zalo Notification Service, template-based API to phone numbers, no OA-follow required) for reminders, promos, order updates — [Miniapp.vn](https://miniapp.vn/mini-app-va-push-notification-tren-zalo/), [Antsomi CDP docs](https://docs.antsomi.com/cdp-365-user-guide/quick-start-guide/how-to-send-zalo-notification-service-using-cdp-365)

### Inferences
- Owner-side expectation: instant "new RSVP / new wish" awareness + a non-responder list to chase. This can be delivered via email + in-dashboard realtime badge today; web push adds little until owners explicitly opt in.
- Guest-side expectation: a reminder nudge before the deadline and logistics before the day. In Vietnam this nudge must travel over Zalo/share-link re-send (or ZNS/OA if the business goes the Mini App route), because guests will not have installed anything.
- Competitor gap to exploit: none of the global platforms do Zalo-native reminders; a "Nhắc khách chưa phản hồi qua Zalo" (copy-link + ZNS-ready guest phone list) feature is a local differentiator.

### Gaps
- No reliable public data found on Vietnamese couples' stated preference for push vs Zalo vs SMS reminders specifically for weddings; inference is from platform behavior + Zalo penetration stats.
- No source found confirming any Vietnamese wedding-invitation SaaS already offering ZNS integration.

## Candidate Firebase integrations: value, effort, dependencies, privacy

### Takeaway
Analytics (funnel studio→publish) and Crashlytics-adjacent error tracking are the cheapest first wins; Remote Config and App Check are small follow-ups; FCM web push is the lowest value/effort ratio for guests and only marginal for owners.

### Cited Findings
- FCM web requires HTTPS + service worker + VAPID key pair + `Notification.requestPermission()` + `firebase-messaging-sw.js` at domain root; tokens stored server-side for targeting — [Firebase FCM web get-started](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- FCM supports browsers with the Push API; Safari supported only on 16.4+ (macOS & iOS) — [FCMDebug setup guide](https://fcmdebug.com/docs/web)
- FCM itself is no-cost with default quota 600k downstream messages/minute covering >99% of developers — [Firebase FCM product page](https://firebase.google.com/products/cloud-messaging), [FCM throttling docs](https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas)
- Crashlytics is no-cost, but officially supports only iOS/Android/Flutter/Unity — no web platform in the supported list — [Firebase Crashlytics docs](https://firebase.google.com/docs/crashlytics); web Crashlytics exists only as an early-access `@firebase/crashlytics` npm package (v0.0.1-eap) — [npm](https://www.npmjs.com/package/@firebase/crashlytics); community workaround is a custom error pipeline to Firebase for web apps — [Kleinpixel guide](https://blog.kleinpixelagency.com/implementing-a-custom-crashlytics-system-for-web-apps-with-firebase-77c4af1d5687)
- Firebase Analytics (Google Analytics for Firebase) web SDK logs events via `logEvent()`, up to 500 custom event types, with automatic events + user properties out of the box — [Analytics web events](https://firebase.google.com/docs/analytics/web/events), [Analytics web get-started](https://firebase.google.com/docs/analytics/web/get-started); Next.js client instrumentation (`instrumentation-client.ts`, `useReportWebVitals`) is the natural hook point — [Next.js analytics guide](http://nextjs.org/docs/app/guides/analytics)
- Remote Config web: define parameters in cloud, override in-app defaults without redeploy; JS SDK `getRemoteConfig()`; Analytics integration enables audience/user-property targeting (data-sharing must be enabled) — [Remote Config](https://firebase.google.com/docs/remote-config), [Remote Config web get-started](https://firebase.google.com/docs/remote-config/web/get-started), [Remote Config + Analytics](https://firebase.google.com/docs/remote-config/config-analytics); realtime `onConfigUpdated` is NOT supported on web — [flutterfire issue](https://github.com/firebase/flutterfire/issues/15684)
- App Check web uses invisible score-based reCAPTCHA (v3 or Enterprise, 0.0–1.0 score, default threshold 0.5; Enterprise gives 10k assessments/month free); SDK `initializeAppCheck()` before any Firebase access; enforcement is per-product opt-in — [App Check reCAPTCHA v3](https://firebase.google.com/docs/app-check/web/recaptcha-provider), [App Check reCAPTCHA Enterprise](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- Firebase no-cost products (any plan): FCM, Crashlytics, Remote Config, App Check, Performance Monitoring, A/B Testing — [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)

### Prioritized use-case table (Next.js, mobile-first, Zalo-sharing)

| # | Use case | Value | Effort | Dependencies | Privacy / VN notes |
|---|----------|-------|--------|--------------|---------------------|
| 1 | Analytics funnel: studio→preview→publish, guest view→RSVP submit, wish submit | HIGH — answers "where do owners drop off / which templates convert"; powers all later A/B tests | 1–2 days (SDK init client-side, ~10 custom events, DebugView verify) | Firebase project + GA4 property; consent banner; route-change logging in App Router | Medium: GA4 = Google data processing; needs cookie/consent notice in Vietnamese; ad-blockers undercount Zalo in-app browser traffic — treat as directional |
| 2 | JS error tracking (Crashlytics-if-GA vs Sentry) | HIGH — public guest pages must not break on wedding week; RSVP submit failures = lost customers | 0.5–1 day (global error boundary + `window.onerror`/unhandledrejection → log endpoint) | Decision: wait for web-Crashlytics GA vs adopt Sentry now | Low: stack traces may contain guest names/messages — scrub PII before logging |
| 3 | Remote Config feature flags (new templates, RSVP-deadline reminders, maintenance banner) | MEDIUM — kill-switch + gradual rollout without redeploy; pairs with Analytics audiences | 1 day (3–5 params, defaults in code, 12h fetch) | Analytics (for targeting); naming convention doc | Low: avoid putting personal data in flag conditions |
| 4 | App Check (reCAPTCHA Enterprise) on RSVP/wish write paths | MEDIUM — raises cost of RSVP/wish spam bots once abuse appears; invisible to users | 1–2 days (register domains, init SDK, enforce on backend/Firestore) | Backend enforcement point (Cloud Functions/API route); monitor mode before enforce | Medium: reCAPTCHA scores EU/VN users alike; over-strict threshold (e.g. 1.0 explicitly discouraged) blocks legit guests on slow networks — [docs](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider?hl=zh-cn) |
| 5 | FCM owner alerts (new RSVP / new wish) | MEDIUM-LOW — nice-to-have; email + realtime dashboard badge covers 90% of need; only pays if owners enable push in studio | 3–5 days (VAPID, SW file, permission UX, token store, Admin SDK sender, cleanup of dead tokens) | HTTPS + `/firebase-messaging-sw.js`; token table + Cloud Function trigger; dead-token pruning on 404/410 | Low-medium: owner-only opt-in; must explain why permission is asked; token = personal data, allow revoke |
| 6 | FCM guest reminders (T-7/T-1 before wedding) | LOW — structurally blocked (see UX pitfalls); Zalo re-share + ZNS/OA path dominates | 5+ days + product risk | Guest opt-in store per invitation + scheduler (Cloud Scheduler/Functions); timezone handling | HIGH: guests are one-time visitors; prompting them for push burns trust; VN privacy expectations + spam sensitivity high — do NOT build first |

### Inferences
- Sequencing by value/effort: Analytics (1–2d, unlocks measurement) → error tracking (0.5–1d, protects revenue moments) → Remote Config (1d, safe rollouts) → App Check in monitor mode (1–2d, enable enforcement only when spam observed) → FCM owner alerts (only after dashboard/email loop exists) → guest push last/never.
- App Check should NOT be the first integration: with no observed spam it adds reCAPTCHA dependency and failure modes for zero visible benefit; ship in log-only mode first.
- If the team insists on "one Firebase integration" as a milestone, Analytics is the correct one: every later decision (template ranking, paywall, reminder copy) needs its funnel.

### Gaps
- No public benchmark found for RSVP-spam rates on wedding sites, so App Check ROI timing ("when abuse appears") cannot be quantified; needs internal logging of duplicate/suspicious submits first.
- Firebase web-Crashlytics GA timeline unconfirmed (only EAP package observed); team should verify docs at implementation time.

## UX pitfalls of web push (permission timing, iOS, Zalo in-app browser)

### Takeaway
Web push permission is a one-shot, easily-burned asset: prompt on load and the user denies forever; on iOS the prompt only works inside an installed Home-Screen PWA (never a Safari tab, never a Zalo in-app view); Zalo's in-app browser has no documented Push API/service-worker support — so guest push will fail for the majority of Vietnamese wedding traffic.

### Cited Findings
- Best practice: ask only when value is obvious (post-action, e.g. after booking/checkout), never on landing; use a double-permission (custom soft prompt → native prompt) so a "no" to the soft prompt costs nothing — [web.dev Permission UX](https://web.dev/articles/push-notifications-permissions-ux), [MDN Push best practices](https://developer.mozilla.org/en-US/docs/Web/API/Push_API/Best_Practices), [OneSignal web-prompt guide](https://onesignal.com/blog/best-practices-to-master-web-notifications-a-7-step-guide)
- The native prompt can effectively be shown only a very limited number of times (once on iOS, ~twice on Android; three dismissals in a row on same site can silence future prompts); denied users must re-enable manually in settings — [OneSignal prompt guide](https://documentation.onesignal.com/docs/en/prompt-for-push-permissions), [USENIX Sec'21 Chrome prompt study](https://www.usenix.org/system/files/sec21summer_bilogrevic.pdf)
- Chrome telemetry: notification prompts are ~74% of all permission prompts; most users deny on most sites; Chrome now auto-treats abusive prompters with quieter UI — [USENIX Sec'21](https://www.usenix.org/system/files/sec21summer_bilogrevic.pdf)
- iOS/iPadOS 16.4+: Web Push works ONLY for Home-Screen-installed PWAs; Safari tabs cannot subscribe; permission must come from a user gesture; `userVisibleOnly: true` mandatory (no silent push); Safari revokes permission if a push arrives without a visible notification — [OpenPWA iOS guide](https://openpwa.net/reference/notifications/ios-safari-push/), [Apple web-push docs](https://sosumi.ai/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers), [web-push-notifications.com install gate](https://www.web-push-notifications.com/core-protocols-browser-implementation/safari-ios-web-push-integration/ios-web-push-requires-add-to-home-screen/)
- Safari has no `beforeinstallprompt`; user must manually Share → Add to Home Screen; `appinstalled`/`getInstalledRelatedApps` unavailable; Chrome shares storage between site and installed PWA but Safari copies-then-splits it (auth/session pitfalls) — [Alert Hero PWA limits test](https://alert-hero.com/blog/testing-the-limits-of-pwas)
- Apple is evolving to Declarative Web Push (iOS 18.4+, macOS 15.5+) — removes the service-worker requirement but NOT the Home-Screen requirement — [WebKit blog](https://webkit.org/blog/16535/meet-declarative-web-push/), [WWDC25 session](https://developer.apple.com/videos/play/wwdc2025/235/)
- Real-world verdict: "Web Push on iOS is nearing its one year anniversary. It's still mostly useless" (install gate buries adoption) — [Adactio/Jeremy Keith via Webventures](https://adactio.com/links/20833); killed-app notification tap opens Safari instead of the PWA (known WebKit bug, unfixed as of 2025) — [gmux notes](https://gmux.app/planned/mobile-notifications/)
- Zalo Mini Apps do NOT offer native push directly; notifications go as OA messages/ZNS to the user — [Zalo Mini App community](https://miniapp.zaloplatforms.com/community/7271734978731402054/ve-zalooa-notification); third-party comparison notes web push as "difficult notification integration" vs Zalo Mini App's integrated ZNS/remarketing — [Di4L comparison](https://di4l.vn/blog-detail/comparison-web-vs-mobile-app-vs-zalo-mini-app)

### Inferences
- Guest web push is a dead end for this product: guests arrive via a Zalo-shared link inside Zalo's in-app browser or mobile Safari/Chrome tab — exactly the contexts where subscription is impossible (iOS) or permission is denied (cold prompt, one-time visit). Building it burns eng weeks for ~0 reachable guests.
- Owner web push is viable but narrow: owners are repeat desktop/Chrome users who may grant permission in studio settings ("Báo khi có RSVP mới"). Gate strictly behind an explicit settings toggle + soft prompt, desktop-first.
- Correct VN reminder architecture: in-app dashboard + email for owners; for guests, "copy reminder text + link" re-share via Zalo, optional ZNS/OA later — not FCM.

### Gaps
- No authoritative Zalo developer doc found stating in-app-browser service-worker/Push API support status; the inference (unsupported) rests on Mini-App/OA messaging model + third-party comparisons, not a direct Zalo WebView spec. Worth one direct test: open a push-enabled page in Zalo in-app browser on Android + iOS and check `('serviceWorker' in navigator) && ('PushManager' in window)`.
- No current (2026) stat found on what share of Vietnamese wedding guests open invites inside Zalo in-app browser vs system browser; assumed dominant from Zalo penetration — needs product analytics (UTM/`navigator.userAgent` logging) to confirm.

## Sequencing: which Firebase integration first

### Takeaway
Do Firebase Analytics first (best value/effort, ~1–2 days, free, unlocks everything else); FCM — especially guest reminders — should be explicitly deprioritized.

### Cited Findings
- Analytics/Performance/Remote Config/Crashlytics/App Check/FCM are all no-cost products on any Firebase plan — cost does not discriminate; effort and reach do — [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firebase pricing](http://firebase.google.com/pricing)
- Wedding platforms' actual engagement loop (reminder emails, broadcasts, non-responder filters) needs no FCM at all — [RSVPify](https://rsvpify.com/weddings/), [Invyt](https://invyt.io/wedding-invitations), [The Knot via JuneWeddingZone](https://juneweddingzone.com/8-best-ways-to-send-wedding-invitations-digital-trendy-practical/)
- FCM web push's reachable audience in this product's guest flow is near-zero (install gate + in-app browser + one-time visit), while Analytics instruments 100% of page views from day one — install-gate sources above + [Analytics get-started](https://firebase.google.com/docs/analytics/web/get-started)

### Recommended order (with exit criteria)
1. **Analytics funnel (1–2d)** — events: `studio_start`, `template_select`, `preview`, `publish`, `guest_view`, `rsvp_submit`, `wish_submit`; ship + verify in DebugView; exit: studio→publish conversion visible.
2. **Error tracking (0.5–1d)** — boundary + global handlers on RSVP/wish submit paths; exit: failed-submit alert wired (even if via Sentry, not Crashlytics-web).
3. **Remote Config flags (1d)** — `new_template_enabled`, `reminder_nudge_enabled`, `maintenance_banner`; exit: one flag toggled from console without redeploy.
4. **App Check monitor mode (1–2d)** — log scores on write endpoints; enforce only if spam rate justifies; exit: score distribution reviewed.
5. **FCM owner alerts (3–5d, optional)** — only after steps 1–2; behind explicit opt-in toggle; exit: owner receives test "new RSVP" notification on desktop Chrome.
6. **Guest reminders via Zalo-share/ZNS spike, NOT FCM** — revisit only if data shows guests returning in system browsers AND opting in, which current evidence says will not happen.

### Inferences
- Total for steps 1–3 is under a week and converts the product from "flying blind" to measured + safely flaggable; FCM-first would spend the same week reaching almost no users.
- The report-writer can frame the headline as: "Measure first (Analytics), protect the money moment (error tracking), control rollout (Remote Config), harden later (App Check), notify owners selectively (FCM), never chase guest web push in a Zalo market."

### Gaps
- Effort estimates are engineering judgment calibrated to Next.js + Firebase docs, not vendor quotes; team velocity and existing backend shape (API routes vs Cloud Functions) will shift FCM/App Check by ±days.
