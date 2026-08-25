# AGENTS.md

Guidance for coding agents working in this repository.

## What this repo is

`what-is-astro` is the companion demo for the Contentful blog guide
[What is Astro](https://www.contentful.com/blog/what-is-astro/). It is a small
Astro site for a fictional event ("Fake Astro Conf") that exists to illustrate
the concepts in the article — content collections, references between
collections, and hybrid rendering.

It is **not** a product, a library, or a deployed service. There is no Contentful
API integration in this repo: all content is local Markdown under
`src/content/`. Treat it as sample code that a reader may clone while following
the blog post.

The last substantive change to the site itself was
`e6936bc` (2023-09-06); everything after that is dependency, ownership, or
tooling maintenance. Assume the repo is dormant and scope changes accordingly.

## Commands

Every command runs from the repo root. These are the only scripts defined in
`package.json`:

| Command           | What it does                                        |
| :---------------- | :-------------------------------------------------- |
| `npm install`     | Install dependencies                                |
| `npm run dev`     | `astro dev --open` — dev server, opens a browser tab |
| `npm run start`   | `astro dev` — dev server without opening a browser  |
| `npm run build`   | `astro build` — production build into `dist/`       |
| `npm run preview` | `astro preview` — serve the build locally           |
| `npm run astro`   | Passthrough to the Astro CLI (e.g. `astro check`)   |

There is **no test suite, no linter, and no formatter** configured in this repo,
and no GitHub Actions workflows — `.github/` contains only `CODEOWNERS`. Do not
report `npm test` or a lint step as having passed; neither exists. The closest
thing to a verification step is `npm run astro -- check` plus `npm run build`.

`.npmrc` sets `ignore-scripts=true`. Leave it in place — it is a deliberate
supply-chain hardening choice (`3f2984d`).

## Conventions to follow

- ESM only. `package.json` sets `"type": "module"`; `astro.config.mjs` uses
  `import`/`export`.
- Component and layout files are `.astro` with the frontmatter fence (`---`) for
  server-side script. Styles live in a `<style>` block in the same file — there
  is no CSS framework and no separate stylesheet.
- Global CSS and the custom properties `--accent` / `--accent-gradient` are
  defined once in `src/layouts/Layout.astro` inside `<style is:global>`.
- Content collections are declared in `src/content/config.js` using `zod` via
  `astro:content`. If you add a frontmatter field to a Markdown entry, add it to
  the matching schema in that file, or Astro will reject the entry.
- `tsconfig.json` extends `astro/tsconfigs/base` and adds nothing. `.astro`
  components in this repo are largely untyped beyond `Props` in `Layout.astro`.
- Two-space indentation, double-quoted strings.

## Rendering model — read before touching pages

`astro.config.mjs` sets `output: "hybrid"` with the `@astrojs/node` adapter in
`standalone` mode. Pages are prerendered at build time **unless** they opt out
with `export const prerender = false`. Today only `src/pages/venue.astro` opts
out, because it fetches live sunrise/sunset times on each request. See
[docs/ADRs/2026-08-25-hybrid-output-with-node-adapter.md](docs/ADRs/2026-08-25-hybrid-output-with-node-adapter.md).

Consequences an agent should keep in mind:

- Removing the adapter or switching `output` to `"static"` will break
  `venue.astro`.
- `venue.astro` makes an unauthenticated outbound request to
  `api.sunrise-sunset.org` with hard-coded latitude/longitude. It fails at
  request time, not build time, if that host is unreachable.

## Known rough edges

These are real and present on `main`. Do not "fix" them incidentally in an
unrelated change, but do not treat them as intentional either:

- `src/components/TalkGrid.astro` passes `description={data.description}` to
  `TalkCard`, but the `talk` collection schema in `src/content/config.js` has no
  `description` field, so it is always `undefined` and the card body renders
  empty.
- `TalkGrid.astro` also passes `date`, which `TalkCard.astro` does not use.
- The `speaker` reference between the `talk` and `speaker` collections — the
  feature the blog post calls "the magic bit" — is declared and populated in
  frontmatter but never resolved or rendered by any component.
- `catalog-info.yaml` is still the unfilled Backstage template; its own header
  comment says the fields need completing. `description`, `type`, `lifecycle`,
  `system`, and the Slack channel are all `unknown`.

## Boundaries

- Ownership is `@contentful/team-devrel` (`.github/CODEOWNERS`). Route
  non-trivial changes there.
- Dependencies are managed by Renovate against the shared
  `contentful/renovate-config` preset (`renovate.json`). Do not hand-bump
  versions in `package.json` to chase an update; let Renovate open the PR.
- Do not add secrets or `.env` files. `.gitignore` already excludes `.env` and
  `.env.production`; leave those entries alone.
- Because this repo backs a published article, keep the site's structure
  recognisable to a reader following that article. A refactor that no longer
  matches the prose is a regression even if the build passes.
