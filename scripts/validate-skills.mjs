import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const skillRoot = resolve(root, ".agents", "skills");
const skills = [
  "build-daily-focus-brief",
  "collect-approved-news",
  "group-rank-news-events",
  "classify-summarize-news",
  "generate-audience-content",
  "validate-package-daily-data"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseFrontmatter(content, skill) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(match, `${skill}: 缺少有效 frontmatter`);
  const entries = match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(":");
    assert(separator > 0, `${skill}: frontmatter 格式錯誤`);
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  });
  return Object.fromEntries(entries);
}

for (const skill of skills) {
  const dir = resolve(skillRoot, skill);
  const content = await readFile(resolve(dir, "SKILL.md"), "utf8");
  const frontmatter = parseFrontmatter(content, skill);
  assert(Object.keys(frontmatter).sort().join(",") === "description,name", `${skill}: frontmatter 只能有 name、description`);
  assert(frontmatter.name === skill, `${skill}: name 必須與資料夾名稱一致`);
  assert(frontmatter.description && frontmatter.description.length <= 1024, `${skill}: description 無效`);
  assert(!/[<>]/.test(frontmatter.description), `${skill}: description 不得包含角括號`);
  assert(!content.includes("TODO"), `${skill}: 仍有 TODO`);
  assert(!content.includes("\uFFFD"), `${skill}: 內容有無效字元`);

  const agent = await readFile(resolve(dir, "agents", "openai.yaml"), "utf8");
  const shortDescription = agent.match(/short_description:\s*"([^"]+)"/)?.[1] || "";
  const defaultPrompt = agent.match(/default_prompt:\s*"([^"]+)"/)?.[1] || "";
  const shortLength = Array.from(shortDescription).length;
  assert(shortLength >= 25 && shortLength <= 64, `${skill}: short_description 長度需為 25 至 64 字元`);
  assert(defaultPrompt.includes(`$${skill}`), `${skill}: default_prompt 必須包含 $${skill}`);

  const references = await readdir(resolve(dir, "references"));
  assert(references.some((file) => file.endsWith(".md")), `${skill}: 至少需要一份參考文件`);
  for (const file of references.filter((name) => name.endsWith(".md"))) {
    const reference = await readFile(resolve(dir, "references", file), "utf8");
    assert(reference.trim().length > 0, `${skill}: ${file} 不得為空`);
    assert(!reference.includes("\uFFFD"), `${skill}: ${file} 有無效字元`);
  }
}

const taxonomy = JSON.parse(await readFile(resolve(root, "config", "taxonomy.json"), "utf8"));
assert(taxonomy.schema_version === "1.0.0", "taxonomy.json: schema_version 必須為 1.0.0");
assert(typeof taxonomy.all_topic === "string" && taxonomy.all_topic.trim(), "taxonomy.json: all_topic 不可空白");
assert(Array.isArray(taxonomy.topics) && taxonomy.topics.length > 0, "taxonomy.json: topics 不可為空");
assert(Array.isArray(taxonomy.audiences) && taxonomy.audiences.length > 0, "taxonomy.json: audiences 不可為空");
assert(new Set(taxonomy.topics).size === taxonomy.topics.length && !taxonomy.topics.includes(taxonomy.all_topic), "taxonomy.json: topics 必須唯一且不得包含 all_topic");
assert(new Set(taxonomy.audiences).size === taxonomy.audiences.length, "taxonomy.json: audiences 必須唯一");
const validTopics = new Set(taxonomy.topics);
const whitelist = JSON.parse(await readFile(resolve(root, "config", "source-whitelist.json"), "utf8"));
const domains = [];
for (const source of whitelist.sources) {
  assert(source.id && source.name && source.domains?.length, `來源白名單項目缺少必要欄位`);
  domains.push(...source.domains);
  for (const topic of source.topics) assert(topic === "*" || validTopics.has(topic), `${source.id}: 不支援的主題 ${topic}`);
}
assert(domains.length === new Set(domains).size, "來源白名單網域不得重複");

const scoring = JSON.parse(await readFile(resolve(root, "config", "focus-scoring.json"), "utf8"));
const weightTotal = Object.values(scoring.weights).reduce((sum, value) => sum + value, 0);
assert(weightTotal === 100, "焦點評分權重總和必須為 100");
assert(scoring.candidate_policy.target_min_per_topic <= scoring.candidate_policy.target_max_per_topic, "候選文章數上下限錯誤");
assert(scoring.candidate_policy.web_page_size === 10, "網頁分頁筆數必須為 10");

console.log(`Validated ${skills.length} skills, ${whitelist.sources.length} sources, scoring total ${weightTotal}.`);
