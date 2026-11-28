import fs from 'fs'
import crypto from 'crypto'
import _ from 'lodash-es'
import w from 'wsemi'
import assert from 'assert'
import WDwdataTweqod from '../src/WDwdataTweqod.mjs'


//預設funDownload與funGetCurrent之下, 單項funAdd或funModify失敗時: 成功項之hash進fdDwCurrent, 失敗項維持前次內容, 下輪僅重試失敗項
//規則見sgud/rule/rulebook.md之R-ERR-02
describe('retry', function() {

    let idA = '114101'
    let idB = '114102'

    //getEq, 合成地震數據, 各筆各欄之值相異
    let getEq = (id, depth) => {
        return { id, number: id.slice(3), ml: `5.${id.slice(5)}`, depth }
    }

    //getHash, 預設funDownload以完整數據JSON之md5作為hash
    let getHash = (eq) => {
        return crypto.createHash('md5').update(JSON.stringify(eq)).digest('hex')
    }

    //getRec, fdDwCurrent內預期之數據檔內容
    let getRec = (eq) => {
        return { id: eq.id, hash: getHash(eq) }
    }

    //getFolders, 各測試使用獨立資料夾
    let getFolders = (tag) => {
        let r = {}
        _.each(['fdTagRemove', 'fdDwStorage', 'fdDwAttime', 'fdDwCurrent', 'fdResultTemp', 'fdResult', 'fdTaskCpActualSrc', 'fdTaskCpSrc'], (k) => {
            r[k] = `./_retry_${tag}_${k}`
        })
        return r
    }

    //readCurrent, 讀取fdDwCurrent內各數據檔
    let readCurrent = (fd) => {
        let r = {}
        _.each(fs.readdirSync(fd).sort(), (fn) => {
            r[fn] = JSON.parse(fs.readFileSync(`${fd}/${fn}`, 'utf8'))
        })
        return r
    }

    //run, 執行一輪偵測, 回傳funAdd與funModify被呼叫之項、比對數量、本輪結果之成功與失敗項、結束後之fdDwCurrent內容
    let run = async(fds, eqs, idFail = '') => {
        let pm = w.genPm()

        let calls = []
        let compare = null

        let funCall = (mode) => {
            return async(v) => {
                calls.push(`${mode}:${v.id}`)
                if (v.id === idFail) {
                    throw new Error('mock error')
                }
            }
        }

        let ev = await WDwdataTweqod('test-token', {
            ...fds,
            useShowLog: false,
            funDownloadEqs: async() => {
                return [...eqs]
            },
            funAdd: funCall('add'),
            funModify: funCall('modify'),
        })
        ev.on('change', (msg) => {
            if (msg.event === 'proc-compare' && msg.msg === 'done') {
                compare = _.pick(msg, ['numRemove', 'numAdd', 'numModify', 'numSame'])
            }
        })
        ev.on('end', (res) => {
            pm.resolve({
                calls: calls.sort(),
                compare,
                success: res.success,
                failed: res.failed,
                current: readCurrent(fds.fdDwCurrent),
            })
        })

        return pm
    }

    let fdsAll = []

    let initFolders = (tag) => {
        let fds = getFolders(tag)
        _.each(fds, (fd) => {
            w.fsCleanFolder(fd)
        })
        fdsAll.push(fds)
        return fds
    }

    after(function() {
        _.each(fdsAll, (fds) => {
            _.each(fds, (fd) => {
                w.fsDeleteFolder(fd)
            })
        })
    })

    it('test retry: funAdd單項失敗時, 僅成功項進fdDwCurrent, 下輪僅重試失敗項', async () => {
        let fds = initFolders('add')
        let a = getEq(idA, '10.1')
        let b = getEq(idB, '10.2')

        //第1輪: idB之funAdd失敗
        let r1 = await run(fds, [a, b], idB)
        assert.strict.deepEqual(r1, {
            calls: [`add:${idA}`, `add:${idB}`],
            compare: { numRemove: 0, numAdd: 2, numModify: 0, numSame: 0 },
            success: { add: [idA], modify: [], remove: [] },
            failed: [{ id: idB, mode: 'add', event: 'proc-add-callfun-add', msg: 'funAdd failed' }],
            current: { [`${idA}.json`]: getRec(a) },
        })

        //第2輪: 同一數據, 僅idB仍為新增
        let r2 = await run(fds, [a, b])
        assert.strict.deepEqual(r2, {
            calls: [`add:${idB}`],
            compare: { numRemove: 0, numAdd: 1, numModify: 0, numSame: 1 },
            success: { add: [idB], modify: [], remove: [] },
            failed: [],
            current: { [`${idA}.json`]: getRec(a), [`${idB}.json`]: getRec(b) },
        })

    })

    it('test retry: funModify單項失敗時, 該項於fdDwCurrent維持前次內容, 下輪僅重試失敗項', async () => {
        let fds = initFolders('modify')
        let a = getEq(idA, '10.1')
        let b = getEq(idB, '10.2')
        await run(fds, [a, b])

        //第1輪: 兩項皆變更, idA之funModify失敗
        let a2 = getEq(idA, '20.1')
        let b2 = getEq(idB, '20.2')
        let r1 = await run(fds, [a2, b2], idA)
        assert.strict.deepEqual(r1, {
            calls: [`modify:${idA}`, `modify:${idB}`],
            compare: { numRemove: 0, numAdd: 0, numModify: 2, numSame: 0 },
            success: { add: [], modify: [idB], remove: [] },
            failed: [{ id: idA, mode: 'modify', event: 'proc-diff-callfun-modify', msg: 'funModify failed' }],
            current: { [`${idA}.json`]: getRec(a), [`${idB}.json`]: getRec(b2) },
        })

        //第2輪: 同一數據, 僅idA仍為變更
        let r2 = await run(fds, [a2, b2])
        assert.strict.deepEqual(r2, {
            calls: [`modify:${idA}`],
            compare: { numRemove: 0, numAdd: 0, numModify: 1, numSame: 1 },
            success: { add: [], modify: [idA], remove: [] },
            failed: [],
            current: { [`${idA}.json`]: getRec(a2), [`${idB}.json`]: getRec(b2) },
        })

    })

})
