const axios = require('axios');
const { host, cookie } = require('./util/config')

const startTime = (new Date('2025-02-12 00:00:00')).getTime()
const endTime = (new Date('2025-02-12 23:59:59')).getTime()

const pageConfigList = [
    {
        name: '首页',
        path: '/pages/home/home',
        pageId: '663598'
    },
    {
        name: '优惠搜',
        path: '/pages/group/group',
        pageId: '524321'
    },
    {
        name: '商户详情页(美食、休娱)',
        path: '/pages/poi/poi',
        pageId: '6319467'
    },
    {
        name: '商户详情页(其它类目)',
        path: 'packages/detail/pages/detail/detail',
        pageId: '11492'
    },
    {
        name: '美食频道页',
        path: 'packages/search/pages/foodchannel/foodchannel',
        pageId: '3720556'
    },
    {
        name: '美食搜索结果页',
        path: 'packages/search/pages/searchresultlist/searchresultlist',
        pageId: '6550184'
    },
    {
        name: '其它类目搜索结果页',
        path: 'packages/search/pages/list/list',
        pageId: '11510'
    },
    {
        name: '搜索热词页',
        path: 'pages/websearch/websearch',
        pageId: '5275619'
    },
    {
        name: '分店列表（餐、综）',
        path: 'packages/branch/pages/list/list',
        pageId: '11504'
    },
    {
        name: '美食分店列表（餐：神会员）',
        path: 'packages/branch/pages/mslist/mslist',
        pageId: '13343855'
    },
    {
        name: '商户相册页',
        path: 'packages/detail/pages/shopalbum/shopalbum',
        pageId: '9935418'
    },
    {
        name: '个人中心',
        path: '/pages/my/my',
        pageId: '11413'
    },
    {
        name: '登录页',
        path: '/pages/login/login',
        pageId: '11535'
    },
    {
        name: '隐私政策页',
        path: '/pages/privacy/privacy',
        pageId: '8447288'
    },
    {
        name: 'webview容器',
        path: '/pages/webview/webview',
        pageId: '11406'
    },
    {
        name: '我的订单列表',
        path: 'packages/order/pages/myorder/myorder',
        pageId: '11457'
    },
    {
        name: '我的收藏列表',
        path: 'packages/my/pages/usercollection/usercollection',
        pageId: '5448020'
    },
    {
        name: '个人主页',
        path: 'packages/user/pages/personal/personal',
        pageId: '11473'
    },
    {
        name: '我的点评名片页',
        path: 'packages/user/pages/card/card',
        pageId: '11476'
    },
    {
        name: '好友来过列表页',
        path: 'packages/friends/pages/shopcome/index',
        pageId: '11519'
    },
]

Promise.all(pageConfigList.map(({ name, path, pageId }) => {
    const projectId = 2621
    const metricList = ['AVG', 'TP50', 'TP90']
    const data = { name, path }
    const promiseList = []
    metricList.forEach((metric, index) => {
        promiseList.push(fetchPerformanceAPIData(startTime, endTime, projectId, pageId, metric).then(val => { data[(index + 1) + '.' + metric] = val }))
        promiseList.push(fetchDurationDistributionAPIData(startTime, endTime, projectId, pageId).then(val => { data['4.second'] = val }))
        promiseList.push(fetchDimensionDistributionAPIData(startTime, endTime, projectId, pageId).then(val => { data['5.ios'] = val.ios; data['6.android'] = val.android }))
    })
    return Promise.all(promiseList).then(() => data)
})).then((list) => {
    console.table(list)
})

function calculateAverage(arr) {
    if (arr.length === 0) return 0; // 防止除以零的情况
    const sum = arr.reduce((accum, current) => accum + current, 0);
    return sum / arr.length;
}

function roundToTwoDecimals(num) {
    if (num) {
        return Math.round(num * 100) / 100; // 四舍五入并保留两位小数
    }
    return 0
}

// AVG、TP50、TP90 指标查询
async function fetchPerformanceAPIData(start,end, projectId, pageId, metric) {
    const url = `${host}/cat/mp/speed/performance?type=MINUTE&start=${start}&end=${end}&projectId=${projectId}&webVersion=all&pageId=${pageId}&speedPoint=10001&statusCodeId=-1&connectTypeId=-1&mpVerId=-1&mpLibVerId=-1&isPerfInMp=false&perfBundleId=3763&metrics=${metric}`
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
            if (result.columns && result.rows) {
                const name = result.columns[1]
                val = roundToTwoDecimals(calculateAverage(result.rows.map((item) => {
                    return item[name]
                })))
            }
        }
        return val
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
    }
}

// 1秒内用户占比
async function fetchDurationDistributionAPIData(start,end, projectId, pageId, metric = 'TP90') {
    const url = `${host}/cat/mp/speed/durationDistribution?type=MINUTE&start=${start}&end=${end}&projectId=${projectId}&webVersion=all&pageId=${pageId}&metric=${metric}&speedPoint=10001&statusCodeId=-1&connectTypeId=-1&mpVerId=384&mpLibVerId=-1&isPerfInMp=false&perfBundleId=3763`
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
            if (result.rows) {
                const resultList = result.rows.filter((item) => item.onReady)
                const durationNameList = ['0~200ms', '200~400ms', '400~600ms', '600~800ms', '800~1000ms']
                const count = resultList.reduce((accumulator, current) => {
                    return accumulator + current.onReady; // 累加 value 字段
                }, 0);
                const mini = resultList.filter((item) => durationNameList.indexOf(item.duration) > -1).reduce((accumulator, current) => {
                    return accumulator + current.onReady; // 累加 value 字段
                }, 0);
                if (mini && count) {
                    val = Math.floor(100 * mini / count) / 100
                }
            }
        }
        return val
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
    }
}


// 1秒内用户占比
async function fetchDimensionDistributionAPIData(start,end, projectId, pageId, metric = 'TP90') {
    const url = `${host}/cat/mp/speed/dimensionDistribution?type=MINUTE&start=${start}&end=${end}&projectId=${projectId}&webVersion=all&pageId=${pageId}&metric=${metric}&speedPoint=10001&statusCodeId=-1&connectTypeId=-1&mpVerId=384&mpLibVerId=-1&isPerfInMp=false&perfBundleId=3763&groupBy=os`
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
            if (result.rows) {
                const androidData = result.rows.find((item) => item.os === 'Android')
                const iOSData = result.rows.find((item) => item.os === 'iOS')
                if (androidData && iOSData) {
                    val = {
                        ios: iOSData.onReady,
                        android: androidData.onReady,
                    }
                }
            }
        }
        return val
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
    }
}
