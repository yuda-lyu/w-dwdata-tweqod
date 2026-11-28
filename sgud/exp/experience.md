# w-dwdata-tweqod 經驗

## 1. wsemi 列舉函數第 2 參數改為 opt(2026-11-26,Gitea #220)

- 舊寫法(第 2 參數為數字層數)於新版拋 `invalid opt: must be an object`;省略第 2 參數(舊預設 1 層)則靜默變窮舉。本庫 2 處站點(`treeFilesAndGetHashs` 列舉 `fdDwAttime`、預設 `funGetCurrent` 列舉 `fdDwCurrent`)皆改為 `{ levelLimit: 1 }`,語意不變(只列第 1 層)。
- **層數之觀察須用 `fs.readFileSync` 替身**:2 處之消費端皆逐項 `JSON.parse(fs.readFileSync(path))` 而不濾除資料夾項目,第 1 層有子資料夾時,第 1 層列舉與窮舉列舉都於讀取該資料夾項目時失敗(EISDIR),只看結果分不出層數;替身只攔截 `fdDwCurrent` 與 `fdDwAttime` 之下之路徑、對資料夾回傳固定 JSON 使讀取不中斷,其餘委託原函數,測試後以 `mock.restore()` 還原。`src` 以 `fs.readFileSync(...)` 呼叫(非具名匯入),替身才攔得到。
- 修前版對 wsemi 1.9.80 之測試為紅(`invalid opt: must be an object`);取法:`git show HEAD:<檔>` 寫入 `./tmp/` 之鏡像根,以鏡像根為工作目錄跑 mocha。變異/修前鏡像根跑 mocha 建議加 `--exit`(失敗案可能使假伺服器未關而不退出)。

## 2. 依賴改為單項失敗不中止本輪後之測試(2026-11-28,Gitea #216)

- 單項 `funAdd` 拋錯之事件序列:`error` 之後多 1 筆 `warn` `fail-items-stage-main`,不再有 `cancel-stage-main`、`cancel-stage-beforeEnd`,console 只剩該項之錯誤。取消事件與取消訊息只在階段層級錯誤出現,以 `funDownloadEqs` 拋錯可重現;改寫斷言時另留一組階段層級錯誤之案,取消路徑才仍有測試。
- 重試行為以下列觀察:預設 `funDownload`／`funGetCurrent` 下讀 `fdDwCurrent` 內各 `<id>.json`,預期 hash 為完整數據 JSON 之 md5。預設 `funDownload` 以 lodash `reverse` **就地反轉** `funDownloadEqs` 回傳之陣列,跨輪重用同一陣列之測試須回傳複本。
- 只改依賴版本時之「舊行為紅」:`npm pack <套件>@<舊版>` 解到 `./tmp/` 鏡像根之 `node_modules/<套件>/`(只放要換回之套件,其餘相依向上解析至本庫),以鏡像根為工作目錄跑 mocha。
