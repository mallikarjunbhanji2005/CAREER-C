# Implementation Plan: Ascend AI Career Ladder

## Overview

Implement the Ascend application incrementally: database schema first, then auth, then the AI pipeline, then the dashboard and verification UI, and finally CI/CD wiring. Each task builds directly on the previous one so no code is left orphaned.

## Tasks

- [x] 1. Project scaffolding and shared foundations
  - Initialise a Next.js 15 App Router project with TypeScript and Tailwind CSS
  - Install and configure Shadcn/UI (dark mode), Framer Motion, Zod, Vercel AI SDK (`ai`, `@ai-sdk/google`), and `@supabase/ssr`
  - Create `src/types/index.ts` with `Rung`, `Ladder`, `RungStatus`, `ProgressRecord`, `Profile`, `VerificationVerdict`, and `RungWithProgress` interfaces
  - Create `src/lib/utils.ts` with `cn` helper and any shared utilities
  - Create `.env.local.example` documenting all four required environment variables
  - _Requirements: 7.3_

- [x] 2. Database schema and Supabase client setup
  - [x] 2.1 Write Supabase migration file
    - Create `supabase/migrations/001_initial_schema.sql` with `profiles`, `ladders`, and `user_progress` DDL including UUID extension, foreign keys, status check constraint, and unique constraint on `(user_id, rung_id)`
    - Add RLS policies for all three tables (owner-only access via `auth.uid()`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.2 Create Supabase client helpers
    - Create `src/lib/supabase/client.ts` — browser client using anon key
    - Create `src/lib/supabase/server.ts` — server client using service role key with cookie-based session handling via `@supabase/ssr`
    - _Requirements: 7.3_

- [x] 3. Middleware and route protection
  - Create `src/middleware.ts` that refreshes the Supabase session on every request and redirects unauthenticated users away from `/onboarding`, `/dashboard`, and `/verify` to `/auth/sign-in`
  - Export the `config` matcher for those three path prefixes
  - _Requirements: 1.3_

- [x] 4. Authentication UI and flows
  - [x] 4.1 Implement root layout and landing page
    - Create `src/app/layout.tsx` with dark-mode class, global font, and Shadcn Toaster
    - Create `src/app/page.tsx` that redirects authenticated users to `/dashboard` and unauthenticated users to `/auth/sign-in`
    - _Requirements: 1.3_

  - [x] 4.2 Implement sign-up form and page
    - Create `src/components/auth/SignUpForm.tsx` — controlled form with email + password fields, calls `supabase.auth.signUp`, upserts a row into `profiles`, surfaces Supabase error messages via `useState`
    - Create `src/app/auth/sign-up/page.tsx` rendering `SignUpForm`
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 4.3 Implement sign-in form and page
    - Create `src/components/auth/SignInForm.tsx` — controlled form with email + password fields, calls `supabase.auth.signInWithPassword`, surfaces Supabase error messages via `useState`
    - Create `src/app/auth/sign-in/page.tsx` rendering `SignInForm`
    - Add sign-out handler that calls `supabase.auth.signOut` and redirects to `/auth/sign-in`
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 5. Checkpoint — auth baseline
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Zod schemas and AI library modules
  - [x] 6.1 Create Zod schemas
    - Create `src/lib/schemas/roadmap.ts` with `RungSchema` and `LadderSchema` (5–7 rungs, min-length constraints)
    - Create `src/lib/schemas/verification.ts` with `VerdictSchema` (`verdict` enum + `summary` string)
    - _Requirements: 3.2, 3.3, 5.5_

  - [x] 6.2 Implement roadmap AI module
    - Create `src/lib/ai/roadmap.ts` exporting `generateRoadmap(currentRole, targetRole)` using `generateObject` from the Vercel AI SDK with `google("gemini-1.5-pro")` and `LadderSchema`
    - Include the career-coach system prompt as specified in the design
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 6.3 Implement interviewer AI module
    - Create `src/lib/ai/interviewer.ts` exporting `buildSystemPrompt(rung: Rung): string` that injects rung title, description, and verification criteria into the interviewer system prompt
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 7. Roadmap generation API route
  - Create `src/app/api/generate-roadmap/route.ts` as a POST handler that:
    - Returns 401 if no valid session
    - Parses and validates `currentRole` / `targetRole` from the request body
    - Calls `generateRoadmap()` and Zod-validates the result
    - Inserts a row into `ladders` with `career_path_json`
    - Inserts `user_progress` rows for each rung (first = `active`, rest = `locked`)
    - Returns `{ ladder }` on success or a structured error on failure
  - _Requirements: 3.5, 3.6, 7.1, 7.4_

- [x] 8. Onboarding page
  - Create `src/components/onboarding/OnboardingForm.tsx` — controlled form with "Current Role" and "Target Role" fields, client-side non-empty validation, loading state while POSTing to `/api/generate-roadmap`, inline error display on failure, redirects to `/dashboard` on success
  - Create `src/app/onboarding/page.tsx` rendering `OnboardingForm`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 9. Checkpoint — roadmap generation end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Dashboard — career ladder UI
  - [x] 10.1 Implement RungCard component
    - Create `src/components/dashboard/RungCard.tsx` — renders rung title, description, and status badge
    - Apply status-based Tailwind classes: green glow ring for `completed`, `opacity-40` for `locked`, full opacity for `active`
    - Render a "Start Verification" button linking to `/verify/[rung_id]` only when status is `active`
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [x] 10.2 Implement LadderView component
    - Create `src/components/dashboard/LadderView.tsx` — accepts `RungWithProgress[]` and `targetRole`
    - Render `<h1>` with `targetRole`
    - Wrap rung list in Framer Motion `AnimatePresence` with staggered `motion.div` entry animations per card
    - _Requirements: 4.2, 4.6_

  - [x] 10.3 Implement dashboard page
    - Create `src/app/dashboard/page.tsx` as a Server Component that fetches the latest ladder and all progress records for the authenticated user from Supabase, merges them into `RungWithProgress[]`, and passes them to `LadderView`
    - _Requirements: 4.7_

- [x] 11. Verification API route
  - Create `src/app/api/verify/[rung_id]/route.ts` as a POST handler that:
    - Returns 401 if no valid session
    - Loads the rung data from the user's ladder in Supabase
    - Builds the system prompt via `buildSystemPrompt(rung)`
    - Calls `streamText` from the Vercel AI SDK with `google("gemini-flash")` and the full message history
    - Returns a `StreamingTextResponse`
  - _Requirements: 5.4, 7.2, 7.4_

- [x] 12. Verification chat UI
  - [x] 12.1 Implement MessageBubble and MessageList components
    - Create `src/components/verify/MessageBubble.tsx` — renders a single message with distinct styling for `user` vs `assistant` roles
    - Create `src/components/verify/MessageList.tsx` — scrollable list of `MessageBubble` components, auto-scrolls to bottom on new messages
    - _Requirements: 5.3_

  - [x] 12.2 Implement VerdictBanner component
    - Create `src/components/verify/VerdictBanner.tsx` — accepts a `VerificationVerdict`
    - On `pass`: display summary and a "Back to Dashboard" link
    - On `fail`: display summary and a "Retry" button that resets the chat
    - _Requirements: 5.8, 5.9_

  - [x] 12.3 Implement useVerificationChat hook
    - Create `src/hooks/useVerificationChat.ts` wrapping Vercel AI SDK's `useChat` pointed at `/api/verify/[rung_id]`
    - After each assistant message, attempt to parse the content as `VerdictSchema`; if valid, expose the verdict and stop further input
    - On parse error, expose a generic failure state
    - _Requirements: 5.5, 5.10_

  - [x] 12.4 Implement useProgressUpdate hook
    - Create `src/hooks/useProgressUpdate.ts` — async mutation that updates the current rung's `status` to `completed`, sets the next rung to `active`, and saves the transcript to `verification_transcript` in `user_progress`
    - _Requirements: 5.6, 5.7, 5.10_

  - [x] 12.5 Implement VerificationChat component and verify page
    - Create `src/components/verify/VerificationChat.tsx` — composes `MessageList`, chat input form, and `VerdictBanner`; uses `useVerificationChat` and calls `useProgressUpdate` when a `pass` verdict is detected
    - Create `src/app/verify/[rung_id]/page.tsx` as a Server Component that loads the rung and checks its progress status; redirects to `/dashboard` if status is `locked`, otherwise renders `VerificationChat`
    - _Requirements: 5.1, 5.2, 5.3, 5.11_

- [x] 13. Checkpoint — verification flow end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. CI/CD pipeline
  - Create `.github/workflows/ci.yml` defining a GitHub Actions workflow that triggers on push and pull_request to `main`
  - Add a job that checks out the repo, installs dependencies, runs the lint command, and runs the build command; fails the workflow on any error
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 15. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All AI calls (Gemini) are server-side only — never referenced in Client Components
- Environment variables follow the split defined in the design: `NEXT_PUBLIC_*` for client-safe values, server-only keys for Gemini and Supabase service role
