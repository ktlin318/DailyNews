---
name: build-daily-focus-brief
description: Search approved public news sources and produce a source-linked Traditional Chinese daily focus brief with event grouping, topic classification, summaries, keywords, topic overviews, and audience-specific conversation suggestions. Use when creating or updating DailyNews JSON, preparing the daily edition, summarizing current news, or drafting customer conversation material from news sources.
---

# Build Daily Focus Brief

Produce one reviewable daily JSON file for the DailyNews website. Use AI for discovery, semantic grouping, classification, summarization, and conversation drafting; use fixed rules for schema validation and factual fields.

## Required references

Read these before producing content:

- `references/source-registry.md` for allowed and disallowed sources.
- `references/content-policy.md` for factual and editorial constraints.
- `references/output-schema.md` for the output contract.
- `references/audience-guidelines.md` for conversation suggestions.

## Workflow

1. Receive the edition date, timezone, topics, audiences, source window, and maximum event count.
2. Search approved sources. Prefer original government, exchange, regulator, issuer, company, or research pages; add reputable reporting for market context.
3. Record the original title, publisher, canonical URL, and publication time before summarizing.
4. Group URLs describing the same event. Keep one event and attach every relevant source.
5. Rank events by breadth of impact, recency, supported-topic relevance, and usefulness for customer conversations. Do not rank promotional language as market importance.
6. Assign exactly one primary topic from `國際`, `台股`, `ETF`, `AI`, or `生活`. Add two to five keywords and relevant audiences.
7. Write a neutral title, concise summary, and separate impact statement. Preserve the distinction between reported facts and interpretation.
8. Generate one overview for `全部` and every supported topic. If no qualified event exists, state that; do not fabricate a trend.
9. Generate conversation suggestions for supported topic and audience combinations. Frame them as questions or openings, never personalized investment recommendations.
10. Validate every number, date, time, percentage, currency, person, organization, and quotation against an attached source. Remove unsupported factual tokens.
11. Populate `warnings` and `manual_review_items` for blocked pages, conflicts, ambiguous timestamps, single-source material, or uncertain classification.
12. Write data conforming to `data/schema.json`. Do not publish or merge automatically; create a PR for human review when requested.

## Stop conditions

- Do not infer inaccessible or paywalled article contents from headlines.
- Do not invent URLs, publication times, statistics, market moves, causal claims, or quotations.
- Do not combine events merely because they share a company or topic.
- Do not silently resolve conflicting figures; require review.
- Do not output buy, sell, return, guarantee, or suitability claims.

## Quality gate

Confirm every event has an accessible source, every displayed number retains its sourced unit and basis, summaries add no unsupported causality, duplicate events are grouped, enum values conform to the schema, and conversation suggestions avoid promises. Parse and validate the JSON against `data/schema.json`, then report selected events, excluded candidates, warnings, and manual-review items.
