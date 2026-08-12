// import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import downloadEqs from './src/downloadEqs.mjs'


let j = fs.readFileSync('../_data/settings.json', 'utf8')
let st = JSON.parse(j)
let token = _.get(st, 'token')

let opt = {
    keepAllData: false,
}
let eqs = await downloadEqs(token, opt)
console.log('eqs', eqs)


//node g.downloadEqs.mjs
