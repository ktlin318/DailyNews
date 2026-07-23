---
name: validate-package-daily-data
description: 依 DailyNews Schema 與固定驗證程式檢查每日新聞、來源、日期、焦點分數、主題概況及客群話術，封裝網頁 JSON 並更新日期索引。當需要驗證或輸出 data/YYYY-MM-DD.json、更新 data/index.json、排查網頁資料載入問題時使用。
---

# 每日資料驗證與封裝

## 角色

擔任確定性品質閘門與資料封裝員。只驗證、組裝及報告錯誤，不使用 AI 猜測缺漏值，也不自動推送 GitHub。

## 目標

把前面各階段結果組裝成符合 `data/schema.json` 的每日網頁資料，通過固定驗證後更新日期索引，同時保留 raw data。

## 必讀資料

執行前完整讀取：

- `references/output-contract.md`：每日檔案與索引契約。
- `../../../config/taxonomy.json`：主題與客群的唯一設定來源。
- `../../../data/schema.json`：唯一機器可讀格式標準。
- `../../../scripts/validate-data.mjs`：固定驗證程式。
- 當日 raw data、事件資料、主題概況與客群話術。

## 必要輸入

- 快報日期、時區及來源窗口。
- 已分類與摘要的事件。
- 每日概況、主題概況及所有客群話術。
- `warnings` 與 `manual_review_items`。

## 執行流程

1. 組裝 `data/YYYY-MM-DD.json`，不得臨時加入 Schema 未定義欄位。
2. 讀取 Taxonomy 的主題及客群，確認每日檔案中的陣列與順序完全一致。
3. 檢查每個事件 ID 唯一、來源至少一個、網址為 HTTPS、日期格式正確。
4. 檢查 `published_date` 使用所有來源中最早的日期。
5. 檢查 `focus_score` 等於五個分項總和，且事件依分數由高至低排序。
6. 檢查所有主題概況及所有「主題｜客群」話術組合存在。
7. 檢查 raw data 仍存在，公開 JSON 沒有不必要的完整文章正文。
8. 執行 `node scripts/validate-data.mjs`。
9. 驗證成功後，才把日期加入 `data/index.json`，維持新到舊排序並更新 `latest`。
10. 再次執行驗證，確認索引與檔案都可解析。
11. 輸出驗證報告；GitHub commit、PR 與 merge 交由既有 GitHub 發佈流程處理。

## 輸出契約

- `data/YYYY-MM-DD.json`
- 更新後的 `data/index.json`
- 保留的 `rawdata/YYYY-MM-DD.raw.json`
- 驗證結果、警告與人工檢查清單

## 規則

- 驗證器失敗時不得更新索引或宣稱完成。
- 不為了通過格式而自動生成新聞、來源、數字、日期、話術或缺少的主題內容。
- 不修改來源網址來掩蓋失效頁面。
- 不把 raw data 的完整正文直接放入網頁 JSON。
- 不在此 Skill 自動 commit、push、建立 PR 或合併。
- Schema 改動要先說明相容性及遷移影響，再更新所有日期資料。
- 固定規則用程式驗證，不能只以人工閱讀或 AI 判斷代替。

## 停止條件

- JSON 無法解析或不符合 Schema。
- 事件缺少來源、摘要、分類理由或證據註記。
- 分數合計錯誤、排序錯誤或最早來源日期不一致。
- 主題與客群組合不完整。
- 驗證程式執行失敗。

停止時保留原始檔案，列出精確檔名、欄位路徑與錯誤原因。

## 品質檢查

確認每日檔、日期索引及 raw data 三者日期一致；確認網頁可載入、分頁不依賴刪除新聞、來源連結完整、警告沒有被遺漏，且 Git 工作目錄只包含預期變更。
