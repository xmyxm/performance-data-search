const axios = require('axios');
const { host, cookie } = require('./util/config')

const startLong = (new Date('2025-02-06 00:00:00')).getTime()
const endLong = (new Date('2025-02-12 23:59:59')).getTime()
const projectId = 2621

fetchErrorCountAPIData(projectId, startLong, endLong).then(res => {
    console.log(`========== JS异常总数：${res}`)
})

const querySQL = `SELECT COUNT(*) FROM mart_shplat.dpdm_mkt_freeflow_eco_detail_d t1583295_0 WHERE t1583295_0.hp_cal_dt BETWEEN '2025-02-06' AND '2025-02-12' AND t1583295_0.platform_id = '7'`
console.log(`========== PV总数查询SQL：${querySQL}`)

// 查询JS异常数
async function fetchErrorCountAPIData(projectId, startLong, endLong) {
    const url = `${host}/cat/fe/mplog/trend/errorCount?projectId=${projectId}&webVersion=all&pageId=-1&metric=TP90&speedPoint=11&speedPoint=16&speedPoint=18&speedPoint=25&statusCodeId=-1&connectTypeId=-1&mpVerId=-1&mpLibVerId=-1&isPerfInMp=false&perfBundleId=3763&limit=10&offset=0&unionId=&pvId=&queryParam=%7B%22LEVEL%22%3A%5B%22error%22%5D%7D&timeSize=DAILY&startLong=${startLong}&endLong=${endLong}`
    try {
        // 自定义请求头
        const customHeaders = {
            cookie,
            'M-TRACEID': 3236369310626240974,
            'sec-ch-ua-platform': 'macOS',
            'M-APPKEY': 'fe_cat-fe-static',
            'referer': `${host}`,
            'sec-ch-ua': 'Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24',
            'sec-ch-ua-mobile': false,
            'x-requested-with': 'XMLHttpRequest, XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
        };
        const response = await axios.get(url, { headers: customHeaders }).catch(
            e => console.error(e)
        );
        let val = 0
        if (response.data && response.data.code === 10000) {
            const { result } = response.data
           if (result.content) {
            val = result.content
           }
        }
        return val
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
    }
}
