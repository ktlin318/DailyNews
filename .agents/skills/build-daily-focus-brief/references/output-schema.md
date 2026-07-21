# Output contract

Use the repository's `data/schema.json` as the canonical machine-readable contract. Read its current enum values before every run so topics and audiences can change without rewriting the workflow.

Produce `data/YYYY-MM-DD.json` with edition metadata, source window, daily and topic overviews, supported topics and audiences, source-linked events, audience talk tracks, warnings, and manual-review items.

Each event must include a stable ID, primary topic, display time, neutral title, summary, impact, two to five keywords, one or more audiences, one or more complete sources, and evidence notes identifying support for numerical or time-sensitive claims.

Key talk tracks as `主題|客群`. For schema version 1.1, produce all combinations of `全部`, `投資理財`, `貸款`, `信用卡`, `新鮮事`, and `AI` with `高資產`, `定存`, `頂級卡`, and `貸款`. Never add fields ad hoc; update `data/schema.json` first when the contract changes.
