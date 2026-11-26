import fs from 'fs'
import path from 'path'
import { mock } from 'node:test'
import _ from 'lodash-es'
import w from 'wsemi'
import assert from 'assert'
import WDwdataTweqod from '../src/WDwdataTweqod.mjs'


//規格(wsemi列舉函數之第2參數為opt, 未給opt.levelLimit即窮舉全部層級):
//本套件2處列舉皆僅限第1層(opt.levelLimit為1), 其子資料夾內之檔案不列入:
//1. 預設funGetCurrent(src/WDwdataTweqod.mjs之funGetCurrentDef)列舉fdDwCurrent
//2. 預設funDownload(funDownloadDef)內之treeFilesAndGetHashs列舉fdDwAttime(其為fdDwCurrent之複本)
//
//這2處之消費端皆逐項以fs.readFileSync讀取並JSON.parse, 未濾除資料夾項目; 資料夾項目於真實檔案系統無法被讀取(EISDIR),
//故第1層有子資料夾時, 不論列舉層數為何皆於讀取該資料夾項目時失敗, 黑箱(只看結果)無法分辨列舉層數;
//本測試以fs.readFileSync之替身觀察列舉所交出之項目: 替身僅攔截fdDwCurrent與fdDwAttime之下之路徑並記錄, 對資料夾回傳固定JSON使讀取不中斷, 其餘一律委託原函數
describe('levelLimit', function() {

    it('WDwdataTweqod: 預設funGetCurrent與funDownload皆只列第1層之項目, 其子資料夾內之檔案不被列入(fsTreeFolder之opt.levelLimit為1)', async () => {

        let tag = '_levelLimit'

        //token, 因有提供funDownloadEqs故不會實際下載, 給予任意字串即可
        let token = 'test-token'

        //fdTagRemove
        let fdTagRemove = `./${tag}_tagRemove`
        w.fsCleanFolder(fdTagRemove)

        //fdDwStorage
        let fdDwStorage = `./${tag}_dwStorage`
        w.fsCleanFolder(fdDwStorage)

        //fdDwAttime
        let fdDwAttime = `./${tag}_dwAttime`
        w.fsCleanFolder(fdDwAttime)

        //fdDwCurrent, 預置前次hash數據: 第1層之檔案114115.json, 與子資料夾stray及其內之第2層檔案ghost.json
        let fdDwCurrent = `./${tag}_dwCurrent`
        w.fsCleanFolder(fdDwCurrent)
        fs.writeFileSync(`${fdDwCurrent}/114115.json`, JSON.stringify({ id: '114115', hash: 'hash-114115' }), 'utf8')
        w.fsCreateFolder(`${fdDwCurrent}/stray`)
        fs.writeFileSync(`${fdDwCurrent}/stray/ghost.json`, JSON.stringify({ id: 'ghost', hash: 'hash-ghost' }), 'utf8')

        //fdResultTemp
        let fdResultTemp = `./${tag}_resultTemp`
        w.fsCleanFolder(fdResultTemp)

        //fdResult
        let fdResult = `./${tag}_result`
        w.fsCleanFolder(fdResult)

        //fdTaskCpActualSrc
        let fdTaskCpActualSrc = `./${tag}_taskCpActualSrc`
        w.fsCleanFolder(fdTaskCpActualSrc)

        //fdTaskCpSrc
        let fdTaskCpSrc = `./${tag}_taskCpSrc`
        w.fsCleanFolder(fdTaskCpSrc)

        //funDownloadEqs, 下載數據為114115
        let funDownloadEqs = async() => {
            return [
                {
                    'id': '114115',
                    'tag': '',
                    'number': '115',
                    'time': '2025-08-21T16:37:47+08:00',
                    'timeRec': '2025-08-21 16:37:47',
                    'timeTag': '20250821163747',
                    'ml': '5.1',
                    'depth': '10.4',
                    'description': '08/21-16:37嘉義縣大埔鄉發生規模5.1有感地震，最大震度嘉義縣大埔、臺南市曾文、高雄市甲仙、嘉義縣太保市4級。',
                    'location': '嘉義縣政府東南方  36.3  公里 (位於嘉義縣大埔鄉)',
                    'intensity': '',
                    'longitude': '120.58',
                    'latitude': '23.26'
                },
            ]
        }

        //funRemove, funAdd, funModify, 覆寫為不處理
        let funRemove = async() => {}
        let funAdd = async() => {}
        let funModify = async() => {}

        //readFileSync之替身, 記錄fdDwCurrent與fdDwAttime之下被讀取之相對路徑
        let kpFd = {
            current: path.resolve(fdDwCurrent),
            attime: path.resolve(fdDwAttime),
        }
        let readOri = fs.readFileSync
        let reads = { current: [], attime: [] }
        let m = mock.method(fs, 'readFileSync', function(p, ...args) {
            if (typeof p === 'string') {
                let pAbs = path.resolve(p)
                for (let key of ['current', 'attime']) {
                    let rel = path.relative(kpFd[key], pAbs)
                    if (rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)) {
                        reads[key].push(rel.replace(/\\/g, '/'))
                        if (fs.statSync(p).isDirectory()) {
                            return JSON.stringify({ id: 'stub-folder', hash: 'stub' }) //資料夾項目於真實檔案系統不可讀, 回傳固定JSON使讀取不中斷
                        }
                    }
                }
            }
            return readOri.call(this, p, ...args)
        })

        let msChange = []
        try {
            let pm = w.genPm()
            let ev = await WDwdataTweqod(token, {
                fdTagRemove,
                fdDwStorage,
                fdDwAttime,
                fdDwCurrent,
                fdResultTemp,
                fdResult,
                fdTaskCpActualSrc,
                fdTaskCpSrc,
                useShowLog: false,
                funDownloadEqs,
                funRemove,
                funAdd,
                funModify,
            })
            ev.on('change', (msg) => {
                msChange.push({ ...msg })
            })
            ev.on('end', () => {
                pm.resolve()
            })
            await pm
        }
        finally {
            m.mock.restore()
            w.fsDeleteFolder(fdTagRemove)
            w.fsDeleteFolder(fdDwStorage)
            w.fsDeleteFolder(fdDwAttime)
            w.fsDeleteFolder(fdDwCurrent)
            w.fsDeleteFolder(fdResultTemp)
            w.fsDeleteFolder(fdResult)
            w.fsDeleteFolder(fdTaskCpActualSrc)
            w.fsDeleteFolder(fdTaskCpSrc)
        }

        //numGetCurrent, funGetCurrent交出之項目數
        let numGetCurrent = _.get(_.find(msChange, (v) => v.event === 'proc-callfun-getCurrent' && v.msg === 'done'), 'num')

        //spec: 只列第1層(檔案114115.json與資料夾stray), 第2層之stray/ghost.json不得被列入
        assert.strict.deepEqual({
            current: _.uniq(reads.current).sort(),
            attime: _.uniq(reads.attime).sort(),
            numGetCurrent,
        }, {
            current: ['114115.json', 'stray'],
            attime: ['114115.json', 'stray'],
            numGetCurrent: 2,
        })
    })

})
