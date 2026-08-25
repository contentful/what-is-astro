# Contributing

Thanks for looking at this repo. Before you invest time, read the next section —
it will tell you whether a change here is worth making.

## What this repo is for

This is the companion demo for the Contentful blog guide
[What is Astro](https://www.contentful.com/blog/what-is-astro/). Its job is to
match that article so a reader can clone it and follow along. It is not a
product, a starter template we support, or a deployed site.

The site has not changed substantively since 2023-09-06 (`e6936bc`); every commit
since is dependency, ownership, or tooling upkeep. Two consequences:

- **Changes that keep the code matching the article are welcome** — a broken
  example, an outdated Astro API, a dependency that no longer installs.
- **Changes that improve the demo beyond the article are probably not.** New
  pages, a component library, a CSS framework, or a test suite would make the
  repo diverge from the prose it exists to illustrate. Open an issue and talk to
  `@contentful/team-devrel` before writing that code.

If you found a mistake in the *article* rather than the code, this repo is the
wrong place — that content is published separately.

## Getting set up

```sh
git clone https://github.com/contentful/what-is-astro.git
cd what-is-astro
npm install
npm run dev
```

`npm run dev` runs `astro dev --open` and opens a browser tab. Use
`npm run start` if you would rather it not. No environment variables, API keys,
or Contentful credentials are needed — all content is local Markdown in
`src/content/`.

There is no pinned Node version (`.nvmrc` and `engines` are both absent). Use a
release that satisfies Astro 3 and `@astrojs/node` 6.

`.npmrc` sets `ignore-scripts=true`, so `npm install` will not run dependency
lifecycle scripts. That is intentional (`3f2984d`) — do not remove it to work
around an install problem.

## Verifying a change

This repo has no test suite, no linter, and no CI. Nothing will catch a mistake
for you, so check your work manually:

```sh
npm run astro -- check   # type and template diagnostics
npm run build            # must succeed; content schemas validate here
npm run preview          # serve the build and click through / and /venue
```

Check both routes, not just `/`. `/venue` is server-rendered per request and
fetches an external API, so it can build cleanly and still fail when loaded. See
[ARCHITECTURE.md](ARCHITECTURE.md) for why.

If you touch `src/content/config.js` or any Markdown frontmatter, `npm run build`
is the step that validates the collection schemas — do not skip it.

## Conventions

- ESM only; `package.json` sets `"type": "module"`.
- Two-space indentation, double-quoted strings.
- Styles go in a `<style>` block inside the `.astro` file that uses them. Global
  CSS and the `--accent` custom properties belong in `src/layouts/Layout.astro`.
- Add a new route by adding a file to `src/pages/`. Routing is file-based.
- A new page is prerendered by default. Add `export const prerender = false` only
  if it genuinely needs per-request data.
- New frontmatter fields must be added to the matching schema in
  `src/content/config.js`.

`AGENTS.md` documents the same conventions in the form coding agents consume, plus
a list of known rough edges on `main`. Read it before assuming something is a bug
you introduced.

## Dependencies

Renovate manages updates against the shared `contentful/renovate-config` preset
(`renovate.json`, wired up in `66f5c61`). Please do not hand-bump versions in
`package.json` — let Renovate open the PR so the lockfile stays consistent. If a
dependency needs an update Renovate is not proposing, say so in an issue.

## Pull requests

- Branch from `main` and open the PR against `main`.
- Keep the change scoped. This repo is small enough that a mixed-purpose PR is
  harder to review than two focused ones.
- `.github/CODEOWNERS` assigns everything to `@contentful/team-devrel`, so they
  are requested automatically. Give them time — this repo is low-traffic and not
  on anyone's daily rotation.
- No CI will run on your PR. State in the description what you ran locally and
  what you saw, including which routes you loaded.
- Commit messages on `main` use Conventional Commit prefixes where a prefix
  applies (`chore:`, `fix:`), though history is not strict about it. Match the
  prefix style; no release automation depends on it.

## Reporting problems

Open a GitHub issue on `contentful/what-is-astro`. Include the Astro and Node
versions you used, the command you ran, and the output. If the problem is that
the repo no longer matches the blog post, quote the part of the post that no
longer holds — that is the most useful bug report this repo can get.

Do not include Contentful credentials, tokens, or `.env` contents in an issue or
PR. Nothing here needs them.
