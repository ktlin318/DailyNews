import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dataDir = resolve(root, "data");
const taxonomy = JSON.parse(await readFile(resolve(root, "config", "taxonomy.json"), "utf8"));
const eventTopics = taxonomy.topics;
const allowedTopics = [taxonomy.all_topic, ...eventTopics];
const allowedAudiences = taxonomy.audiences;
const allowedSourceTypes = ["primary", "reporting", "issuer"];
const errors = [];

function check(condition, file, path, message) {
  if (!condition) errors.push(`${file}: ${path} ${message}`);
}

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

check(taxonomy.schema_version === "1.0.0", "taxonomy.json", "schema_version", "must equal 1.0.0");
check(isString(taxonomy.all_topic), "taxonomy.json", "all_topic", "is required");
check(Array.isArray(eventTopics) && eventTopics.length > 0 && eventTopics.every(isString), "taxonomy.json", "topics", "must contain supported event topics");
check(new Set(eventTopics).size === eventTopics.length && !eventTopics.includes(taxonomy.all_topic), "taxonomy.json", "topics", "must be unique and exclude all_topic");
check(Array.isArray(allowedAudiences) && allowedAudiences.length > 0 && allowedAudiences.every(isString), "taxonomy.json", "audiences", "must contain supported audiences");
check(new Set(allowedAudiences).size === allowedAudiences.length, "taxonomy.json", "audiences", "must be unique");

function validateDigest(file, data) {
  check(data.schema_version === "1.1.0", file, "schema_version", "must equal 1.1.0");
  check(/^\d{4}-\d{2}-\d{2}$/.test(data.date), file, "date", "must use YYYY-MM-DD");
  check(data.timezone === "Asia/Taipei", file, "timezone", "must equal Asia/Taipei");
  check(!Number.isNaN(Date.parse(data.generated_at)), file, "generated_at", "must be an ISO timestamp");
  check(JSON.stringify(data.topics) === JSON.stringify(allowedTopics), file, "topics", "must use the supported display order");
  check(JSON.stringify(data.audiences) === JSON.stringify(allowedAudiences), file, "audiences", "must use the supported display order");
  check(isString(data.daily_overview), file, "daily_overview", "is required");
  for (const topic of allowedTopics) check(isString(data.topic_overviews?.[topic]), file, `topic_overviews.${topic}`, "is required");
  check(Array.isArray(data.events) && data.events.length > 0, file, "events", "must contain at least one event");

  const ids = new Set();
  for (const [index, event] of (data.events || []).entries()) {
    const base = `events[${index}]`;
    check(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(event.event_id), file, `${base}.event_id`, "has an invalid format");
    check(!ids.has(event.event_id), file, `${base}.event_id`, "must be unique");
    ids.add(event.event_id);
    check(eventTopics.includes(event.topic), file, `${base}.topic`, "is unsupported");
    for (const field of ["time", "title", "summary", "impact", "classification_reason"]) check(isString(event[field]), file, `${base}.${field}`, "is required");
    check(Array.isArray(event.keywords) && event.keywords.length >= 2 && event.keywords.length <= 5, file, `${base}.keywords`, "must contain 2 to 5 items");
    check(Array.isArray(event.audiences) && event.audiences.length > 0 && event.audiences.every((x) => allowedAudiences.includes(x)), file, `${base}.audiences`, "contains an unsupported value");
    check(Array.isArray(event.sources) && event.sources.length > 0, file, `${base}.sources`, "must contain at least one source");
    check(Array.isArray(event.evidence_notes) && event.evidence_notes.length > 0, file, `${base}.evidence_notes`, "must describe factual support");

    if (event.focus_score !== undefined) {
      check(Number.isInteger(event.focus_score) && event.focus_score >= 0 && event.focus_score <= 100, file, `${base}.focus_score`, "must be an integer from 0 to 100");
      const breakdown = event.score_breakdown || {};
      const parts = [breakdown.importance, breakdown.cross_source_coverage, breakdown.homepage_or_popular, breakdown.audience_relevance, breakdown.recency];
      check(parts.every(Number.isInteger), file, `${base}.score_breakdown`, "must contain five integer scores");
      check(parts.reduce((sum, value) => sum + (value || 0), 0) === event.focus_score, file, `${base}.focus_score`, "must equal the score breakdown total");
      check(/^\d{4}-\d{2}-\d{2}$/.test(event.published_date), file, `${base}.published_date`, "must use YYYY-MM-DD");
      const earliest = [...(event.sources || [])].map((source) => source.published_at).filter(isString).sort()[0]?.slice(0, 10);
      check(event.published_date === earliest, file, `${base}.published_date`, "must use the earliest source date");
      check(isString(event.selection_reason), file, `${base}.selection_reason`, "is required when focus_score is present");
    }

    for (const [sourceIndex, source] of (event.sources || []).entries()) {
      const sourcePath = `${base}.sources[${sourceIndex}]`;
      for (const field of ["publisher", "title", "published_at"]) check(isString(source[field]), file, `${sourcePath}.${field}`, "is required");
      check(/^https:\/\//.test(source.url), file, `${sourcePath}.url`, "must be HTTPS");
      check(allowedSourceTypes.includes(source.source_type), file, `${sourcePath}.source_type`, "is unsupported");
    }
  }

  if (file === "2026-07-16.json") {
    for (const topic of eventTopics) check(data.events.filter((event) => event.topic === topic).length >= 5, file, `events.${topic}`, "must retain at least 5 unique events");
    const scores = data.events.map((event) => event.focus_score);
    check(scores.every((score, index) => index === 0 || scores[index - 1] >= score), file, "events", "must be sorted by focus_score descending");
  }

  check(data.audience_talk_tracks && typeof data.audience_talk_tracks === "object", file, "audience_talk_tracks", "is required");
  for (const [key, track] of Object.entries(data.audience_talk_tracks || {})) {
    const [topic, audience] = key.split("|");
    check(allowedTopics.includes(topic) && allowedAudiences.includes(audience), file, `audience_talk_tracks.${key}`, "has an unsupported key");
    check(isString(track.opening), file, `audience_talk_tracks.${key}.opening`, "is required");
    check(Array.isArray(track.questions) && track.questions.length === 2 && track.questions.every(isString), file, `audience_talk_tracks.${key}.questions`, "must contain exactly two questions");
  }
  for (const topic of allowedTopics) {
    for (const audience of allowedAudiences) {
      check(Boolean(data.audience_talk_tracks?.[`${topic}|${audience}`]), file, `audience_talk_tracks.${topic}|${audience}`, "is required");
    }
  }
  check(Array.isArray(data.warnings), file, "warnings", "must be an array");
  check(Array.isArray(data.manual_review_items), file, "manual_review_items", "must be an array");
}

const index = JSON.parse(await readFile(resolve(dataDir, "index.json"), "utf8"));
check(index.schema_version === "1.1.0", "index.json", "schema_version", "must equal 1.1.0");
check(Array.isArray(index.dates) && index.dates.length > 0, "index.json", "dates", "must not be empty");
check(index.dates?.includes(index.latest), "index.json", "latest", "must appear in dates");

const files = (await readdir(dataDir)).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name));
for (const file of files) validateDigest(file, JSON.parse(await readFile(resolve(dataDir, file), "utf8")));
for (const date of index.dates || []) check(files.includes(`${date}.json`), "index.json", `dates.${date}`, "has no matching data file");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} daily file(s): ${files.join(", ")}`);
}
