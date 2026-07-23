# 每日 AI 焦點快報（DailyNews）

> 快速掌握每日焦點，輕鬆開啟客戶對話。

[線上 Demo](https://ktlin318.github.io/DailyNews/)｜目前產品版本：**Version 1.0**

DailyNews 是一個以 AI 協助整理每日重要新聞的靜態網頁 Demo。系統先從核准的公開新聞來源搜尋候選文章，再進行事件整併、焦點排序、分類與摘要，最後產生不同客群可使用的溝通建議。

目前正式 Demo 採用獨立的 `index.html`、CSS、JavaScript 與 JSON 資料，不需要 API 或資料庫即可部署至 GitHub Pages。新聞更新仍由 AI Agent 按需執行，尚未建立每日自動排程。

## 核心功能

- 透過日曆切換有資料的日期，無資料日期不可點選。
- 依新聞主題篩選內容。
- 使用文字搜尋新聞標題、摘要、影響與關鍵字。
- 點擊 `#關鍵字` 快速篩選相關新聞。
- 依焦點分數排序，每頁最多顯示 10 則新聞。
- 相同新聞事件可保留多個獨立來源連結。
- 顯示每日概況及各主題摘要。
- 依客群頁籤切換開場句與延伸問題，不影響新聞篩選結果。
- 桌機版維持雙欄閱讀；手機版優先顯示客群溝通建議。

## 目前分類與客群

分類與客群只在 [`config/taxonomy.json`](config/taxonomy.json) 維護。

### 新聞分類

- 投資理財
- 貸款
- 信用卡
- 新鮮事
- AI

### 客群

- 高資產
- 定存
- 頂級卡
- 貸款

修改 Taxonomy 後，需重新產生每日資料並執行驗證；網頁會從每日 JSON 取得顯示清單。

## 每日資料更新流程

```text
設定快報日期與搜尋時間窗口
        ↓
AI 搜尋核准的公開新聞來源
        ↓
保存候選文章與 Raw Data
        ↓
整併相同新聞事件並保留所有來源
        ↓
計算焦點分數並排序
        ↓
分類、摘要、影響說明與關鍵字
        ↓
產生每日概況、主題摘要與客群溝通建議
        ↓
驗證並輸出 Web JSON
        ↓
更新日期索引，供 index.html 讀取
```

新聞蒐集由具備搜尋與網頁閱讀能力的 AI 執行，不使用 Python 爬蟲或批次抓站，也不繞過付費牆、登入、robots、驗證碼或其他網站存取限制。

## AI Skills 分工

Skills 位於 [`.agents/skills`](.agents/skills)，可分別維護與重跑。

| Skill | 角色 | 主要輸入 | 主要產出 |
| --- | --- | --- | --- |
| `build-daily-focus-brief` | 每日更新流程總控 | 日期、時間窗口與執行限制 | 完整每日更新結果與執行報告 |
| `collect-approved-news` | 核准來源新聞蒐集 | Taxonomy、來源白名單、時間窗口 | 候選文章與文章層 Raw Data |
| `group-rank-news-events` | 事件整併與焦點排序 | 候選文章、焦點評分設定 | 多來源事件、焦點分數與排序 |
| `classify-summarize-news` | 新聞分類與忠實摘要 | 已整併事件、Taxonomy、Schema | 標題、摘要、影響、關鍵字與證據註記 |
| `generate-audience-content` | 客群溝通內容產製 | 已整理新聞、主題與客群 | 每日概況、主題摘要、開場句與問題 |
| `validate-package-daily-data` | 資料驗證與封裝 | 完整每日資料 | Web JSON、日期索引與驗證結果 |

各階段的資料契約可參考 [`pipeline-contract.md`](.agents/skills/build-daily-focus-brief/references/pipeline-contract.md)。

## 專案架構

```text
DailyNews/
├─ index.html                         # GitHub Pages 正式 Demo
├─ config/
│  ├─ taxonomy.json                   # 分類與客群唯一設定來源
│  ├─ source-whitelist.json           # 核准新聞網站白名單
│  └─ focus-scoring.json              # 候選數量、評分權重與排序規則
├─ data/
│  ├─ index.json                      # 可選日期及最新資料日期
│  ├─ schema.json                     # 每日資料結構
│  └─ YYYY-MM-DD.json                 # 網頁使用的每日資料
├─ rawdata/
│  └─ YYYY-MM-DD.raw.json             # 來源文章與事件整併資料
├─ scripts/
│  ├─ validate-data.mjs               # 每日資料驗證
│  └─ validate-skills.mjs             # Skills 與設定驗證
├─ .agents/skills/                    # AI 每日更新流程
├─ demo-site/                         # 早期 React／Next.js 示範，非目前正式頁面
├─ PROJECT_PLAN.md                    # MVP 規劃與待辦
└─ project_concept.png                # 初始專案概念圖
```

## 主要設定檔

### 分類與客群

[`config/taxonomy.json`](config/taxonomy.json) 是分類與客群的唯一清單。

```json
{
  "schema_version": "1.0.0",
  "all_topic": "全部",
  "topics": ["投資理財", "貸款", "信用卡", "新鮮事", "AI"],
  "audiences": ["高資產", "定存", "頂級卡", "貸款"]
}
```

新增分類或客群後，若需要專屬判斷邊界或內容規則，也要補充對應 Skill 的規則文件。

### 新聞來源白名單

[`config/source-whitelist.json`](config/source-whitelist.json) 是新聞網站的唯一可執行清單。

```json
{
  "id": "example-news",
  "name": "範例新聞網",
  "domains": ["news.example.com"],
  "priority": 2,
  "source_type": "reporting",
  "topics": ["投資理財", "AI"],
  "notes": "財經、產業與科技新聞"
}
```

- `domains` 填文章所在網域，不加 `https://` 或文章路徑。
- `priority: 1` 用於官方、原始或發布者來源。
- `priority: 2` 用於通訊社、主流媒體或專業媒體。
- `source_type` 可使用 `primary`、`issuer` 或 `reporting`。
- `topics` 必須存在於 Taxonomy；使用 `["*"]` 表示適用全部分類。

### 焦點評分

[`config/focus-scoring.json`](config/focus-scoring.json) 管理候選數量、網頁分頁與焦點權重。

| 評分項目 | 權重 |
| --- | ---: |
| 事件重要性 | 40 |
| 獨立來源涵蓋 | 25 |
| 首頁、熱門榜或重要版位 | 20 |
| 客群相關性 | 10 |
| 時效性 | 5 |

每個主題以蒐集 15–30 篇候選文章為目標；合格事件不因版面限制而刪除，網頁每頁顯示 10 則。

## 資料檔案

### Raw Data

`rawdata/YYYY-MM-DD.raw.json` 保存：

- 快報日期與搜尋窗口。
- 文章來源、標題、網址及發布時間。
- 可取得的清理後內容。
- 文章候選分類。
- 事件整併結果與處理註記。

Raw Data 用於保留資料來源與後續重跑依據，不直接由網頁顯示。

### Web JSON

`data/YYYY-MM-DD.json` 保存：

- 每日概況及各主題摘要。
- 分類與客群清單。
- 完成整併、摘要及排序的新聞事件。
- 關鍵字、影響說明與多個來源連結。
- 所有「主題 × 客群」溝通建議。
- 警告及人工檢查項目。

網頁資料不保存完整新聞文章正文。

### 日期索引與 Schema

- [`data/index.json`](data/index.json)：決定日曆中哪些日期可選，以及預設載入的最新日期。
- [`data/schema.json`](data/schema.json)：定義每日 JSON 欄位與資料型別。
- Taxonomy 決定允許的分類與客群；Schema 只負責資料結構。

## 本機預覽

因為網頁透過 `fetch()` 讀取 JSON，請使用本機 HTTP Server，不要直接以 `file://` 開啟。

在專案根目錄執行：

```powershell
npx serve . -l 8765
```

接著開啟：

```text
http://127.0.0.1:8765/
```

也可使用 VS Code Live Server 或其他靜態網站伺服器。

## 驗證

需要 Node.js。於專案根目錄執行：

```powershell
node scripts/validate-data.mjs
node scripts/validate-skills.mjs
```

`validate-data.mjs` 會檢查：

- 每日資料是否符合 Taxonomy 與必要欄位。
- 事件分類、客群、來源及日期是否合法。
- 焦點分數是否等於各項評分加總。
- 多來源事件日期是否採用最早來源日期。
- 主題概況及所有客群話術組合是否齊全。
- `data/index.json` 是否對應實際存在的每日資料。

`validate-skills.mjs` 會檢查：

- Skills frontmatter 與介面資訊。
- Taxonomy 內容與重複值。
- 新聞白名單欄位、網域重複及適用主題。
- 焦點評分權重是否合計為 100。
- 候選數量與網頁分頁設定。

## GitHub Pages 與發布流程

正式 Demo：

```text
https://ktlin318.github.io/DailyNews/
```

目前發布流程：

1. 從 `main` 建立功能分支。
2. 完成修改並在本機預覽。
3. 執行資料與 Skills 驗證。
4. 推送功能分支。
5. 建立 Pull Request，說明修改內容、目的與驗證結果。
6. 確認無誤後合併至 `main`。
7. GitHub Pages 從 `main` 更新正式頁面。

PR 是主要異動紀錄；README 不重複保存每次修改歷史。

## 內容與來源規則

- 摘要、影響與溝通內容只能依據可追溯來源。
- 數字、日期、時間、單位、人物及引述不得由 AI 自主生成。
- 相同事件若有多個新聞網站，應保留各自的來源名稱與網址。
- 轉載頁與原始發布者要分開記錄，不能用一個網址代表兩個網站。
- 搜尋結果片段不能作為唯一證據。
- 不使用社群貼文、論壇、內容農場、無編輯責任的聚合網站或 AI 生成新聞頁面。
- 不繞過付費、登入、robots、驗證碼或其他網站限制。
- 本專案內容為新聞整理與溝通素材，不構成投資、貸款或法律建議。

## 目前狀態

已完成：

- Version 1.0 靜態 Demo 與 GitHub Pages。
- 日期日曆、主題篩選、搜尋、標籤與分頁。
- 客群溝通建議頁籤及響應式版面。
- Raw Data、Web JSON、Schema 與日期索引。
- 分類、客群、來源與焦點評分設定檔。
- 六個可獨立維護的 AI Skills。
- 資料與 Skills 驗證程式。

尚待完成：

- 建立每日固定排程。
- 將 AI 搜尋與資料更新串成可重複執行的自動化工作。
- 自動建立每日資料更新 Pull Request。
- 累積更多日期與來源資料。
- 建立分類、客群及新聞來源的管理介面。
- 增加更完整的熱門榜、首頁版位與跨來源證據。
- 建立人工審核、錯誤更正及發布狀態管理。

## 相關文件

- [`PROJECT_PLAN.md`](PROJECT_PLAN.md)：MVP 目標、架構及後續工作。
- [`project_concept.png`](project_concept.png)：初始專案概念圖。
- [`data/schema.json`](data/schema.json)：每日網頁資料格式。
- [`config/taxonomy.json`](config/taxonomy.json)：分類與客群。
- [`config/source-whitelist.json`](config/source-whitelist.json)：新聞來源白名單。
- [`config/focus-scoring.json`](config/focus-scoring.json)：焦點評分設定。
