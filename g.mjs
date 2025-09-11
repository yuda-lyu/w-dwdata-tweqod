// import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import WDwdataTweqod from './src/WDwdataTweqod.mjs'


let j = fs.readFileSync('../_data/settings.json', 'utf8')
let st = JSON.parse(j)
let token = _.get(st, 'token')

//fdDwStorage
let fdDwStorage = `./_dwStorage`
w.fsCleanFolder(fdDwStorage)

//fdDwAttime
let fdDwAttime = `./_dwAttime`
w.fsCleanFolder(fdDwAttime)

//fdDwCurrent
let fdDwCurrent = `./_dwCurrent`
w.fsCleanFolder(fdDwCurrent)

//fdResultTemp
let fdResultTemp = `./_resultTemp`
w.fsCleanFolder(fdResultTemp)

//fdResult
let fdResult = `./_result`
w.fsCleanFolder(fdResult)

let opt = {
    keepAllData: false,
    fdDwStorage,
    fdDwAttime,
    fdDwCurrent,
    fdResultTemp,
    fdResult,
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
    console.log('change', msg)
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


//node g.mjs
