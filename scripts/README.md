# Scripts

## `eval-judge-v2.ts` — Experiment A

One-shot harness that scores the 15 fixtures in `tests/fixtures/reflections.json`
against both the pre-change v1 judge (depth score) and the new v2 judge
(five-marker rubric), then prints Spearman ρ, marker-attribution accuracy, and
the applied-but-inelegant delta.

```sh
# 1. Source env vars yourself — the script does not load .env.local
source .env.local

# 2. Run via pnpm dlx (tsx is not a repo dependency)
pnpm dlx tsx scripts/eval-judge-v2.ts
```

Exits `0` on pass, `1` on fail. Each run issues ~30 real Anthropic calls.

## `backfill-markers.ts`

One-time script to re-score existing reflections against the five-marker rubric.
Run AFTER applying migration `0010_application_rubric.sql`.

```sh
source .env.local && pnpm dlx tsx scripts/backfill-markers.ts
```

Idempotent — re-running processes only rows still at `marker_count IS NULL`.
