# w-dwdata-tweqod 規則帳本(藍圖)

> 本檔為程式碼須長成什麼樣之規則,附判準與對應測試;**現況**(各條做到哪裡)見 `sgud/state/state.md`。
> 套件定位:`WDwdataTweqod`——基於檔案之下載台灣氣象署 OpenData 地震數據與任務建構器(下載、以 hash 比對、依新增/變更/刪除處理、搬移結果)。

## 1. wsemi 列舉函數之用法(`fsTreeFolder` 等)

> 需求出處:wsemi 1.9.80 起列舉函數(`fsTreeFolder`、`fsTreeFolderWithHash`、`fsGetFilesInFolder`、`fsGetFilesWithHashInFolder`、`fsGetFoldersInFolder` 及各 `*Core`)之第 2 參數由 `levelLimit`(舊預設 1 層)改為 `opt = {}`,`opt.levelLimit` 為有效正整數才限層,**未給即窮舉全部層級**;給了而非物件(含舊寫法之數字)拋 `invalid opt: must be an object`;Gitea #220。
> 盤點指令(每處須為 `{ levelLimit: n }` 或表意窮舉之省略,不得為數字):`git grep -nE "\b(fsTreeFolder|fsTreeFolderWithHash|fsGetFilesInFolder|fsGetFilesWithHashInFolder|fsGetFoldersInFolder)(Core)?\s*\(" -- . ':!dist' ':!docs'`

| 條號 | 規則 | 判準 / 對應測試 | 狀態 |
|---|---|---|---|
| R-WS-01 | `src/WDwdataTweqod.mjs` 之 2 處列舉皆僅限第 1 層,寫為 `fsTreeFolder(…, { levelLimit: 1 })`,**不得省略第 2 參數**(省略即窮舉)、**不得傳數字**:`treeFilesAndGetHashs`(列舉 `fdDwAttime`,預設 `funDownload` 內取舊 hash 清單,`fdDwAttime` 為 `fdDwCurrent` 之複本)、預設 `funGetCurrent`(`funGetCurrentDef`,列舉 `fdDwCurrent`) | 盤點指令見本節表上方;`test/unit-levelLimit.test.mjs`:`fdDwCurrent` 內有第 1 層檔案與「子資料夾及其內第 2 層檔案」時,以 `fs.readFileSync` 替身(僅攔截 `fdDwCurrent` 與 `fdDwAttime` 之下之路徑)觀察 2 處列舉各自交出之項目,須各為第 1 層之 2 項,`proc-callfun-getCurrent` 之 `num` 為 2;各處改為省略或 `{ levelLimit: 2 }` 之變異皆使該案轉紅。**為何須用替身**:2 處之消費端皆逐項 `JSON.parse(fs.readFileSync(path))` 而不濾除資料夾項目,資料夾項目於真實檔案系統不可讀(EISDIR),故不論層數,第 1 層有子資料夾即失敗,黑箱無法分辨層數 | 已做 |
| R-WS-02 | 依賴 `wsemi` ≥ 1.9.80 | `package.json` 之版本範圍 | 已做 |

## 2. 逐項處理失敗與下輪重試

> 需求出處:Gitea #216。行為由依賴提供:`w-data-scheduler`(逐項處理)與 `w-dwdata-builder`(`fdDwCurrent` 之更新);本庫 `src` 不另寫。

| 條號 | 規則 | 判準 / 對應測試 | 狀態 |
|---|---|---|---|
| R-ERR-01 | 單項 `funAdd`／`funModify`／`funRemove` 拋錯或 reject **不中止本輪**:該項發 `error`,其餘項照常處理,逐項處理後發 1 筆 `warn` 事件 `fail-items-stage-main`(`numFail`、`items`、`msg`;`srLog.warn` 同收),不發取消事件、不輸出取消訊息。**階段層級錯誤**(如下載拋錯)仍取消本輪,發 `cancel-stage-main` 與 `cancel-stage-beforeEnd` | `test/unit-srLog.test.mjs`:單項失敗之完整事件序列、`srLog.warn`、console 輸出次數;下載階段拋錯之事件序列與 console 輸出次數(`funRemove`、`funModify` 之事件序列未另測,屬依賴之行為) | 已做 |
| R-ERR-02 | 預設 `funDownload`(`funDownloadDef`)之 hash 數據檔**逐項存為 `fdDwAttime/<id>.json`**,不得改檔名或併為單檔:有失敗項之輪,builder 僅依 `<主鍵值>.json` 把成功項搬入 `fdDwCurrent`,失敗項維持前次內容,下輪比對仍有差異而重試 | `test/unit-retry.test.mjs`(新增與變更各 1 案:成功項進 `fdDwCurrent`、失敗項不進、下輪只重試失敗項);把新增、變更、兩者之檔名改掉之變異,及預設 `funGetCurrent` 改讀 `fdDwAttime` 之變異皆使該檔轉紅 | 已做 |
| R-ERR-03 | 依賴 `w-dwdata-builder` ≥ 1.1.46(其依賴 `w-data-scheduler` ≥ 1.0.77) | `package.json` 之版本範圍;`unit-srLog` 之 4 案(`srLog.warn`、完整事件序列、console 輸出 2 案)與 `unit-retry` 2 案對 `w-dwdata-builder` 1.1.45＋`w-data-scheduler` 1.0.76 轉紅 | 已做 |
