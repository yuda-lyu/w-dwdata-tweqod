import _ from 'lodash-es'
import w from 'wsemi'
import assert from 'assert'
import WDwdataTweqod from '../src/WDwdataTweqod.mjs'


describe('srLog', function() {

    //msgErrFunAdd, funAdd拋出之錯誤訊息
    let msgErrFunAdd = 'mock error from funAdd'

    //eqs, 下載地震數據, 因fdDwCurrent為空, 故差異為新增1筆id[114115]
    let eqs = [
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

    //rmTime, 移除紀錄內之執行時間欄位
    let rmTime = (v) => {
        let r = { ...v }
        delete r.timeRunStart
        delete r.timeRunEnd
        delete r.timeRunSpent
        return r
    }

    //test, 執行一次偵測並蒐集srLog各函數與change事件所收到之紀錄
    let test = async(opt = {}) => {

        //useSrLog, 是否提供srLog
        let useSrLog = _.get(opt, 'useSrLog', true)

        //errFunAdd, funAdd是否拋錯
        let errFunAdd = _.get(opt, 'errFunAdd', false)

        //useShowLog, 未給予時不傳入optTQ, 用以驗證預設值
        let useShowLog = _.get(opt, 'useShowLog', null)

        //tag, 各測試使用獨立資料夾
        let tag = _.get(opt, 'tag', 'c0')

        let pm = w.genPm()

        //msChange, msInfo, msWarn, msError
        let msChange = []
        let msInfo = []
        let msWarn = []
        let msError = []

        //nArgs, 各次呼叫srLog函數所接收之參數數量
        let nArgs = []

        //msConsole, 攔截console.log之輸出
        let msConsole = []
        let consoleLogOri = console.log
        console.log = (...args) => {
            msConsole.push(args)
        }

        //token, 因有提供funDownloadEqs故不會實際下載, 給予任意字串即可
        let token = 'test-token'

        //fdTagRemove
        let fdTagRemove = `./_srLog_${tag}_tagRemove`
        w.fsCleanFolder(fdTagRemove)

        //fdDwStorage
        let fdDwStorage = `./_srLog_${tag}_dwStorage`
        w.fsCleanFolder(fdDwStorage)

        //fdDwAttime
        let fdDwAttime = `./_srLog_${tag}_dwAttime`
        w.fsCleanFolder(fdDwAttime)

        //fdDwCurrent
        let fdDwCurrent = `./_srLog_${tag}_dwCurrent`
        w.fsCleanFolder(fdDwCurrent)

        //fdResultTemp
        let fdResultTemp = `./_srLog_${tag}_resultTemp`
        w.fsCleanFolder(fdResultTemp)

        //fdResult
        let fdResult = `./_srLog_${tag}_result`
        w.fsCleanFolder(fdResult)

        //fdTaskCpActualSrc
        let fdTaskCpActualSrc = `./_srLog_${tag}_taskCpActualSrc`
        w.fsCleanFolder(fdTaskCpActualSrc)

        //fdTaskCpSrc
        let fdTaskCpSrc = `./_srLog_${tag}_taskCpSrc`
        w.fsCleanFolder(fdTaskCpSrc)

        //funDownloadEqs
        let funDownloadEqs = async() => {
            return eqs
        }

        //funAdd
        let funAdd = async() => {
            if (errFunAdd) {
                throw new Error(msgErrFunAdd)
            }
        }

        //srLog
        let srLogAll = {
            info: (...args) => {
                nArgs.push(_.size(args))
                msInfo.push({ ...args[0] })
            },
            warn: (...args) => {
                nArgs.push(_.size(args))
                msWarn.push({ ...args[0] })
            },
            error: (...args) => {
                nArgs.push(_.size(args))
                msError.push({ ...args[0] })
            },
        }
        let srLog = null
        if (useSrLog) {
            srLog = srLogAll
        }

        let optTQ = {
            fdTagRemove,
            fdDwStorage,
            fdDwAttime,
            fdDwCurrent,
            fdResultTemp,
            fdResult,
            fdTaskCpActualSrc,
            fdTaskCpSrc,
            srLog,
            funDownloadEqs,
            funAdd,
        }
        if (_.isBoolean(useShowLog)) {
            optTQ.useShowLog = useShowLog
        }
        let ev = await WDwdataTweqod(token, optTQ)
            .catch((err) => {
                console.log(err)
            })
        ev.on('change', (msg) => {
            msChange.push({ ...msg })
        })
        ev.on('end', () => {

            w.fsDeleteFolder(fdTagRemove)
            w.fsDeleteFolder(fdDwStorage)
            w.fsDeleteFolder(fdDwAttime)
            w.fsDeleteFolder(fdDwCurrent)
            w.fsDeleteFolder(fdResultTemp)
            w.fsDeleteFolder(fdResult)
            w.fsDeleteFolder(fdTaskCpActualSrc)
            w.fsDeleteFolder(fdTaskCpSrc)

            console.log = consoleLogOri

            pm.resolve({ msChange, msInfo, msWarn, msError, nArgs, msConsole })
        })

        return pm
    }

    //msChangeNormal, 無錯誤時各階段所發送之紀錄
    let msChangeNormal = [
        { type: 'info', event: 'start', msg: 'running...' },
        { type: 'info', event: 'proc-callfun-afterStart', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-afterStart', msg: 'done' },
        { type: 'info', event: 'proc-callfun-download', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-download', num: 1, msg: 'done' },
        { type: 'info', event: 'proc-callfun-getCurrent', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-getCurrent', num: 0, msg: 'done' },
        { type: 'info', event: 'proc-compare', msg: 'start...' },
        {
            type: 'info',
            event: 'proc-compare',
            numRemove: 0,
            numAdd: 1,
            numModify: 0,
            numSame: 0,
            msg: 'done'
        },
        { type: 'info', event: 'proc-add-callfun-add', id: '114115', msg: 'start...' },
        { type: 'info', event: 'proc-add-callfun-add', id: '114115', msg: 'done' },
        { type: 'info', event: 'proc-callfun-beforeEnd', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-beforeEnd', msg: 'done' },
        { type: 'info', event: 'end', msg: 'done' },
    ]

    //msChangeError, funAdd拋錯時各階段所發送之紀錄, 因beforeEnd階段不論有無錯誤皆執行, 故仍有proc-callfun-beforeEnd
    let msChangeError = [
        { type: 'info', event: 'start', msg: 'running...' },
        { type: 'info', event: 'proc-callfun-afterStart', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-afterStart', msg: 'done' },
        { type: 'info', event: 'proc-callfun-download', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-download', num: 1, msg: 'done' },
        { type: 'info', event: 'proc-callfun-getCurrent', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-getCurrent', num: 0, msg: 'done' },
        { type: 'info', event: 'proc-compare', msg: 'start...' },
        {
            type: 'info',
            event: 'proc-compare',
            numRemove: 0,
            numAdd: 1,
            numModify: 0,
            numSame: 0,
            msg: 'done'
        },
        { type: 'info', event: 'proc-add-callfun-add', id: '114115', msg: 'start...' },
        { type: 'error', event: 'proc-add-callfun-add', id: '114115', msg: msgErrFunAdd },
        { type: 'info', event: 'cancel-stage-main', msg: 'error at proc-add-callfun-add' },
        { type: 'info', event: 'proc-callfun-beforeEnd', msg: 'start...' },
        { type: 'info', event: 'proc-callfun-beforeEnd', msg: 'done' },
        { type: 'info', event: 'cancel-stage-beforeEnd', msg: 'error at proc-add-callfun-add' },
        { type: 'info', event: 'end', msg: 'done' },
    ]

    //pickByType, 自change紀錄取出指定type者, 並還原成srLog所接收之紀錄(不含type)
    let pickByType = (ms, type) => {
        return ms
            .filter((v) => {
                return v.type === type
            })
            .map((v) => {
                let r = { ...v }
                delete r.type
                return r
            })
    }

    it('test srLog: 提供srLog時, 各階段事件紀錄於srLog.info', async () => {
        let r = await test({ tag: 'c1' })
        let rr = pickByType(msChangeNormal, 'info')
        assert.strict.deepEqual(r.msInfo.map(rmTime), rr)
    })

    it('test srLog: 提供srLog時, srLog各函數僅接收一紀錄物件', async () => {
        let r = await test({ tag: 'c2' })
        let rr = _.uniq(r.nArgs)
        assert.strict.deepEqual(rr, [1])
    })

    it('test srLog: 提供srLog時, srLog紀錄與change事件內容一致且type為info', async () => {
        let r = await test({ tag: 'c3' })
        let rr = r.msInfo.map((v) => {
            return { type: 'info', ...v }
        })
        assert.strict.deepEqual(r.msChange, rr)
    })

    it('test srLog: 無錯誤時不呼叫srLog.warn與srLog.error', async () => {
        let r = await test({ tag: 'c4' })
        let rr = { numWarn: 0, numError: 0 }
        assert.strict.deepEqual({ numWarn: _.size(r.msWarn), numError: _.size(r.msError) }, rr)
    })

    it('test srLog: funAdd拋錯時, 錯誤紀錄於srLog.error且change事件type為error', async () => {
        let r = await test({ tag: 'c5', errFunAdd: true })
        let rr = pickByType(msChangeError, 'error')
        assert.strict.deepEqual(r.msError, rr)
        assert.strict.deepEqual(pickByType(r.msChange, 'error'), rr)
    })

    it('test srLog: 未提供srLog時, change事件仍完整發送', async () => {
        let r = await test({ tag: 'c6', errFunAdd: true, useSrLog: false })
        let rr = msChangeError
        assert.strict.deepEqual(r.msChange.map(rmTime), rr)
    })

    //cntConsole, 統計console.log所收到之輸出類別
    let cntConsole = (ms) => {
        let numErr = _.size(ms.filter((v) => {
            return _.get(v, [0]) instanceof Error
        }))
        let numCancel = _.size(ms.filter((v) => {
            return _.get(v, [0]) === 'error occurred, task canceled'
        }))
        return { numErr, numCancel, numAll: _.size(ms) }
    }

    it('test srLog: useShowLog預設為true時, 錯誤與取消訊息輸出至console', async () => {
        let r = await test({ tag: 'c7', errFunAdd: true })
        let rr = { numErr: 1, numCancel: 2, numAll: 3 } //funAdd之catch輸出1次錯誤, 主階段與結束前階段各輸出1次取消訊息
        assert.strict.deepEqual(cntConsole(r.msConsole), rr)
    })

    it('test srLog: useShowLog為false時, 不輸出至console且srLog紀錄不受影響', async () => {
        let r = await test({ tag: 'c8', errFunAdd: true, useShowLog: false })
        let rr = { numErr: 0, numCancel: 0, numAll: 0 }
        assert.strict.deepEqual(cntConsole(r.msConsole), rr)
        assert.strict.deepEqual(r.msInfo.map(rmTime), pickByType(msChangeError, 'info'))
        assert.strict.deepEqual(r.msError, pickByType(msChangeError, 'error'))
    })

})
