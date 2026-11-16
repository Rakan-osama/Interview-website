# Backend Lab — Start here

This is the complete tracked source of Backend Lab, including its Arabic explanations, exercises, concept library, feature-design playbooks, diagrams, UI, and tests.

## Stack

React 19, TypeScript, Vinext (Vite with Next.js-compatible App Router), Tailwind/CSS, and a Cloudflare Worker entry point. PHP and Laravel examples are educational content in this application.

## Run locally (Windows / macOS / Linux)

1. Install Node.js 22.13.0 or newer (Node 22 LTS is suitable).
2. Extract the ZIP and open the `backend-lab` folder in VS Code.
3. Open a terminal inside that folder and run:

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost URL printed in the terminal (normally http://localhost:5173).
If Windows PowerShell blocks npm.ps1 or pnpm.ps1, use Command Prompt, or run `npm.cmd` / `pnpm.cmd` instead.

Keep the lockfile, pnpm-workspace.yaml, scripts, vendor assets, and .openai/hosting.json. The included clean clone defaults to the portable execution profile and does not require the ChatGPT editing environment to start local development. No database or external API key is required for the current learning features.

## Where to make edits

| What you want to change | Files |
| --- | --- |
| Main app, training screens and progress | app/backend-app.tsx |
| Sidebar | app/sidebar.tsx |
| Styles and fonts | app/globals.css |
| Training tracks and questions | app/content.ts and the track files it imports |
| Concepts | app/concepts.ts, app/engineering-concepts.ts, app/domain-concepts.ts |
| Simplified explanations | app/plain-explanations.ts |
| Concept reading layout | app/concept-reader.tsx |
| Bullet formatting and Arabic/English isolation | app/reading-text.tsx, app/reading-format.ts |
| Feature design content | app/feature-guides.ts, app/feature-playbooks.ts |
| Feature page layout | app/feature-lab.tsx |
| Diagrams | app/learning-flow.tsx, app/concept-illustration.tsx, app/concept-visuals.ts |
| Feature simulators | app/feature-simulator.tsx |
| Books, resources and project briefs | app/engineering-plan.ts, app/engineering-view.tsx |
| URLs and navigation | app/navigation.ts, app/page.tsx, app/features/ |

Some content files import additional modules; follow their imports to the topic you want to edit. Keep existing question IDs, track order, concept IDs and feature slugs stable when you want saved progress to remain compatible.

## Checks and build

```sh
pnpm exec tsc --noEmit
node tests/reading.cjs
node tests/navigation.cjs
node tests/handbook.cjs
pnpm build
pnpm start
```

`pnpm start` previews the built Worker locally; use the URL it prints. `pnpm dev` is the usual choice while editing.

## Progress and evaluation

Learner progress, drafts and feature notes are stored in browser localStorage under `backend-lab-v1`. Export progress from the live site's progress page and import it on localhost to transfer it; browser storage is separate for each origin. Personal progress is not part of this source ZIP.

Interview scoring is an approximate client-side keyword/rubric check, with manual correction controls. It does not call an AI model or execute PHP code. The three feature simulators are educational client-side models.

## Deployment

Editing this downloaded copy changes only your local copy. The running hosted site is unchanged. The included .openai/hosting.json keeps the original Site identity; it contains no secret. Publishing back to that Site requires authorized Sites access. Other hosts must support this Vinext/Cloudflare Worker setup or require an intentional deployment adaptation; do not upload only the app folder as a static site.

README.md contains the original framework and Worker setup notes. No dependencies, build output, Git credentials/history, environment secrets or browser data are bundled.

## Source snapshot

Commit: faa728477cc2d71cda5bd61db783a6ed5aee9896
Export date: 2026-11-16
