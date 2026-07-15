# Output contract

Use the repository's `data/schema.json` as the canonical machine-readable contract.

Produce `data/YYYY-MM-DD.json` with edition metadata, source window, daily and topic overviews, supported topics and audiences, source-linked events, audience talk tracks, warnings, and manual-review items.

Each event must include a stable ID, primary topic, display time, neutral title, summary, impact, two to five keywords, one or more audiences, one or more complete sources, and evidence notes identifying support for numerical or time-sensitive claims.

Key talk tracks as `主題|客群`. Never add fields ad hoc; update `data/schema.json` first when the contract changes.
