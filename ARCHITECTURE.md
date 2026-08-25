# Architecture

`what-is-astro` is a single Astro application with no backend of its own and no
external CMS integration. This document describes what is actually in the
repository as of `66f5c61`.

## Purpose and shape

The site renders a fictional conference ("Fake Astro Conf") with a talk listing
and a venue page. It accompanies the Contentful blog guide
[What is Astro](https://www.contentful.com/blog/what-is-astro/), so its structure
is chosen to demonstrate Astro features rather than to serve production traffic.

Two dependencies, both direct:

| Package         | Version    | Role                                       |
| :-------------- | :--------- | :----------------------------------------- |
| `astro`         | `^3.0.3`   | Framework, dev server, build, router       |
| `@astrojs/node` | `^6.0.0`   | Server adapter for on-request rendering    |

There are no devDependencies, no test framework, and no build tooling beyond
Astro itself.

## Directory layout

```
/
├── astro.config.mjs        # output mode + Node adapter
├── tsconfig.json           # extends astro/tsconfigs/base, nothing else
├── renovate.json           # extends local>contentful/renovate-config
├── .npmrc                  # ignore-scripts=true
├── catalog-info.yaml        # Backstage descriptor (still template values)
├── public/
│   └── favicon.svg          # served as-is at /favicon.svg
└── src/
    ├── env.d.ts             # Astro ambient types
    ├── content/
    │   ├── config.js         # collection schemas (zod)
    │   ├── talk/*.md         # 2 entries
    │   └── speaker/*.md      # 2 entries
    ├── layouts/
    │   └── Layout.astro      # HTML shell + all global CSS
    ├── components/
    │   ├── TalkGrid.astro    # queries the talk collection
    │   └── TalkCard.astro    # presentational card
    └── pages/
        ├── index.astro       # route /   (prerendered)
        └── venue.astro       # route /venue (rendered per request)
```

Routing is file-based: every file in `src/pages/` becomes a route named after the
file. There is no router configuration.

## Rendering model

`astro.config.mjs` is the whole of the runtime configuration:

```js
export default defineConfig({
  output: "hybrid",
  adapter: node({ mode: "standalone" })
});
```

`hybrid` means **prerender by default, opt out per page**. A page becomes
server-rendered by exporting `prerender = false`. Only `src/pages/venue.astro`
does this, because it calls `api.sunrise-sunset.org` for sunrise and sunset times
at request time using a fixed latitude/longitude embedded in the page.

`npm run build` therefore produces two things in `dist/`: static HTML for `/`,
and a standalone Node server entry point that handles `/venue`. `standalone` mode
means the build emits a server that listens on its own rather than a middleware
handler you mount in an existing Express or Fastify app.

The rationale and history of this choice are recorded in
[docs/ADRs/2026-08-25-hybrid-output-with-node-adapter.md](docs/ADRs/2026-08-25-hybrid-output-with-node-adapter.md).

## Content model

Content is local Markdown, validated by Astro's content collections. `src/content/config.js`
defines two collections:

- **`talk`** — `title: string`, `date: date`, `speaker: reference("speaker")`
- **`speaker`** — `name: string`, `title: string`, `twitter?: string`

The `reference("speaker")` field is the feature the blog post highlights: a talk
names a speaker by that speaker's filename (`alvin`, `harshil`) and Astro
type-checks the link at build time. Note that no component currently resolves
that reference into rendered output — see the "Known rough edges" section of
[AGENTS.md](AGENTS.md).

Schema validation is enforced at build time. Adding a frontmatter key to a
Markdown entry without adding it to the schema in `src/content/config.js` fails
the build; passing a prop that no schema defines silently yields `undefined`,
which is what currently happens to `description` in `TalkGrid.astro`.

## Data flow

```
src/content/talk/*.md ──┐
                        ├─> getCollection("talk") in TalkGrid.astro ─> TalkCard.astro ─> /
src/content/config.js ──┘   (build time, prerendered)

api.sunrise-sunset.org ────> fetch() in venue.astro ─────────────────────────────> /venue
                             (request time, prerender = false)
```

Styling flows one way: `Layout.astro` declares global CSS and the `--accent` /
`--accent-gradient` custom properties in a `<style is:global>` block; components
consume those variables in their own scoped `<style>` blocks. There is no CSS
framework, preprocessor, or shared stylesheet file.

## What is deliberately absent

Knowing what is *not* here matters as much as what is:

- **No CI.** `.github/` contains only `CODEOWNERS`. Nothing builds, lints, or
  tests this repo automatically. `catalog-info.yaml` is tagged `sast-disabled`.
- **No tests or linting.** No test runner, no ESLint, no Prettier config.
- **No deployment configuration.** No Dockerfile, no `netlify.toml`, no
  `vercel.json`, no workflow that publishes anything. The Node adapter makes the
  site *deployable*, but this repo does not describe where or how.
- **No Contentful integration.** Despite the org, there is no Contentful SDK
  dependency and no space or delivery token anywhere in the tree.
- **No pinned Node version.** There is no `.nvmrc` and no `engines` field. Use a
  Node version that satisfies Astro 3 and `@astrojs/node` 6.

## Operational ownership

`.github/CODEOWNERS` assigns the whole tree to `@contentful/team-devrel`, and
`catalog-info.yaml` names the same group as owner at service tier 4. The
Backstage descriptor is otherwise unfilled — `type`, `lifecycle`, `system`, and
the CI alert channel are all `unknown` — so treat Backstage as an unreliable
source of truth for this component until someone completes it.
