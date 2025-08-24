import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import downloadEqs from './src/downloadEqs.mjs'


let j = fs.readFileSync('../_data/settings.json', 'utf8')
let st = JSON.parse(j)
let token = _.get(st, 'token')

let fd = `./_dwAttime`
if (!w.fsIsFolder(fd)) {
    w.fsCreateFolder(fd)
}

let eqs = await downloadEqs(token, fd)
console.log('eqs', eqs)


//node g.downloadEqs.mjs
