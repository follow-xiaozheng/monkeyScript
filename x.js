

let url = 'https://mms.pinduoduo.com/mercury/mms/afterSales/queryList'

fetch(url, {
    method: "post",
    headers: {
        "Content-Type": "application/json",
    },
    body:{
        afterSalesType: 2,
        mallRemarkStatus: null,
        mallRemarkTag: null,
        orderByCreatedAtDesc: true,
        page: 1,
        pageNumber: 1,
        pageSize: 10,
        quickSearchType: 4
    }
})
    .then((res) => res.json())



