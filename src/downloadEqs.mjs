import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isbol from 'wsemi/src/isbol.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import strdelleft from 'wsemi/src/strdelleft.mjs'
import ot from 'dayjs'
import axios from 'axios'


let downloadEqs = async(token, opt = {}) => {
    let errTemp = null

    // 氣象開放資料平台(使用氣象署帳密)
    // https://opendata.cwa.gov.tw/index

    // 中央氣象署開放資料平臺之資料擷取API
    // https://opendata.cwa.gov.tw/dist/opendata-swagger.html#/%E5%9C%B0%E9%9C%87%E6%B5%B7%E5%98%AF/get_v1_rest_pga_datastore_E_A0015_001

    // 顯著有感地震報告資料-顯著有感地震報告API(GET):
    // https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001?Authorization={token}

    // 小區域有感地震報告資料-小區域有感地震報告API(GET):
    // https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0016-001?Authorization={token}

    //keepAllData
    let keepAllData = get(opt, 'keepAllData')
    if (!isbol(keepAllData)) {
        keepAllData = true
    }

    //get, 顯著有感地震
    let rEqsL = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001?Authorization=${token}`)
        .catch((err) => {
            errTemp = err
        })
    // console.log('rEqsL', rEqsL)

    //check
    if (errTemp !== null) {
        return //若連線取得資料有錯則直接跳出, 不報錯
    }

    // //get, 小區域有感地震
    // let rEqsS = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0016-001?Authorization=${token}`)
    //     .catch((err) => {
    //         errTemp = err
    //     })
    // // console.log('rEqsS', rEqsS)

    // //check
    // if (errTemp !== null) {
    //     return //若連線取得資料有錯則直接跳出, 不報錯
    // }

    //eqsL
    let eqsL1 = get(rEqsL, 'data.records.earthquake', [])
    let eqsL2 = get(rEqsL, 'data.records.Earthquake', [])
    let eqsL = [...eqsL1, ...eqsL2]
    if (!isearr(eqsL)) {
        console.log('rEqsL', rEqsL)
        throw new Error(`無法取得顯著有感地震之earthquake數據`)
    }
    // console.log('eqsL', eqsL)

    // //eqsS
    // let eqsS1 = get(rEqsS, 'data.records.earthquake', [])
    // let eqsS2 = get(rEqsS, 'data.records.Earthquake', [])
    // let eqsS = [...eqsS1, ...eqsS2]
    // if (!isearr(eqsS)) {
    //     console.log('rEqsS', rEqsS)
    //     throw new Error(`無法取得小區域有感地震之earthquake數據`)
    // }
    // // console.log('eqsS', eqsS)

    //ds
    // let ds = [...eqsL, ...eqsS]
    let ds = eqsL
    // console.log(ds)

    let eqs = []
    each(ds, (v) => {

        //originTime, '2025-06-15 05:07:13'
        let originTime1 = get(v, 'earthquakeInfo.originTime', '')
        let originTime2 = get(v, 'EarthquakeInfo.OriginTime', '') //氣象署2023-01-03新格式
        let originTime = originTime1 || originTime2
        if (!isestr(originTime)) {
            console.log('v', v)
            throw new Error(`無法取得originTime[${originTime}]`)
        }

        //magnitudeType
        let magnitudeType1 = get(v, 'earthquakeInfo.magnitude.magnitudeType', '')
        let magnitudeType2 = get(v, 'EarthquakeInfo.EarthquakeMagnitude.MagnitudeType', '') //氣象署2023-01-03新格式
        let magnitudeType = magnitudeType1 || magnitudeType2
        if (!isestr(magnitudeType)) {
            console.log('v', v)
            throw new Error(`無法取得magnitudeType[${magnitudeType}]`)
        }

        //magnitudeValue
        let magnitudeValue1 = get(v, 'earthquakeInfo.magnitude.magnitudeValue', '')
        let magnitudeValue2 = get(v, 'EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue', '') //氣象署2023-01-03新格式
        let magnitudeValue = magnitudeValue1 || magnitudeValue2
        if (!isnum(magnitudeValue)) { //數據為值須用isnum偵測
            console.log('v', v)
            throw new Error(`無法取得magnitudeValue[${magnitudeValue}]`)
        }
        // console.log(originTime, magnitudeType, magnitudeValue)

        //description
        let description = get(v, 'ReportContent', '')

        //ml
        let ml = magnitudeValue
        ml = cstr(ml)

        //t
        let t = ot(originTime)

        //地震id
        let id = get(v, 'EarthquakeNo', '')
        id = cstr(id)

        let number = strdelleft(id, 3) //剔除左側3位民國年

        let timeRec = originTime

        let time = t.format('YYYY-MM-DDTHH:mm:ssZ') //轉UTC時間

        let timeTag = t.format('YYYYMMDDHHmmss')

        let depth = get(v, 'EarthquakeInfo.FocalDepth', '')
        depth = cstr(depth)

        let location = get(v, 'EarthquakeInfo.Epicenter.Location', '')

        let longitude = get(v, 'EarthquakeInfo.Epicenter.EpicenterLongitude', '')
        longitude = cstr(longitude)

        let latitude = get(v, 'EarthquakeInfo.Epicenter.EpicenterLatitude', '')
        latitude = cstr(latitude)

        //eq
        let eq = {
            id, //地震id
            tag: '', //地震戳記
            number, //當年地震編號
            time, //地震UTC時間
            timeRec, //地震顯示時間
            timeTag, //地震戳記時間
            ml, //芮式規模
            depth, //深度(km)
            description, //地震描述
            location, //地震位置
            intensity: '', //最大震度
            longitude, //經度WGS84
            latitude, //緯度WGS84
        }
        if (keepAllData) {
            eq.data = v
        }

        //push
        eqs.push(eq)

    })
    // console.log('eqs', eqs)

    return eqs
}


export default downloadEqs
