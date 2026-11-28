# w-dwdata-tweqod 狀態(現況)

> 只記現況,不寫過程(過程見 `sgud/exp/experience.md`)。規則見 `sgud/rule/rulebook.md`。

## 1. wsemi 列舉函數之第 2 參數遷移(R-WS-01、R-WS-02)

- R-WS-01、R-WS-02 已做(依賴版本見第 3 節)。
- 站點全集(`src` 共 2 處,README 與根目錄範例無列舉呼叫),皆為 `fsTreeFolder(…, { levelLimit: 1 })`,語意為只列第 1 層,與舊寫法(第 2 參數為數字 1)一致:
  - `src/WDwdataTweqod.mjs:258` `treeFilesAndGetHashs`(預設 `funDownload` 內列舉 `fdDwAttime`,其為 `fdDwCurrent` 之複本)
  - `src/WDwdataTweqod.mjs:374` 預設 `funGetCurrent`(列舉 `fdDwCurrent`)
- 層數語意案為 `test/unit-levelLimit.test.mjs`;2 處各改為省略第 2 參數或 `{ levelLimit: 2 }` 之 4 項變異皆使該案轉紅(258 處之變異只使 `fdDwAttime` 之觀察值不符,374 處之變異只使 `fdDwCurrent` 與 `num` 不符);修前版(舊寫法)對 wsemi 1.9.80 之既有測試為 2 綠、8 紅(`invalid opt: must be an object`)。
- 已知缺口:2 處之消費端逐項讀取並 `JSON.parse`,未濾除資料夾項目,第 1 層含子資料夾時會因讀取資料夾(EISDIR)而失敗(與列舉層數無關,舊寫法亦然);正常流程下 `fdDwCurrent` 只含檔案。屬範圍外,未修。

## 2. 逐項處理失敗與下輪重試(R-ERR-01～03)

- R-ERR-01～03 已做;行為由依賴提供,`src` 未另改。
- 已知缺口(皆須改 `src`,待裁示):
  - 預設 `funAdd`／`funModify`／`funRemove` 不檢查 wsemi 檔案函數回傳之 `{ error }`,檔案操作失敗時該項仍列為成功、進 `fdDwCurrent`、不重試(實測:預設 `funAdd` 之複製來源檔不存在時,本輪結果列成功、無 `warn`／`error` 事件、`fdResult` 內無檔)。
  - `src/WDwdataTweqod.mjs` 之 JSDoc 過時:`opt.srLog` 寫「其中warn目前保留未使用」(現用於 `fail-items-stage-main` 等彙總紀錄);函數說明寫「前次hash數據會於結束前自動備份至fdDwCurrent」(有失敗或未處理項之輪只搬入成功項,取消之輪不更新)。
- 自訂 `funDownload` 而未逐項以 `<id>.json` 存放於 `fdDwAttime` 者:有失敗項之輪,成功項亦不搬入 `fdDwCurrent`(builder 發 `warn` 事件 `move-data-to-current`),下輪重新處理(依 builder 原始碼,本庫未另測)。

## 3. 依賴與測試

- 依賴:`w-dwdata-builder` ^1.1.46、`wsemi` ^1.9.83;`w-package-tools` ^1.1.32(devDependencies)。
- 測試:`npm test`(5 檔 16 案)全綠;最近一次驗證 2026-11-28(版本 1.0.91,未發布本輪改動)。
- 回饋與提案見 `sgud/feedback/feedback.md`。
