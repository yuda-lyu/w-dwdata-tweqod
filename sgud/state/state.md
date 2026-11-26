# w-dwdata-tweqod 狀態(現況)

> 只記現況,不寫過程(過程見 `sgud/exp/experience.md`)。規則見 `sgud/rule/rulebook.md`。

## 1. wsemi 列舉函數之第 2 參數遷移(R-WS-01、R-WS-02)

- 2026-11-26 完成:依賴升至 `wsemi` ^1.9.80、`w-dwdata-builder` ^1.1.41(已為最新)、`w-package-tools` ^1.1.32(devDependencies)。
- 站點全集(`src` 共 2 處,README 與根目錄範例無列舉呼叫),皆為 `fsTreeFolder(…, { levelLimit: 1 })`,語意為只列第 1 層,與舊寫法(第 2 參數為數字 1)一致:
  - `src/WDwdataTweqod.mjs:258` `treeFilesAndGetHashs`(預設 `funDownload` 內列舉 `fdDwAttime`,其為 `fdDwCurrent` 之複本)
  - `src/WDwdataTweqod.mjs:374` 預設 `funGetCurrent`(列舉 `fdDwCurrent`)
- 測試:`npm test`(4 檔 11 案)全綠,其中 `test/unit-levelLimit.test.mjs` 為本次新增之層數語意案;2 處各改為省略第 2 參數或 `{ levelLimit: 2 }` 之 4 項變異皆使該案轉紅(258 處之變異只使 `fdDwAttime` 之觀察值不符,374 處之變異只使 `fdDwCurrent` 與 `num` 不符);修前版(舊寫法)對 wsemi 1.9.80 之既有測試為 2 綠、8 紅(`invalid opt: must be an object`)。
- 已知缺口:2 處之消費端逐項讀取並 `JSON.parse`,未濾除資料夾項目,第 1 層含子資料夾時會因讀取資料夾(EISDIR)而失敗(與列舉層數無關,舊寫法亦然);正常流程下 `fdDwCurrent` 只含檔案。屬範圍外,未修。
