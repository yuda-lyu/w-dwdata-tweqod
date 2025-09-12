import fs from 'fs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import reverse from 'lodash-es/reverse.js'
import values from 'lodash-es/values.js'
import isbol from 'wsemi/src/isbol.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isp0int from 'wsemi/src/isp0int.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import ispm from 'wsemi/src/ispm.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import pmSeries from 'wsemi/src/pmSeries.mjs'
import fsIsFolder from 'wsemi/src/fsIsFolder.mjs'
import fsCopyFile from 'wsemi/src/fsCopyFile.mjs'
import fsCleanFolder from 'wsemi/src/fsCleanFolder.mjs'
import fsCreateFolder from 'wsemi/src/fsCreateFolder.mjs'
import fsCopyFolder from 'wsemi/src/fsCopyFolder.mjs'
import fsDeleteFolder from 'wsemi/src/fsDeleteFolder.mjs'
import fsTreeFolder from 'wsemi/src/fsTreeFolder.mjs'
import fsGetFileXxHash from 'wsemi/src/fsGetFileXxHash.mjs'
import WDwdataBuilder from 'w-dwdata-builder/src/WDwdataBuilder.mjs'
import downloadEqs from './downloadEqs.mjs'


/**
 * 基於檔案之下載台灣氣象署OpenData地震數據與任務建構器
 *
 * 執行階段最新hash數據放置於fdDwAttime，前次hash數據放置於fdDwCurrent，於結束前會將fdDwAttime複製蓋過fdDwCurrent
 *
 * 執行階段最新數據放置於fdResult，前次數據會另存備份放置於fdResultTemp，於結束前會將fdResultTemp清空
 *
 * @param {String} token 輸入氣象署OpenData之API用token字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.keepAllData=true] 輸入是否儲存全部資料，氣象署地震資料內Intensity可能常變更而觸發事件，可設定keepAllData=false只基於重要數據進行偵測。預設true
 * @param {String} [opt.fdTagRemove='./_tagRemove'] 輸入暫存標記為刪除數據資料夾字串，預設'./_tagRemove'
 * @param {String} [opt.fdDwStorage='./_dwStorage'] 輸入完整下載數據資料夾字串，預設'./_dwStorage'
 * @param {String} [opt.fdDwAttime='./_dwAttime'] 輸入當前下載供比對hash用之數據資料夾字串，預設'./_dwAttime'
 * @param {String} [opt.fdDwCurrent='./_dwCurrent'] 輸入已下載供比對hash用之數據資料夾字串，預設'./_dwCurrent'
 * @param {String} [opt.fdResultTemp=`./_resultTemp`] 輸入若有變更數據時，儲存前次已下載數據所連動生成數據資料夾字串，預設`./_resultTemp`
 * @param {String} [opt.fdResult=`./_result`] 輸入已下載數據所連動生成數據資料夾字串，預設`./_result`
 * @param {String} [opt.fdTaskCpActualSrc='./_taskCpActualSrc'] 輸入任務狀態之來源端完整資料夾字串，預設'./_taskCpActualSrc'
 * @param {String} [opt.fdTaskCpSrc='./_taskCpSrc'] 輸入任務狀態之來源端資料夾字串，預設'./_taskCpSrc'
 * @param {String} [opt.fdLog='./_logs'] 輸入儲存log資料夾字串，預設'./_logs'
 * @param {Function} [opt.funDownloadEqs=null] 輸入自定義下載地震數據函數，回傳資料陣列，預設null
 * @param {Function} [opt.funDownload=null] 輸入自定義當前下載之hash數據處理函數，回傳資料陣列，預設null
 * @param {Function} [opt.funGetCurrent=null] 輸入自定義已下載之hash數據處理函數，回傳資料陣列，預設null
 * @param {Function} [opt.funAdd=null] 輸入當有新資料時，需要連動處理之函數，預設null
 * @param {Function} [opt.funModify=null] 輸入當有資料需更新時，需要連動處理之函數，預設null
 * @param {Function} [opt.funRemove=null] 輸入當有資料需刪除時，需要連動處理之函數，預設null
 * @param {Number} [opt.timeToleranceRemove=0] 輸入刪除任務之防抖時長，單位ms，預設0，代表不使用
 * @returns {Object} 回傳事件物件，可呼叫函數on監聽change事件
 * @example
 *
 * import fs from 'fs'
 * import _ from 'lodash-es'
 * import w from 'wsemi'
 * import WDwdataTweqod from './src/WDwdataTweqod.mjs'
 *
 * let j = fs.readFileSync('../_data/settings.json', 'utf8')
 * let st = JSON.parse(j)
 * let token = _.get(st, 'token')
 *
 * //fdTagRemove
 * let fdTagRemove = `./_tagRemove`
 * w.fsCleanFolder(fdTagRemove)
 *
 * //fdDwStorage
 * let fdDwStorage = `./_dwStorage`
 * w.fsCleanFolder(fdDwStorage)
 *
 * //fdDwAttime
 * let fdDwAttime = `./_dwAttime`
 * w.fsCleanFolder(fdDwAttime)
 *
 * //fdDwCurrent
 * let fdDwCurrent = `./_dwCurrent`
 * w.fsCleanFolder(fdDwCurrent)
 *
 * //fdResultTemp
 * let fdResultTemp = `./_resultTemp`
 * w.fsCleanFolder(fdResultTemp)
 *
 * //fdResult
 * let fdResult = `./_result`
 * w.fsCleanFolder(fdResult)
 *
 * //fdTaskCpActualSrc
 * let fdTaskCpActualSrc = `./_taskCpActualSrc`
 * w.fsCleanFolder(fdTaskCpActualSrc)
 *
 * //fdTaskCpSrc
 * let fdTaskCpSrc = `./_taskCpSrc`
 * w.fsCleanFolder(fdTaskCpSrc)
 *
 * let opt = {
 *     keepAllData: false,
 *     fdTagRemove,
 *     fdDwStorage,
 *     fdDwAttime,
 *     fdDwCurrent,
 *     fdResultTemp,
 *     fdResult,
 *     fdTaskCpActualSrc,
 *     fdTaskCpSrc,
 *     // fdLog,
 *     // funDownload,
 *     // funGetCurrent,
 *     // funRemove,
 *     // funAdd,
 *     // funModify,
 * }
 * let ev = await WDwdataTweqod(token, opt)
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * ev.on('change', (msg) => {
 *     delete msg.type
 *     console.log('change', msg)
 * })
 * // change { event: 'start', msg: 'running...' }
 * // change { event: 'proc-callfun-afterStart', msg: 'start...' }
 * // change { event: 'proc-callfun-afterStart', msg: 'done' }
 * // change { event: 'proc-callfun-download', msg: 'start...' }
 * // change { event: 'proc-callfun-download', num: 2, msg: 'done' }
 * // change { event: 'proc-callfun-getCurrent', msg: 'start...' }
 * // change { event: 'proc-callfun-getCurrent', num: 0, msg: 'done' }
 * // change { event: 'compare', msg: 'start...' }
 * // change { event: 'compare', numRemove: 0, numAdd: 2, numModify: 0, numSame: 0, msg: 'done' }
 * // change { event: 'proc-add-callfun-add', id: '114101', msg: 'start...' }
 * // change { event: 'proc-add-callfun-add', id: '114101', msg: 'done' }
 * // change { event: 'proc-add-callfun-add', id: '114102', msg: 'start...' }
 * // change { event: 'proc-add-callfun-add', id: '114102', msg: 'done' }
 * // ...
 *
 */
let WDwdataTweqod = async(token, opt = {}) => {

    //keepAllData
    let keepAllData = get(opt, 'keepAllData')
    if (!isbol(keepAllData)) {
        keepAllData = true
    }

    //fdTagRemove, 暫存標記為刪除數據資料夾
    let fdTagRemove = get(opt, 'fdTagRemove')
    if (!isestr(fdTagRemove)) {
        fdTagRemove = `./_tagRemove`
    }

    //fdDwStorage
    let fdDwStorage = get(opt, 'fdDwStorage')
    if (!isestr(fdDwStorage)) {
        fdDwStorage = `./_dwStorage`
    }
    if (!fsIsFolder(fdDwStorage)) {
        fsCreateFolder(fdDwStorage)
    }

    //fdDwAttime
    let fdDwAttime = get(opt, 'fdDwAttime')
    if (!isestr(fdDwAttime)) {
        fdDwAttime = `./_dwAttime`
    }
    if (!fsIsFolder(fdDwAttime)) {
        fsCreateFolder(fdDwAttime)
    }

    //fdDwCurrent
    let fdDwCurrent = get(opt, 'fdDwCurrent')
    if (!isestr(fdDwCurrent)) {
        fdDwCurrent = `./_dwCurrent`
    }
    if (!fsIsFolder(fdDwCurrent)) {
        fsCreateFolder(fdDwCurrent)
    }

    //fdResultTemp
    let fdResultTemp = get(opt, 'fdResultTemp')
    if (!isestr(fdResultTemp)) {
        fdResultTemp = `./_resultTemp`
    }
    if (!fsIsFolder(fdResultTemp)) {
        fsCreateFolder(fdResultTemp)
    }

    //fdResult
    let fdResult = get(opt, 'fdResult')
    if (!isestr(fdResult)) {
        fdResult = `./_result`
    }
    if (!fsIsFolder(fdResult)) {
        fsCreateFolder(fdResult)
    }

    //fdTaskCpActualSrc, 儲存完整任務狀態資料夾
    let fdTaskCpActualSrc = get(opt, 'fdTaskCpActualSrc')
    if (!isestr(fdTaskCpActualSrc)) {
        fdTaskCpActualSrc = `./_taskCpActualSrc`
    }
    if (!fsIsFolder(fdTaskCpActualSrc)) {
        fsCreateFolder(fdTaskCpActualSrc)
    }

    //fdTaskCpSrc
    let fdTaskCpSrc = get(opt, 'fdTaskCpSrc')
    if (!isestr(fdTaskCpSrc)) {
        fdTaskCpSrc = './_taskCpSrc'
    }
    if (!fsIsFolder(fdTaskCpSrc)) {
        fsCreateFolder(fdTaskCpSrc)
    }

    //fdLog
    let fdLog = get(opt, 'fdLog')
    if (!isestr(fdLog)) {
        fdLog = './_logs'
    }
    if (!fsIsFolder(fdLog)) {
        fsCreateFolder(fdLog)
    }

    //funDownloadEqs
    let funDownloadEqs = get(opt, 'funDownloadEqs')

    //funDownload
    let funDownload = get(opt, 'funDownload')

    //funGetCurrent
    let funGetCurrent = get(opt, 'funGetCurrent')

    //funAdd
    let funAdd = get(opt, 'funAdd')

    //funModify
    let funModify = get(opt, 'funModify')

    //funRemove
    let funRemove = get(opt, 'funRemove')

    //timeToleranceRemove
    let timeToleranceRemove = get(opt, 'timeToleranceRemove')
    if (!isp0int(timeToleranceRemove)) {
        timeToleranceRemove = 0
    }
    timeToleranceRemove = cdbl(timeToleranceRemove)

    //treeFilesAndGetHashs
    let treeFilesAndGetHashs = (fd) => {

        //vfps
        let vfps = fsTreeFolder(fd, 1)
        // console.log('vfps', vfps)

        //ltdtHash
        let ltdtHash = []
        each(vfps, (v) => {

            let j = fs.readFileSync(v.path, 'utf8')
            let o = JSON.parse(j)

            ltdtHash.push(o)

        })

        return ltdtHash
    }

    //funDownloadDef
    let funDownloadDef = async() => {

        //eqs
        let eqs = []
        if (isfun(funDownloadEqs)) {
            eqs = funDownloadEqs()
            if (ispm(eqs)) {
                eqs = await eqs
            }
        }
        else {
            eqs = await downloadEqs(token, { keepAllData })
            // console.log('eqs', eqs, size(eqs))
            // eqs = [eqs[0], eqs[1]]
            // fs.writeFileSync('./temp.json', JSON.stringify(eqs, null, 2), 'utf8')
        }

        //reverse
        eqs = reverse(eqs)

        //清空fdDwAttime
        fsCleanFolder(fdDwAttime)

        //複製已下載供比對hash用數據fdDwCurrent至fdDwAttime
        fsCopyFolder(fdDwCurrent, fdDwAttime)

        //ltdtHashOld, 數據來源為fdDwCurrent, 故為舊hash數據清單
        let ltdtHashOld = treeFilesAndGetHashs(fdDwAttime)

        //kpHash, 基於舊hash數據建構字典物件
        let kpHash = {}
        each(ltdtHashOld, (v) => {
            kpHash[v.id] = v
        })

        //逐筆偵測與更新
        await pmSeries(eqs, async(v) => {

            //先儲存解析後數據至存放完整數據資料夾fdDwStorage
            let fp = `${fdDwStorage}/${v.id}.json`
            fs.writeFileSync(fp, JSON.stringify(v), 'utf8')

            //計算檔案hash值, 為新hash
            let hashNew = await fsGetFileXxHash(fp)

            //check
            if (haskey(kpHash, v.id)) {
                //為已下載過之地震數據

                //舊hash
                let hashOld = kpHash[v.id].hash

                //check
                if (hashNew !== hashOld) {

                    //update
                    kpHash[v.id].hash = hashNew

                    //儲存更新後之新地震hash數據檔案
                    let fp = `${fdDwAttime}/${v.id}.json`
                    fs.writeFileSync(fp, JSON.stringify(kpHash[v.id]), 'utf8')

                }
                else {
                    //不用更新hash檔案
                }

            }
            else {
                //為新增之地震數據

                //add
                kpHash[v.id] = {
                    id: v.id,
                    hash: hashNew,
                }

                //儲存新地震hash數據檔案
                let fp = `${fdDwAttime}/${v.id}.json`
                fs.writeFileSync(fp, JSON.stringify(kpHash[v.id]), 'utf8')

            }

        })

        //ltdtHashNew
        let ltdtHashNew = values(kpHash)

        return ltdtHashNew
    }
    if (!isfun(funDownload)) {
        funDownload = funDownloadDef
    }

    //funGetCurrentDef
    let funGetCurrentDef = async() => {

        //vfps
        let vfps = fsTreeFolder(fdDwCurrent, 1)
        // console.log('vfps', vfps)

        //ltdtHashOld
        let ltdtHashOld = []
        each(vfps, (v) => {

            let j = fs.readFileSync(v.path, 'utf8')
            let eq = JSON.parse(j)

            ltdtHashOld.push(eq)

        })

        return ltdtHashOld
    }
    if (!isfun(funGetCurrent)) {
        funGetCurrent = funGetCurrentDef
    }

    //funRemoveDef
    let funRemoveDef = async(v) => {

        let fd = `${fdResult}/${v.id}`
        if (fsIsFolder(fd)) {
            fsDeleteFolder(fd)
        }

    }
    if (!isfun(funRemove)) {
        funRemove = funRemoveDef
    }

    //funAddDef
    let funAddDef = async(v) => {

        let fd = `${fdResult}/${v.id}`
        if (!fsIsFolder(fd)) {
            fsCreateFolder(fd)
        }
        fsCleanFolder(fd)

        let fpSrc = `${fdDwStorage}/${v.id}.json`
        let fpTar = `${fd}/${v.id}.json`
        fsCopyFile(fpSrc, fpTar)

    }
    if (!isfun(funAdd)) {
        funAdd = funAddDef
    }

    //funModifyDef
    let funModifyDef = async(v) => {

        //複製舊資料夾(含檔案)至fdResultTemp做暫時備份, fdResultTemp會於funAfterStart清空, 於funBeforeEnd刪除
        if (true) {

            let fdSrc = `${fdResult}/${v.id}`
            let fdTar = `${fdResultTemp}/${v.id}`
            fsCopyFolder(fdSrc, fdTar)

        }

        //複製新檔案至fdResult
        if (true) {

            let fd = `${fdResult}/${v.id}`
            if (!fsIsFolder(fd)) {
                fsCreateFolder(fd)
            }
            fsCleanFolder(fd)

            let fpSrc = `${fdDwStorage}/${v.id}.json`
            let fpTar = `${fd}/${v.id}.json`
            fsCopyFile(fpSrc, fpTar)

        }

    }
    if (!isfun(funModify)) {
        funModify = funModifyDef
    }

    let funAfterStart = async() => {

        fsCleanFolder(fdResultTemp)

    }

    let funBeforeEnd = async() => {

        fsCleanFolder(fdResultTemp)

    }

    let optBdr = {
        fdTagRemove,
        fdDwAttime,
        fdDwCurrent,
        fdResult,
        fdTaskCpActualSrc,
        fdTaskCpSrc,
        fdLog,
        funDownload,
        funGetCurrent,
        funRemove,
        funAdd,
        funModify,
        funAfterStart,
        funBeforeEnd,
        timeToleranceRemove,
    }
    let ev = await WDwdataBuilder(optBdr)

    return ev
}


export default WDwdataTweqod
