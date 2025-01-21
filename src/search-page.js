const axios = require('axios');
const getTime = require('./util/getTime')
const printLog = require('./util/printLog')

const host = ['h', 't', 't', 'p', 's', ':', '/', '/', 'r', 'a', 'p', 't', 'o', 'r', '.', 'm', 'w', 's', '.', 's', 'a', 'n', 'k', 'u', 'a', 'i', '.', 'c', 'o', 'm'].join('')

const pageConfigList = [
    {
        path: '/pages/poi/poi',
        pageId: '6319467'
    }
]
// 1737362760000
// 1737364560000
const startTime = (new Date('2025-01-19')).getTime()
const endTime = (new Date('2025-01-20')).getTime()

Promise.all(pageConfigList.map(({ path, pageId }) => {
    const projectId = 2621
    return fetchAPIData(startTime, endTime, projectId, pageId).then(val => ({ path, val}))
})).then((list) => {
    console.table(list)
})

// 自定义请求头
const customHeaders = {
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

async function fetchAPIData(start,end, projectId, pageId) {
    const url = `${host}/cat/mp/speed/performance?type=MINUTE&start=${start}&end=${end}&projectId=${projectId}&webVersion=all&pageId=${pageId}&metric=TP50&speedPoint=10001&statusCodeId=-1&connectTypeId=-1&mpVerId=-1&mpLibVerId=-1&isPerfInMp=false&perfBundleId=3763&metrics=TP50`
    try {
        const response = await axios.get(url, { headers: customHeaders });
        if (response.data && response.data.code === 10000) {
            hasRequestSUS = true
            const { result } = response.data
            if (result.table && result.table.rows) {
                hasData = true
                result.table.rows.forEach(({ id, main }) => {
                    if (id) {
                        searchLogIdList.push({ id, time: main })
                    }
                })
            }
        }
        return searchLogIdList
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
    }
}
