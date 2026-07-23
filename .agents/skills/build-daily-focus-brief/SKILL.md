---
name: build-daily-focus-brief
description: 協調 DailyNews 每日更新的完整流程，依序執行核准來源蒐集、事件整併與排序、分類與摘要、客群內容產製、資料驗證與封裝。當需要建立新日期快報、重跑整日資料、檢查流程卡點或統整各階段結果時使用。
---

# 每日焦點快報總控

## 角色

擔任每日快報流程總控。負責確認執行參數、安排五個執行 Skill、檢查階段交接與彙整結果，不在總控層重複新聞搜尋、分類或摘要規則。

## 目標

從指定日期與來源窗口開始，產出可追溯 raw data、完成排序的新聞事件、網頁摘要、主題概況、客群話術及通過驗證的每日 JSON。

## 必讀資料

執行前完整讀取：

- `references/pipeline-contract.md`：各階段順序、輸入輸出與失敗處理。
- `../../../config/taxonomy.json`：目前有效的主題與客群唯一設定來源。
- `../../../data/schema.json`：每日資料格式。
- `../../../config/source-whitelist.json`：核准新聞來源。
- `../../../config/focus-scoring.json`：候選數、焦點評分與排序設定。

## 必要輸入

- 快報日期。
- 時區，預設 `Asia/Taipei`。
- 搜尋窗口起訖時間。
- 是否重跑既有日期。
- 需要暫停的來源、主題或特殊限制。

缺少會改變新聞範圍的必要輸入時，先詢問使用者；不自行假設日期或截止時間。

## 執行順序

1. 使用 `$collect-approved-news` 蒐集白名單來源並建立文章層 raw data。
2. 使用 `$group-rank-news-events` 整併相同事件、保留多來源、計算焦點分數並排序。
3. 使用 `$classify-summarize-news` 依 Schema 分類，產生摘要、影響、關鍵字與證據註記。
4. 使用 `$generate-audience-content` 產生每日概況、主題概況及所有客群話術。
5. 使用 `$validate-package-daily-data` 組裝每日檔、執行固定驗證並更新日期索引。
6. 彙整候選文章數、事件數、各主題數、警告、人工檢查項目與驗證結果。

前一階段未完成或契約不符時，不得跳到下一階段。

## 共通規則

- AI 可用於搜尋、語意整併、重要性判斷、分類、摘要及話術；固定欄位、數字核對、Schema、分數加總與日期索引使用確定性規則。
- 新聞來源白名單只由 `config/source-whitelist.json` 管理。
- 主題與客群只由 `config/taxonomy.json` 管理。
- 焦點權重只由 `config/focus-scoring.json` 管理。
- raw data 與網頁 JSON 分開保存；網頁 JSON 不存完整文章正文。
- 不使用 Python 爬蟲或批次抓站；新聞蒐集交由 AI 搜尋公開頁面。
- 不繞過付費牆、登入、robots、驗證碼或其他存取限制。
- 數字、日期、時間、單位、人物與引述不可由 AI 自主生成。
- 同事件多來源必須各自保留名稱與網址。
- 總控不自動推送或合併 GitHub；發布需另外使用既有 GitHub PR 流程。

## 停止條件

- 日期、時區或搜尋窗口不完整。
- 白名單、Taxonomy、Schema 或評分設定缺失。
- 任何階段產生無法解析的資料。
- 來源衝突影響核心結論。
- 驗證器失敗。

停止時保存已完成階段，說明卡在哪個 Skill、缺少什麼資料及可安全重跑的起點。

## 完成標準

- 每個主題有足量候選文章或清楚的不足說明。
- 相同事件已整併且多來源連結完整。
- 事件依焦點分數排序，沒有為版面刪除合格事件。
- 分類、摘要、概況與話術符合目前 Taxonomy 與 Schema。
- `data/YYYY-MM-DD.json`、`rawdata/YYYY-MM-DD.raw.json` 與 `data/index.json` 日期一致。
- `node scripts/validate-data.mjs` 通過。
- 輸出完整執行報告與人工檢查項目。
