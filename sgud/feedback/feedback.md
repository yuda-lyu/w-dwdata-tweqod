# w-dwdata-tweqod 回饋

> 任務中發現之自有套件、全域技能、全域設定之調整與抽提提案;只增不改,處置結果另記一列。

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-28 | 自有套件 | `w-dwdata-tweqod` 之預設 `funAdd`／`funModify`／`funRemove` | 不檢查 wsemi 檔案函數(`fsCopyFile` 等)回傳之 `{ error }`:檔案操作失敗時該項仍列為成功、進 `fdDwCurrent`,依賴新增之「失敗項下輪重試」對預設函數無效。建議檢查回傳值,有 `error` 即拋出;以同類寫法實作預設處理函數之下載建構套件建議一併盤點(本輪未查他套件) | `src/WDwdataTweqod.mjs` 之 `funRemoveDef`、`funAddDef`、`funModifyDef`;實測:預設 `funAdd` 之複製來源檔不存在時,本輪結果 `success.add` 含該項、`failed` 為空、無 `warn`／`error` 事件、`fdResult` 內無檔 |
| 2026-11-28 | 自有套件 | `w-dwdata-tweqod` 之 `funDownloadDef` | 以 lodash `reverse` 就地反轉使用端 `funDownloadEqs` 回傳之陣列,使用端重用同一陣列(如快取)時其順序逐輪被翻轉。建議先複製再反轉 | `src/WDwdataTweqod.mjs` 之 `funDownloadDef`(`eqs = reverse(eqs)`);讀碼,未另以測試觀察 |
