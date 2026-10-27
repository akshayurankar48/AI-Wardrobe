<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Clerk + Convex authentication state

- Use Convex's `Authenticated`, `Unauthenticated`, and `AuthLoading` components from `convex/react` to render UI based on authentication state. Do not use Clerk's `Show` or `ClerkLoading` for this purpose.
- When UI logic needs to know whether a user is authenticated by Convex, use `useConvexAuth()` from `convex/react`, not Clerk's `useAuth()`. `useConvexAuth()` waits until the Clerk token is fetched and validated by the Convex backend. Use Clerk's `useAuth()` only as the adapter passed into `ConvexProviderWithClerk`.
- Keep `<ClerkProvider>` outside `<ConvexClientProvider>` so the Convex provider can access Clerk context.
- Source: [Clerk — Integrate Convex with Clerk: Show UI based on auth state](https://clerk.com/docs/guides/development/integrations/databases/convex#show-ui-based-on-auth-state).

## Keep project guidance current

- Treat the user's feedback and corrections during this build as project requirements. Update this `AGENTS.md` in the same task when feedback establishes a reusable implementation rule or constraint, so future agents follow it.
- Keep additions concise and actionable. Preserve existing guidance and distinguish project decisions from official framework instructions; verify official guidance when adding or changing framework-specific rules.

## Eve + Clerk + Convex integration

- The app uses Eve's supported Next.js integration mounted from `my-agent/` on the same origin. The chat is rendered only inside Convex's `Authenticated` state, and requests send Clerk's Convex-audience session token for Eve to verify against the same Clerk issuer.
- This wiring authenticates Eve requests but does not persist Eve transcripts in Convex. Add a documented Convex-to-Eve bridge only when Convex-backed transcript persistence or server-side orchestration is needed; check peer-version compatibility before installing a bridge package.
- Before adding bridge environment variables, identify the actual integration pattern and follow its documentation. Do not infer a secret name or add a secret based only on a screenshot; keep all secret values out of source files and commits.
- Report local Eve runtime, Vercel deployment, Convex authentication, Convex-backed persistence/bridge, and end-to-end authenticated behavior as separate completion states.
