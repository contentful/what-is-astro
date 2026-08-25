# Hybrid output with the standalone Node adapter

- **Date:** 2026-08-25
- **Status:** Accepted (in effect since 2023-05-25; adapter wiring completed 2023-09-06)

> This record was written on 2026-08-25 from the commit history. It documents an
> existing decision rather than a new one. The commits and configuration cited
> below are verifiable; the reasoning attributed to them is reconstructed from
> what the code does, not from any contemporaneous design note. Where the history
> does not establish intent, this record says so instead of guessing.

## Context

`what-is-astro` is the companion demo for the Contentful blog guide
[What is Astro](https://www.contentful.com/blog/what-is-astro/). The repository
started from `npm create astro@latest -- --template basics` (`e7f61c6`,
2023-05-18) with an empty `astro.config.mjs` — that is, fully static output.

The demo then grew a page that cannot be static. `src/pages/venue.astro` calls
`api.sunrise-sunset.org` for sunrise and sunset times at a fixed latitude and
longitude, and presents them as current. Baked into a static build, those values
would be frozen at whatever they were when the site was built. The talk listing
on `/`, by contrast, is built entirely from local Markdown in `src/content/` and
has no reason to be rendered per request.

So the repo needed a per-page choice, not a whole-site one — and it needed that
choice to be visible to a reader following the article, since demonstrating this
capability is part of the article's subject matter.

## Decision

Configure Astro with `output: "hybrid"` and the `@astrojs/node` adapter in
`standalone` mode. The whole of `astro.config.mjs` is:

```js
export default defineConfig({
  output: "hybrid",
  adapter: node({ mode: "standalone" })
});
```

Under `hybrid`, pages are prerendered at build time unless a page opts out with
`export const prerender = false`. Only `src/pages/venue.astro` opts out. The
adapter supplies the server needed to render that one route on request;
`standalone` means the build emits a server that listens on its own, rather than a
middleware handler to be mounted inside an existing Node application.

## Evidence

Three commits, in order:

| Commit    | Date       | What changed                                                                 |
| :-------- | :--------- | :--------------------------------------------------------------------------- |
| `ce80f47` | 2023-05-25 | Added `output: "hybrid"` behind `experimental.hybridOutput`, added `@astrojs/node@^5.1.4` to dependencies, and added `src/pages/venue.astro` with the sunrise/sunset fetch — all in one commit |
| `44576f9` | 2023-06-15 | Removed the `experimental.hybridOutput` flag; commit message: "Hybrid rendering is no longer experimental" |
| `e6936bc` | 2023-09-06 | Imported `@astrojs/node` in `astro.config.mjs` and set `adapter: node({ mode: "standalone" })`; commit message: "Added missing adapter" |

`ce80f47` is the load-bearing one: it introduced hybrid output, the dependency,
and the page that motivates hybrid output together. That grouping is why this
record treats `venue.astro` as the driver of the decision rather than an
incidental later addition.

One detail worth recording because it is easy to misread: `@astrojs/node` was a
declared dependency from `ce80f47` (2023-05-25) but was not referenced in
`astro.config.mjs` until `e6936bc` (2023-09-06) — roughly three and a half
months during which the package was installed but unused, spanning the Astro 3
upgrade in `fb14ab8`. The `e6936bc` message calls the adapter "missing", so the
adapter was evidently always the intent and the config wiring was an oversight.
**The history does not establish why the gap went unnoticed for that long**, and
this record does not speculate.

## Consequences

- A new page under `src/pages/` is static by default. Making it dynamic is a
  one-line opt-out in that file, with no config change — which is the property
  the blog post is demonstrating.
- `npm run build` emits both static HTML and a Node server entry point in
  `dist/`. Deploying this site therefore needs a Node runtime, not just static
  file hosting. **This repository does not describe where or how it is deployed**
  — there is no Dockerfile, no host configuration, and no publishing workflow.
- `/venue` can fail at request time while the build is green, if
  `api.sunrise-sunset.org` is unreachable. The page does not handle a failed
  `fetch`. Verifying a change means loading `/venue`, not just building.
- Switching to `output: "static"` or dropping the adapter breaks `venue.astro`.
  Both are the same change in effect, and neither is safe on its own.
- The adapter is a real dependency surface for a demo whose visible content is
  otherwise entirely local Markdown. Renovate (`66f5c61`) keeps both `astro` and
  `@astrojs/node` current; their major versions need to stay compatible with each
  other.
