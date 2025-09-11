import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import assert from 'assert'
import WDwdataTweqod from '../src/WDwdataTweqod.mjs'


describe('once', function() {

    let test = async() => {

        let pm = w.genPm()

        let ms = []

        let j = fs.readFileSync('../_data/settings.json', 'utf8')
        let st = JSON.parse(j)
        let token = _.get(st, 'token')

        //fdDwStorage
        let fdDwStorage = `./_once_dwStorage`
        w.fsCleanFolder(fdDwStorage)

        //fdDwAttime
        let fdDwAttime = `./_once_dwAttime`
        w.fsCleanFolder(fdDwAttime)

        //fdDwCurrent
        let fdDwCurrent = `./_once_dwCurrent`
        w.fsCleanFolder(fdDwCurrent)

        //fdResultTemp
        let fdResultTemp = './_once_resultTemp'
        w.fsCleanFolder(fdResultTemp)

        //fdResult
        let fdResult = './_once_result'
        w.fsCleanFolder(fdResult)

        //funDownloadEqs
        let funDownloadEqs = async() => {
            let eqs = [
                {
                    'id': '114116',
                    'tag': '',
                    'number': '116',
                    'time': '2025-08-22T14:06:15+08:00',
                    'timeRec': '2025-08-22 14:06:15',
                    'timeTag': '20250822140615',
                    'ml': '5.4',
                    'depth': '15.1',
                    'description': '08/22-14:06臺南市南化區發生規模5.4有感地震，最大震度臺南市楠西、高雄市甲仙、嘉義縣大埔、雲林縣西螺、彰化縣二林4級。',
                    'location': '臺南市政府東北東方  42.0  公里 (位於臺南市南化區)',
                    'intensity': '',
                    'longitude': '120.55',
                    'latitude': '23.16'
                },
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
                }
            ]
            return eqs
        }

        let opt = {
            fdDwStorage,
            fdDwAttime,
            fdDwCurrent,
            fdResultTemp,
            fdResult,
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
            // console.log('change', msg)
            ms.push(msg)
        })
        ev.on('end', () => {
            w.fsDeleteFolder(fdDwStorage)
            w.fsDeleteFolder(fdDwAttime)
            w.fsDeleteFolder(fdDwCurrent)
            w.fsDeleteFolder(fdResultTemp)
            w.fsDeleteFolder(fdResult)
            // console.log('ms', ms)
            pm.resolve(ms)
        })
        // change { event: 'start', msg: 'running...' }
        // change { event: 'proc-callfun-afterStart', msg: 'start...' }
        // change { event: 'proc-callfun-afterStart', msg: 'done' }
        // change { event: 'proc-callfun-download', msg: 'start...' }
        // change { event: 'proc-callfun-download', num: 2, msg: 'done' }
        // change { event: 'proc-callfun-getCurrent', msg: 'start...' }
        // change { event: 'proc-callfun-getCurrent', num: 0, msg: 'done' }
        // change { event: 'compare', msg: 'start...' }
        // change { event: 'compare', numRemove: 0, numAdd: 2, numModify: 0, numSame: 0, msg: 'done' }
        // change { event: 'proc-add-callfun-add', id: '114101', msg: 'start...' }
        // change { event: 'proc-add-callfun-add', id: '114101', msg: 'done' }
        // change { event: 'proc-add-callfun-add', id: '114102', msg: 'start...' }
        // change { event: 'proc-add-callfun-add', id: '114102', msg: 'done' }
        // ...

        return pm
    }
    let ms = [
        { event: 'start', msg: 'running...' },
        { event: 'proc-callfun-afterStart', msg: 'start...' },
        { event: 'proc-callfun-afterStart', msg: 'done' },
        { event: 'proc-callfun-download', msg: 'start...' },
        { event: 'proc-callfun-download', num: 2, msg: 'done' },
        { event: 'proc-callfun-getCurrent', msg: 'start...' },
        { event: 'proc-callfun-getCurrent', num: 0, msg: 'done' },
        { event: 'compare', msg: 'start...' },
        { event: 'compare', numRemove: 0, numAdd: 2, numModify: 0, numSame: 0, msg: 'done' },
        { event: 'proc-add-callfun-add', id: '114115', msg: 'start...' },
        { event: 'proc-add-callfun-add', id: '114115', msg: 'done' },
        { event: 'proc-add-callfun-add', id: '114116', msg: 'start...' },
        { event: 'proc-add-callfun-add', id: '114116', msg: 'done' },
        { event: 'proc-callfun-beforeEnd', msg: 'start...' },
        { event: 'proc-callfun-beforeEnd', msg: 'done' },
        { event: 'end', msg: 'done' }
    ]

    it('test once', async () => {
        let r = await test()
        let rr = ms
        assert.strict.deepEqual(r, rr)
    })

})
