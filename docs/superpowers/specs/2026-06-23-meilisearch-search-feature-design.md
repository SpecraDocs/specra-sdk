# Meilisearch search as a packaged SDK + CLI feature — Design

- **Date:** 2026-06-23
- **Status:** Approved (design); spec under review
- **Packages:** `specra-sdk`, `specra-cli`, `specra-docs`

## Context / problem

Specra ships a search **frontend** and a working **Meilisearch backend**, but they are
not packaged for reuse, and the client/endpoint contract is broken:

- `specra-sdk` has `SearchModal.svelte` (Cmd+K), `SearchHighlight.svelte`, and
  `extractSearchText()`; plus a `SearchConfig` type whose `provider` is
  `"meilisearch" | "algolia" | "local"` (default `"local"`, unimplemented).
- The Meilisearch **indexer** (`specra-docs/scripts/index-search.ts`) and the
  **`/api/search` endpoint** (`specra-docs/src/routes/api/search/+server.ts`) exist
  **only** in the reference app as hand-written, copy-paste files.
- **Contract bug:** `SearchModal.svelte:78` calls `GET /api/search?q=<query>`, but the
  reference endpoint is `POST` expecting `{ query }` in the body. They do not match.
- The CLI has no index command; `doctor` only *validates* Meilisearch config.

A project consuming `specra-sdk` therefore has no turnkey way to enable Meilisearch
search.

## Goals

1. A consumer enables Meilisearch search with: config + a one-line endpoint + one CLI
   command (`specra index`).
2. Indexing and runtime-query logic live **in the SDK** (exported), so the CLI,
   `specra-docs`, and any script share one implementation.
3. Fix the GET/POST contract so the existing `SearchModal` works unchanged.
4. A clear security model: the committed key is search-only; the write/admin key comes
   from the environment.
5. `specra-docs` becomes a thin consumer + a "Search with Meilisearch" setup doc.

## Non-goals

- Implementing the `local` or `algolia` providers (tracked separately).
- A search results *page* (the existing modal + on-page highlight stay as-is).
- `specra index --watch` / incremental indexing. (Full reindex only, for now.)
- Multi-tenant / per-locale index routing beyond what the current indexer already does
  (version + category + tags).

## Decisions (approved)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Client/endpoint contract | **GET `/api/search?q=<query>`** |
| 2 | Admin/write key source | env **`MEILI_ADMIN_KEY`**, fallback to `config.search.meilisearch.apiKey` (with a warning) |
| 3 | Where indexer + handler logic live | **`specra-sdk`**, exported from a new `specra/server` subpath |
| 4 | CLI command | **`specra index`** (flat, matching the current flat CLI; upgrade to a `search` namespace later if `test`/`clear`/`status` are added) |

## Architecture

New server-only module tree in the SDK, exported via a `./server` subpath (mirroring the
existing `./middleware/security` precedent):

```
specra-sdk/src/lib/server/
  index.ts                 # re-exports the public server API
  search/
    types.ts               # SearchDocument, SearchResponse, MeilisearchSettings
    build-documents.ts     # buildSearchDocuments({ docsDir, config }) -> SearchDocument[]
    meilisearch.ts         # indexToMeilisearch(docs, meiliConfig, adminKey)
                           # createSearchHandler(config) -> SvelteKit RequestHandler (GET)
```

`package.json` exports add:

```jsonc
"./server": {
  "types": "./dist/server/index.d.ts",
  "import": "./dist/server/index.js"
}
```

Data flow:

```
build time:  specra index  ->  buildSearchDocuments()  ->  indexToMeilisearch()  ->  Meilisearch
runtime:     SearchModal (GET ?q=) -> /api/search (createSearchHandler) -> Meilisearch.search()
```

## Component specs

### 1. SDK — `buildSearchDocuments({ docsDir, config })`

- Pure, network-free, unit-testable. Walks `docsDir` reusing existing infra
  (`getVersions` / `findMdxFiles` patterns) and `extractSearchText()` for body text.
- Returns `SearchDocument[]` with the SAME shape the current script produces:
  `{ id, title, content, slug, version, category?, tags?, tab_group? }`.
- `id = slug.replace(/\//g, "-")` (unchanged), `category` = first path segment,
  `tab_group` from frontmatter or parent `_category_.json` (unchanged behavior).
- Lifted verbatim-in-behavior from `specra-docs/scripts/index-search.ts` so existing
  indexes stay compatible.

### 2. SDK — `indexToMeilisearch(documents, meiliConfig, adminKey)`

- Creates `MeiliSearch({ host, apiKey: adminKey })`.
- Configures: searchable `["title","content","tags"]`, filterable
  `["version","category","tags"]`, sortable `["title"]`, distinct `"id"`, and the
  existing ranking rules.
- Clears existing docs, then `addDocuments(documents, { primaryKey: "id" })`.
- Returns a small summary `{ added: number, indexName: string }`. Throws on failure
  (caller decides exit code / messaging).

### 3. SDK — `createSearchHandler(config)`

- Returns a SvelteKit `RequestHandler` for **GET**.
- Reads `q = url.searchParams.get('q')`. Empty/missing `q` → `200 { hits: [], query: "" }`
  (not an error — the modal calls it on every keystroke).
- Validates `config.search.enabled && provider === 'meilisearch' && meilisearch` present;
  otherwise `400 { error }`.
- Uses the **search key** `config.search.meilisearch.apiKey` (never the admin key).
- Search options preserved from current endpoint: `limit: 50`,
  `attributesToHighlight: ['title','content']`, `attributesToCrop: ['content']`,
  `cropLength: 100`; then dedupe by `${version}-${slug}` and slice to 20.
- Response shape unchanged: `{ hits, query, processingTimeMs, estimatedTotalHits }`.
- Errors → `500 { error, details }` (matches current behavior).

### 4. Fix the contract (the bug)

- `SearchModal.svelte` already does `GET ?q=` — **no change needed**.
- `createSearchHandler` is GET, so they align by construction.
- The `specra-docs` endpoint is replaced (see §6), removing the stale POST handler.

### 5. CLI — `specra index`

- New command `specra index [--config <path>] [--docs <dir>]`.
- Loads the Specra config (same mechanism as other commands), resolves docs dir
  (default `./docs`), reads the admin key: `process.env.MEILI_ADMIN_KEY ||
  config.search.meilisearch.apiKey` (warn if falling back).
- Guard: error out if `search.provider !== 'meilisearch'` or meilisearch config missing.
- Calls `buildSearchDocuments` then `indexToMeilisearch`; prints a summary
  (versions found, docs indexed, index name).
- `doctor` extended: when provider is meilisearch, note whether `MEILI_ADMIN_KEY` is set
  (informational — indexing needs it; the runtime endpoint does not).

### 6. `specra-docs` — reference migration + docs

- `src/routes/api/search/+server.ts` becomes:
  ```ts
  import { createSearchHandler } from 'specra/server'
  import config from '../../../../specra.config.json'
  export const GET = createSearchHandler(config as any)
  ```
- Delete `scripts/index-search.ts`; replace the `index:search` npm script with
  `specra index`. (`scripts/test-search.ts` may stay as a local smoke test.)
- New docs page **"Search with Meilisearch"**: run Meilisearch (Docker/cloud) → set
  `search.meilisearch { host, apiKey, indexName }` → export `MEILI_ADMIN_KEY` →
  `specra index` → deploy. Note the search-key vs admin-key distinction.

## Security model

- `config.search.meilisearch.apiKey` = **search-only** key. Committed; used by the
  runtime endpoint. Safe because it cannot write.
- **Write/admin** key = `MEILI_ADMIN_KEY` env var, used only by `specra index`
  (build/CI, server-side). Never committed. Falls back to `apiKey` with a printed
  warning if the env var is absent (keeps local dev easy; flagged as not recommended).

## Error handling

- Empty query → empty hits, 200 (hot path; not an error).
- Misconfiguration (provider/host/indexName) → 400 from handler; hard error + nonzero
  exit from `specra index`.
- Meilisearch unreachable / auth failure → 500 `{ error, details }` at runtime;
  `specra index` prints the error and exits nonzero.

## Testing

- **Unit:** `buildSearchDocuments` against a fixture `docs/` tree — asserts doc count,
  ids, slugs, category, tab_group derivation, and that `extractSearchText` strips code.
- **Unit:** handler query parsing — empty `q` → empty hits; missing config → 400.
  (Meilisearch client mocked.)
- **Smoke (documented, not CI):** `specra index` against a local Meilisearch, then a
  sample query via the endpoint.

## Backward compatibility

- `SearchDocument` shape and index settings are unchanged → existing Meilisearch indexes
  remain valid; no reindex required beyond the normal run.
- `SearchModal` is unchanged.
- Consumers currently using the copy-pasted POST endpoint must switch to the GET handler
  (documented as a one-line change). This is the intended fix.

## Rollout

- `specra-sdk`: add `./server` subpath + modules; patch/minor version bump; publish.
- `specra-cli`: add `index` command; depends on the new SDK version; bump; publish per
  the CLI's own release flow.
- `specra-docs`: migrate endpoint + script + add docs page (no publish; reference app).
- Commit per-repo (sdk, cli, docs are separate repos).

## Open questions

None blocking. Possible follow-ups (out of scope): `local` provider, `specra index
--watch`, a `search` CLI namespace with `test`/`clear`/`status`.
