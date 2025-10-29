# w-dwdata-tweqod
A downloader for earthquake data from Taiwan CWA OpenData.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-dwdata-tweqod.svg?style=flat)](https://npmjs.org/package/w-dwdata-tweqod) 
[![license](https://img.shields.io/npm/l/w-dwdata-tweqod.svg?style=flat)](https://npmjs.org/package/w-dwdata-tweqod) 
[![npm download](https://img.shields.io/npm/dt/w-dwdata-tweqod.svg)](https://npmjs.org/package/w-dwdata-tweqod) 
[![npm download](https://img.shields.io/npm/dm/w-dwdata-tweqod.svg)](https://npmjs.org/package/w-dwdata-tweqod) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-dwdata-tweqod.svg)](https://www.jsdelivr.com/package/npm/w-dwdata-tweqod)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-dwdata-tweqod/global.html).

## Installation

### Using npm(ES6 module):
```alias
npm i w-dwdata-tweqod
```

#### Example:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-dwdata-tweqod/blob/master/g.mjs)]
```alias
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import WDwdataTweqod from './src/WDwdataTweqod.mjs'

let j = fs.readFileSync('../_data/settings.json', 'utf8')
let st = JSON.parse(j)
let token = _.get(st, 'token')

//fdTagRemove
let fdTagRemove = `./_tagRemove`
w.fsCleanFolder(fdTagRemove)

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

//fdTaskCpActualSrc
let fdTaskCpActualSrc = `./_taskCpActualSrc`
w.fsCleanFolder(fdTaskCpActualSrc)

//fdTaskCpSrc
let fdTaskCpSrc = `./_taskCpSrc`
w.fsCleanFolder(fdTaskCpSrc)

let opt = {
    keepAllData: false,
    fdTagRemove,
    fdDwStorage,
    fdDwAttime,
    fdDwCurrent,
    fdResultTemp,
    fdResult,
    fdTaskCpActualSrc,
    fdTaskCpSrc,
    // fdLog,
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
// change { event: 'proc-compare', msg: 'start...' }
// change { event: 'proc-compare', numRemove: 0, numAdd: 2, numModify: 0, numSame: 0, msg: 'done' }
// change { event: 'proc-add-callfun-add', id: '114101', msg: 'start...' }
// change { event: 'proc-add-callfun-add', id: '114101', msg: 'done' }
// change { event: 'proc-add-callfun-add', id: '114102', msg: 'start...' }
// change { event: 'proc-add-callfun-add', id: '114102', msg: 'done' }
// ...
```
