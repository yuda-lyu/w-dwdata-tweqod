import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import assert from 'assert'
import WDwdataTweqod from '../src/WDwdataTweqod.mjs'


describe('multi', function() {

    let test = async() => {
        let ms = []

        let eqs1 = [
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
        let eqs2 = [ //add 114116
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
            {
                'id': '114116',
                'tag': '',
                'number': '116',
                'time': '2025-08-22T14:06:15+08:00',
                'timeRec': '2025-08-22 14:06:15',
                'timeTag': '20250822140615',
                'ml': '5.4',
                'depth': '14.1',
                'description': '08/22-14:06臺南市南化區發生規模5.4有感地震，最大震度臺南市楠西、高雄市甲仙、嘉義縣大埔、雲林縣西螺、彰化縣二林4級。',
                'location': '臺南市政府東北東方  42.0  公里 (位於臺南市南化區)',
                'intensity': '',
                'longitude': '120.55',
                'latitude': '23.16'
            },
        ]
        let eqs3 = [ //modify 114116
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
            {
                'id': '114116',
                'tag': '',
                'number': '116',
                'time': '2025-08-22T14:06:15+08:00',
                'timeRec': '2025-08-22 14:06:15',
                'timeTag': '20250822140615',
                'ml': '5.4',
                'depth': '15.1', //modify 14.1 -> 15.1
                'description': '08/22-14:06臺南市南化區發生規模5.4有感地震，最大震度臺南市楠西、高雄市甲仙、嘉義縣大埔、雲林縣西螺、彰化縣二林4級。',
                'location': '臺南市政府東北東方  42.0  公里 (位於臺南市南化區)',
                'intensity': '',
                'longitude': '120.55',
                'latitude': '23.16'
            },
        ]
        let kpEqs = {
            1: eqs1,
            2: eqs2,
            3: eqs3,
        }

        //fdTagRemove
        let fdTagRemove = `./_multi_tagRemove`
        w.fsCleanFolder(fdTagRemove)

        //fdDwStorage
        let fdDwStorage = `./_multi_dwStorage`
        w.fsCleanFolder(fdDwStorage)

        //fdDwAttime
        let fdDwAttime = `./_multi_dwAttime`
        w.fsCleanFolder(fdDwAttime)

        //fdDwCurrent
        let fdDwCurrent = `./_multi_dwCurrent`
        w.fsCleanFolder(fdDwCurrent)

        //fdResultTemp
        let fdResultTemp = `./_multi_resultTemp`
        w.fsCleanFolder(fdResultTemp)

        //fdResult
        let fdResult = `./_multi_result`
        w.fsCleanFolder(fdResult)

        //fdTaskCpActualSrc
        let fdTaskCpActualSrc = `./_multi_taskCpActualSrc`
        w.fsCleanFolder(fdTaskCpActualSrc)

        //fdTaskCpSrc
        let fdTaskCpSrc = `./_multi_taskCpSrc`
        w.fsCleanFolder(fdTaskCpSrc)

        let i = 0
        let run = async() => {
            i++

            let pm = w.genPm()

            let j = fs.readFileSync('../_data/settings.json', 'utf8')
            let st = JSON.parse(j)
            let token = _.get(st, 'token')

            //funDownloadEqs
            let funDownloadEqs = async() => {
                let eqs = kpEqs[i]
                return eqs
            }

            let opt = {
                fdTagRemove,
                fdDwStorage,
                fdDwAttime,
                fdDwCurrent,
                fdResultTemp,
                fdResult,
                fdTaskCpActualSrc,
                fdTaskCpSrc,
                // fdLog,
                funDownloadEqs,
                // funDownload,
                // funGetCurrent,
                // funRemove,
                // funAdd,
                // funModify,
            }
            let ev = await WDwdataTweqod(token, opt)
                .catch((err) => {
                    console.log(err)
                })
            ev.on('change', (msg) => {
                delete msg.type
                delete msg.timeRunStart
                delete msg.timeRunEnd
                delete msg.timeRunSpent
                if (w.arrHas(msg.event, [
                    'start',
                    'proc-callfun-download',
                    'proc-callfun-getCurrent',
                    'proc-callfun-afterStart',
                    'proc-callfun-beforeEnd',
                ])) {
                    return
                }
                // console.log('change', msg)
                ms.push(msg)
            })
            ev.on('end', () => {
                pm.resolve()
            })

            return pm
        }

        await w.pmSeries(kpEqs, async() => {
            await run()
        })

        w.fsDeleteFolder(fdTagRemove)
        w.fsDeleteFolder(fdDwStorage)
        w.fsDeleteFolder(fdDwAttime)
        w.fsDeleteFolder(fdDwCurrent)
        w.fsDeleteFolder(fdResultTemp)
        w.fsDeleteFolder(fdResult)
        w.fsDeleteFolder(fdTaskCpActualSrc)
        w.fsDeleteFolder(fdTaskCpSrc)

        // console.log('ms', ms)
        return ms
    }
    let ms = [
        { event: 'compare', msg: 'start...' },
        {
            event: 'compare',
            numRemove: 0,
            numAdd: 1,
            numModify: 0,
            numSame: 0,
            msg: 'done'
        },
        { event: 'proc-add-callfun-add', id: '114115', msg: 'start...' },
        { event: 'proc-add-callfun-add', id: '114115', msg: 'done' },
        { event: 'end', msg: 'done' },
        { event: 'compare', msg: 'start...' },
        {
            event: 'compare',
            numRemove: 0,
            numAdd: 1,
            numModify: 0,
            numSame: 1,
            msg: 'done'
        },
        { event: 'proc-add-callfun-add', id: '114116', msg: 'start...' },
        { event: 'proc-add-callfun-add', id: '114116', msg: 'done' },
        { event: 'end', msg: 'done' },
        { event: 'compare', msg: 'start...' },
        {
            event: 'compare',
            numRemove: 0,
            numAdd: 0,
            numModify: 1,
            numSame: 1,
            msg: 'done'
        },
        { event: 'proc-diff-callfun-modify', id: '114116', msg: 'start...' },
        { event: 'proc-diff-callfun-modify', id: '114116', msg: 'done' },
        { event: 'end', msg: 'done' }
    ]

    it('test multi', async () => {
        let r = await test()
        let rr = ms
        assert.strict.deepEqual(r, rr)
    })

})
