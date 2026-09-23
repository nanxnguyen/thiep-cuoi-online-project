# Phase 6A Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add email/password accounts, JWT sessions, and claiming existing invitations with their edit key.

**Architecture:** Keep the existing edit-key invitation API intact. Add a small Spring Security/JWT account layer, an `owner_id` relation on invitations, and FE account pages/API helpers. Claiming an invitation verifies the existing edit key once, then associates the invitation with the authenticated user.

**Tech Stack:** Spring Boot 4.1.1, Spring MVC/JPA/Flyway, BCrypt, JWT, Next.js App Router, TypeScript, existing Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-23-account-phase6-design.md`

## Global Constraints

- No payment, trial, OAuth, password reset, or Donate in this plan.
- Passwords are never stored or returned in plaintext.
- JWT secret is required from environment in production.
- Existing public and edit-key flows remain compatible.
- Do not expose edit keys or JWTs in logs.
- All user-facing errors remain Vietnamese.

## Review Focus

- Duplicate/uppercase emails normalize to one account.
- Wrong password and expired/malformed JWT return 401 without leaking account existence.
- Claiming with a wrong edit key cannot attach an invitation.
- Claiming an invitation already owned by another account returns 409.
- Existing invitations with null `owner_id` and all existing edit-key endpoints still work.

### Task 1: Backend account persistence and migration

**Files:**
- Create: `src/main/resources/db/migration/V3__accounts.sql`
- Create: `src/main/java/com/moc/wedding/entity/Account.java`
- Create: `src/main/java/com/moc/wedding/repository/AccountRepository.java`
- Modify: `src/main/java/com/moc/wedding/entity/Invitation.java`
- Modify: `src/main/java/com/moc/wedding/repository/InvitationRepository.java`
- Test: `src/test/java/com/moc/wedding/repository/AccountRepositoryTest.java`

**Interfaces:**
- Produces `Account(id, email, passwordHash, createdAt)` and nullable `Invitation.owner`.

- [x] Add failing repository tests for normalized unique email and nullable owner on old invitations.
- [x] Run `./mvnw -q -Dtest=AccountRepositoryTest test`; confirmed expected compile failure before implementation.
- [x] Add `accounts` table and nullable `owner_id` foreign key/index to `invitations`; map JPA entities using the existing style.
- [x] Run focused test; passed.

### Task 2: JWT authentication service and endpoints

**Files:**
- Modify: `pom.xml`
- Modify: `src/main/resources/application.properties`
- Create: `src/main/java/com/moc/wedding/config/SecurityConfig.java`
- Create: `src/main/java/com/moc/wedding/config/JwtService.java`
- Create: `src/main/java/com/moc/wedding/config/JwtAuthenticationFilter.java`
- Create: `src/main/java/com/moc/wedding/service/AccountService.java`
- Create: `src/main/java/com/moc/wedding/controller/AuthController.java`
- Create: `src/main/java/com/moc/wedding/dto/AuthRequest.java`
- Create: `src/main/java/com/moc/wedding/dto/AuthResponse.java`
- Create: `src/main/java/com/moc/wedding/dto/AccountResponse.java`
- Test: `src/test/java/com/moc/wedding/controller/AuthControllerTest.java`

**Interfaces:**
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- Produces `Authorization: Bearer` authentication and `{ accessToken, user }`.

- [ ] Add failing MockMvc tests for register, duplicate email, login, bad password, and `/me` with/without bearer token.
- [ ] Run focused tests; expect authentication classes/endpoints to be missing.
- [ ] Add the smallest JWT implementation using a maintained JWT library, BCrypt password hashing, normalized email, 8-character minimum password, and environment-backed secret/expiry.
- [ ] Configure public auth routes, keep existing public routes public, require authentication only for account routes, and return Vietnamese 401/400/409 errors.
- [ ] Run `./mvnw test`; expect all backend tests pass.

### Task 3: Claim and list owned invitations

**Files:**
- Create: `src/main/java/com/moc/wedding/controller/AccountInvitationController.java`
- Create: `src/main/java/com/moc/wedding/dto/ClaimInvitationRequest.java`
- Create: `src/main/java/com/moc/wedding/dto/AccountInvitationResponse.java`
- Modify: `src/main/java/com/moc/wedding/service/InvitationService.java`
- Test: `src/test/java/com/moc/wedding/controller/AccountInvitationControllerTest.java`

**Interfaces:**
- `GET /api/account/invitations`
- `POST /api/account/invitations/claim` with `{ id, key }`.

- [ ] Add failing tests for empty list, successful claim, wrong key, nonexistent invitation, and already-owned invitation.
- [ ] Run focused tests and confirm failure.
- [ ] Implement owner-filtered listing and transactional claim using the existing edit-key hash verifier; never return key/hash.
- [ ] Run `./mvnw test` and verify legacy invitation tests remain green.

### Task 4: FE API/session helpers and account pages

**Files:**
- Modify: `lib/api.ts`
- Create: `lib/account.ts`
- Create: `tests/account.test.ts`
- Create: `app/account/page.tsx`
- Create: `components/account/AccountClient.tsx`
- Create: `components/account/account.css`
- Modify: `components/site/SiteHeader.tsx`
- Modify: `components/studio/StudioHome.tsx`

**Interfaces:**
- `createApi` gains `register`, `login`, `me`, `listAccountInvitations`, `claimInvitation`.
- `lib/account.ts` exposes storage-safe token read/write/remove and auth header construction.

- [ ] Add failing pure tests for account token storage, email normalization, and edit-link claim payload parsing via existing `parseEditLink`.
- [ ] Run `npm test -- tests/account.test.ts`; expect missing helpers.
- [ ] Implement API methods and account UI with register/login toggle, authenticated list, claim form, logout, loading/error states, and links back to Studio.
- [ ] Keep all account UI `noindex`; do not place passwords or tokens in URL/localStorage.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.

### Task 5: Full verification and progress handoff

**Files:**
- Modify: `PROGRESS.md`
- Modify: `docs/superpowers/plans/2026-09-23-account-phase6a.md`

- [ ] Run FE `npm test`, `npm run typecheck`, `npm run build`.
- [ ] Run BE `./mvnw test`.
- [ ] Mark completed tasks in this plan only after their commands pass.
- [ ] Update `PROGRESS.md` with Phase 6A status, exact test counts, remaining Donate inputs, and a dated journal entry.
- [ ] Leave commits to the project owner; do not run `git commit`.
