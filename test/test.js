document.getElementsByClassName('btn')[0].addEventListener('click',function() {
    apiLogisticsState()
})



// 获取物流状态 是否停发
function apiLogisticsState(address = "广东省 广州市 白云区 XXXX") {
    // 详细地址分割  0省份 1市  2区 3详细地址
    const addressArr = address.split(' ');
    // 物流状态 停发与否
    let logisticsState ;
   $.ajax({
    type: "post",
    url: "https://www.kuaidi100.com/apicenter/order.do?method=expressStopInquiries",
    data: {
        platform: "WWW",
        toProvince: addressArr[0],
        toCity: addressArr[1],
        toArea: addressArr[2],
        toAddress: addressArr[3].length<=3?addressArr[4]:addressArr[3]
        },
    dataType: "dataType",
    success: function (res) {
        console.log(res.data);
        logisticsState = res.data.toReachable;
    }
   });

   setTimeout(() => {
        return logisticsState
   }, 500);
}