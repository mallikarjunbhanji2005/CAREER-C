# Requirements Document

## Introduction

Ascend is a web-based AI Career Ladder application that helps users navigate their professional growth by generating personalized, AI-driven career roadmaps. Users specify their current and target roles, receive a structured "ladder" of skill rungs to climb, and verify their competency at each rung through an AI-powered technical interview. The application tracks progress visually on an animated dashboard and persists all data in Supabase.

The system is built on Next.js 15 (App Router) with TypeScript, styled with Tailwind CSS and Shadcn/UI in dark mode, and integrates Vercel AI SDK with Google Gemini models. Authentication and data persistence are handled by Supabase (PostgreSQL).

## Glossary

- **Ascend**: The web application described in this document.
- **User**: An authenticated person using Ascend.
- **Ladder**: A personalized career roadmap composed of ordered Rungs, stored in the `ladders` table.
- **Rung**: A single step on a Ladder, containing a title, description, learning resources, and verification criteria.
- **Rung_ID**: A unique identifier for a Rung within a Ladder.
- **Verification_Engine**: The subsystem that conducts AI-driven technical interviews to assess Rung competency.
- **Roadmap_Generator**: The AI subsystem that produces a Ladder from a user's current and target roles.
- **Onboarding_Flow**: The `/onboarding` page sequence where a User provides role inputs to generate a Ladder.
- **Dashboard**: The `/dashboard` page displaying the User's Ladder as a vertical animated UI.
- **Verification_Chat**: The `/verify/[rung_id]` page hosting the AI interviewer chat interface.
- **Progress_Record**: A row in the `user_progress` table tracking a User's status on a specific Rung.
- **Interviewer_AI**: The Gemini Flash model acting as a Senior Technical Interviewer during verification.
- **Roadmap_AI**: The Gemini 1.5 Pro model generating Ladder JSON during onboarding.
- **Supabase_Client**: The server-side Supabase client used for database and auth operations.
- **CI_CD_Pipeline**: The GitHub Actions workflow that runs linting and build checks on every push.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a visitor, I want to sign up and log in securely, so that my career ladder and progress are saved to my account.

#### Acceptance Criteria

1. THE Ascend SHALL provide sign-up and sign-in flows backed by Supabase Auth.
2. WHEN a User successfully authenticates, THE Ascend SHALL create or retrieve a corresponding row in the `profiles` table containing `id`, `username`, and `target_role`.
3. WHEN an unauthenticated User attempts to access a protected route (`/onboarding`, `/dashboard`, `/verify/[rung_id]`), THE Ascend SHALL redirect the User to the sign-in page.
4. WHEN a User signs out, THE Ascend SHALL invalidate the session and redirect the User to the sign-in page.
5. IF Supabase Auth returns an error during sign-up or sign-in, THEN THE Ascend SHALL display a descriptive error message to the User.

---

### Requirement 2: Onboarding and Role Input

**User Story:** As an authenticated User, I want to enter my current role and target role, so that Ascend can generate a personalized career roadmap for me.

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL present a form with two required text fields: "Current Role" and "Target Role".
2. WHEN the User submits the onboarding form with both fields populated, THE Onboarding_Flow SHALL invoke the Roadmap_Generator.
3. IF the User submits the onboarding form with one or both fields empty, THEN THE Onboarding_Flow SHALL display a validation error and SHALL NOT invoke the Roadmap_Generator.
4. WHILE the Roadmap_Generator is processing, THE Onboarding_Flow SHALL display a loading indicator to the User.
5. WHEN the Roadmap_Generator returns a valid Ladder, THE Onboarding_Flow SHALL persist the Ladder to the `ladders` table and redirect the User to the Dashboard.
6. IF the Roadmap_Generator returns an error, THEN THE Onboarding_Flow SHALL display a descriptive error message and allow the User to retry.

---

### Requirement 3: AI Roadmap Generation

**User Story:** As an authenticated User, I want the AI to generate a structured career roadmap, so that I have a clear, actionable path from my current role to my target role.

#### Acceptance Criteria

1. WHEN the Roadmap_Generator is invoked with a current role and a target role, THE Roadmap_AI SHALL return a JSON object containing between 5 and 7 Rungs.
2. THE Roadmap_AI SHALL produce each Rung as a JSON object containing the fields: `title` (string), `description` (string), `learning_resources` (array of strings), and `verification_criteria` (array of strings).
3. IF the Roadmap_AI returns a response that does not conform to the expected JSON schema, THEN THE Roadmap_Generator SHALL return a structured error to the caller.
4. THE Roadmap_Generator SHALL call the Roadmap_AI using the Vercel AI SDK with the `gemini-1.5-pro` model.
5. WHEN a Ladder is persisted, THE Ascend SHALL store the full Rung array as `career_path_json` in the `ladders` table, associated with the authenticated User's `user_id`.
6. WHEN a new Ladder is created for a User, THE Ascend SHALL initialize a Progress_Record for each Rung in the `user_progress` table, setting the first Rung's `status` to `active` and all subsequent Rungs' `status` to `locked`.

---

### Requirement 4: Visual Career Ladder Dashboard

**User Story:** As an authenticated User, I want to see my career ladder displayed visually, so that I can understand my progress at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL render the User's Ladder as a vertical list of Rung cards ordered from first to last.
2. THE Dashboard SHALL animate Rung card entry using Framer Motion.
3. WHEN a Rung's Progress_Record `status` is `completed`, THE Dashboard SHALL render that Rung card with a green glow visual treatment.
4. WHEN a Rung's Progress_Record `status` is `locked`, THE Dashboard SHALL render that Rung card as semi-transparent.
5. WHEN a Rung's Progress_Record `status` is `active`, THE Dashboard SHALL render that Rung card as fully opaque without a green glow, and SHALL display a "Start Verification" button linking to `/verify/[rung_id]`.
6. THE Dashboard SHALL display the User's `target_role` as a heading.
7. WHEN the User navigates to the Dashboard, THE Dashboard SHALL fetch the latest Progress_Record statuses from Supabase and reflect them in the UI.

---

### Requirement 5: AI Verification Engine

**User Story:** As an authenticated User, I want to be interviewed by an AI on the skills for a Rung, so that I can prove my competency and unlock the next step.

#### Acceptance Criteria

1. WHEN a User navigates to `/verify/[rung_id]`, THE Verification_Chat SHALL load the Rung's `title`, `description`, and `verification_criteria` from the User's Ladder.
2. WHEN the Verification_Chat is initialized, THE Interviewer_AI SHALL ask the User between 3 and 5 scenario-based questions derived from the Rung's `verification_criteria`.
3. THE Verification_Chat SHALL present a real-time streaming chat interface where the User can read and respond to Interviewer_AI messages.
4. THE Interviewer_AI SHALL call the Vercel AI SDK with the `gemini-flash` model for all Verification_Chat interactions.
5. WHEN the Interviewer_AI has asked all questions and received responses, THE Interviewer_AI SHALL evaluate the conversation and return a structured result containing a `verdict` field with value `pass` or `fail`, and a `summary` string explaining the outcome.
6. WHEN the Interviewer_AI returns a `pass` verdict, THE Verification_Engine SHALL update the corresponding Progress_Record `status` to `completed` in the `user_progress` table.
7. WHEN the Interviewer_AI returns a `pass` verdict and the completed Rung is not the final Rung, THE Verification_Engine SHALL update the next Rung's Progress_Record `status` from `locked` to `active`.
8. WHEN the Interviewer_AI returns a `pass` verdict, THE Verification_Chat SHALL display the `summary` and provide a link back to the Dashboard.
9. WHEN the Interviewer_AI returns a `fail` verdict, THE Verification_Chat SHALL display the `summary` and allow the User to retry the verification.
10. THE Verification_Engine SHALL persist the full conversation transcript to the `verification_transcript` field of the corresponding Progress_Record.
11. IF a User navigates to `/verify/[rung_id]` for a Rung whose Progress_Record `status` is `locked`, THEN THE Verification_Chat SHALL redirect the User to the Dashboard.

---

### Requirement 6: Database Schema

**User Story:** As a developer, I want a well-defined database schema, so that all application data is stored consistently and can be queried reliably.

#### Acceptance Criteria

1. THE Supabase_Client SHALL maintain a `profiles` table with columns: `id` (UUID, primary key, references `auth.users`), `username` (text), and `target_role` (text).
2. THE Supabase_Client SHALL maintain a `ladders` table with columns: `id` (UUID, primary key), `user_id` (UUID, references `profiles.id`), and `career_path_json` (JSONB).
3. THE Supabase_Client SHALL maintain a `user_progress` table with columns: `id` (UUID, primary key), `user_id` (UUID, references `profiles.id`), `rung_id` (text), `status` (text, constrained to values `locked`, `active`, `completed`), and `verification_transcript` (text, nullable).
4. THE Supabase_Client SHALL enforce Row Level Security (RLS) policies on `profiles`, `ladders`, and `user_progress` so that a User can only read and write rows where `user_id` matches the authenticated User's `id`.

---

### Requirement 7: API Routes and Server-Side Logic

**User Story:** As a developer, I want all AI calls and database mutations to occur server-side, so that API keys and service credentials are never exposed to the browser.

#### Acceptance Criteria

1. THE Ascend SHALL expose a POST API route at `/api/generate-roadmap` that accepts `currentRole` and `targetRole`, invokes the Roadmap_AI, and returns the Ladder JSON.
2. THE Ascend SHALL expose a POST API route at `/api/verify/[rung_id]` that accepts chat messages, invokes the Interviewer_AI, and streams the response to the client.
3. THE Ascend SHALL read `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_GENERATIVE_AI_API_KEY` exclusively from server-side environment variables.
4. IF a request to `/api/generate-roadmap` or `/api/verify/[rung_id]` is made without a valid authenticated session, THEN THE Ascend SHALL return an HTTP 401 response.

---

### Requirement 8: CI/CD Pipeline

**User Story:** As a developer, I want automated linting and build checks on every push, so that regressions are caught before they reach production.

#### Acceptance Criteria

1. THE CI_CD_Pipeline SHALL run on every push and pull request to the main branch.
2. WHEN a push or pull request is received, THE CI_CD_Pipeline SHALL execute the project's lint command and fail the workflow if any lint errors are reported.
3. WHEN a push or pull request is received, THE CI_CD_Pipeline SHALL execute the project's build command and fail the workflow if the build does not succeed.
4. THE CI_CD_Pipeline SHALL use GitHub Actions and SHALL be defined in `.github/workflows/`.

---

### Requirement 9: Deployment

**User Story:** As a developer, I want the application deployed to Vercel with Supabase as the backend, so that users can access Ascend from any browser.

#### Acceptance Criteria

1. THE Ascend SHALL be deployed to Vercel using the Next.js build output.
2. THE Ascend SHALL configure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_GENERATIVE_AI_API_KEY` as environment variables in the Vercel project settings.
3. WHEN a deployment is triggered, THE Ascend SHALL pass the CI_CD_Pipeline checks before the deployment is promoted to production.
